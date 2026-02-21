import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseBody, successResponse, errorResponse, unauthorizedResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-utils';
import { z } from 'zod';
import { ItemStatus, RequestStatus } from '@prisma/client';

const createRequestSchema = z.object({
  itemId: z.string().uuid(),
  startDate: z.string().datetime(), // ISO date string
  endDate: z.string().datetime(),
  message: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();

    const url = new URL(request.url);
    const groupId = url.searchParams.get('groupId');
    const itemId = url.searchParams.get('itemId');
    const ownerId = url.searchParams.get('ownerId');
    const requesterId = url.searchParams.get('requesterId');
    const status = url.searchParams.get('status');

    const whereClause: any = {};

    // If specific filters are provided, use them (with authorization check implicit or explicit)
    if (ownerId && requesterId) {
        // Fetch specific interaction
        whereClause.requesterId = requesterId;
        whereClause.item = { ownerId: ownerId };
    } else if (ownerId) {
        // Fetch requests where item owner is ownerId
        // Authorization: Can I see requests for another user? 
        // For "My Items", ownerId should be session.userId.
        // If ownerId !== session.userId, maybe block or allow public if functionality requires.
        // Assuming strictly for "My Items": 
        if (ownerId !== session.userId && session.role !== 'ADMIN') {
             // Allow if I am the requester? No, ownerId filter implies listing items *owned* by ownerId.
             // If I am requester, I would use requesterId filter.
             // So strict check:
             return unauthorizedResponse('Cannot view requests for another user');
        }
        whereClause.item = { ownerId: ownerId };
    } else if (requesterId) {
        // Fetch requests made by requesterId
        if (requesterId !== session.userId && session.role !== 'ADMIN') {
             return unauthorizedResponse('Cannot view requests for another user');
        }
        whereClause.requesterId = requesterId;
    } else {
        // Default behavior: fetch all requests involving me (requester OR owner)
        whereClause.OR = [
            { requesterId: session.userId },
            { item: { ownerId: session.userId } },
        ];
    }
    

    if (groupId) {
      // Group context overrides? Or adds to?
      // If groupId is present, we likely want requests within that group.
      // But still respect user visibility. 
      // Existing logic:
      const membership = await prisma.groupMember.findUnique({
         where: {
            groupId_userId: {
              groupId,
              userId: session.userId
            }
         }
      });
      
      if (!membership) return unauthorizedResponse('Not a member of this group');
      
      // If looking at group calendar/requests, we might want ALL group requests.
      // So remove personal filter if intended for group view.
      // But wait, "My Items" doesn't send groupId.
      // So if groupId is sent, it's likely "Group Requests" view.
      // In that case, enable seeing all group requests.
      delete whereClause.OR; 
      delete whereClause.requesterId;
      delete whereClause.item; // careful with this
      
      whereClause.item = { groupId }; // Filter by group
    }
    
    if (itemId) {
       whereClause.itemId = itemId;
    }
    
    if (status) {
        // status can be comma separated
        const statuses = status.split(',') as RequestStatus[];
        whereClause.status = { in: statuses };
    }

    const requests = await prisma.request.findMany({
      where: whereClause,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            ownerId: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(requests);
  } catch (e) {
    console.error('Get Requests error:', e);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();

    const { data, error } = await parseBody(request, createRequestSchema);
    if (error) return error;
    if (!data) return errorResponse('Invalid input', 400);

    const { itemId, startDate, endDate, message } = data;

    // 0. Pre-check: Block Status
    // We need to know who the owner is.
    const itemCheck = await prisma.item.findUnique({ where: { id: itemId }, select: { ownerId: true } });
    if (itemCheck && itemCheck.ownerId) {
        const blockCheck = await prisma.blockedUser.findFirst({
            where: {
                OR: [
                    { blockerId: session.userId, blockedId: itemCheck.ownerId },
                    { blockerId: itemCheck.ownerId, blockedId: session.userId }
                ]
            }
        });
        if (blockCheck) {
            return forbiddenResponse('Cannot request items from this user.');
        }
    }

    // Transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch Item
      const item = await tx.item.findUnique({ where: { id: itemId } });
      
      if (!item) throw new Error('Item not found');
      if (item.ownerId === session.userId) throw new Error('Cannot request your own item');
      if (item.status !== 'AVAILABLE') throw new Error('Item is not available');
      
      // 2. Update Item Status
      await tx.item.update({
        where: { id: itemId },
        data: { status: 'REQUESTED' },
      });

      // 3. Create Request
      const newRequest = await tx.request.create({
        data: {
          itemId,
          requesterId: session.userId,
          status: 'PENDING',
          startDate,
          endDate,
        },
      });

      // 4. Find or Create Conversation
      let conversation = await tx.conversation.findFirst({
        where: {
          OR: [
            { userAId: session.userId, userBId: item.ownerId! },
            { userAId: item.ownerId!, userBId: session.userId },
          ],
        },
      });

      if (!conversation) {
        conversation = await tx.conversation.create({
          data: {
            userAId: session.userId,
            userBId: item.ownerId!,
            status: 'ACTIVE',
          },
        });
      } else if (conversation.status === 'LOCKED') {
        // Unlock existing conversation for new request
        await tx.conversation.update({
          where: { id: conversation.id },
          data: { status: 'ACTIVE' }
        });
      }

      // Link new request to conversation
      await tx.request.update({
        where: { id: newRequest.id },
        data: { conversationId: conversation.id }
      });

      // 5. Create Initial Message
      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.userId,
          content: message,
        },
      });

      // 6. Notify Owner
      if (item.ownerId) {
          const requester = await tx.user.findUnique({
              where: { id: session.userId },
              select: { name: true }
          });
          
          await tx.notification.create({
              data: {
                  userId: item.ownerId,
                  type: 'REQUEST',
                  message: `${requester?.name || 'User'} requested your item: ${item.name}`,
                  resourcePath: `/my-items` // Direct to Approvals tab ideally, but my-items default is fine or logic to open tab
              }
          });
      }

      return newRequest;
    });

    return successResponse(result, 201);
  } catch (e: any) {
    console.error('Create Request error:', e);
    if (e.message === 'Item not found') return notFoundResponse('Item not found');
    if (e.message === 'Cannot request your own item') return errorResponse(e.message, 400);
    if (e.message === 'Item is not available') return errorResponse(e.message, 409);
    
    // Handle Unique Constraint violation from DB partial index if race condition
    if (e.code === 'P2002') {
         return errorResponse('Item already has an active request', 409);
    }
    
    return errorResponse('Internal server error', 500);
  }
}
