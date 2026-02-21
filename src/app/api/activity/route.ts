import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-utils';
import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();

    const userId = session.userId;

    // Fetch recent borrow requests for the current user (either as requester or owner)
    const recentRequestsPromise = prisma.request.findMany({
      where: {
        OR: [
          { requesterId: userId }, // I requested it
          { item: { ownerId: userId } } // Someone requested my item
        ],
        status: {
          in: ['PENDING', 'APPROVED', 'BORROWED', 'RETURNED', 'REJECTED'],
        },
      },
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
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    // Fetch Group Requests
    const groupRequestsPromise = (prisma as any).groupRequest.findMany({
      where: {
        requesterId: userId
      },
      select: {
        id: true,
        groupName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        requester: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    const [recentRequests, groupRequests] = await Promise.all([recentRequestsPromise, groupRequestsPromise]);

    // Transform to activity format
    const activities: any[] = [];
    
    // Process Item Requests
    recentRequests.forEach(req => {
      const isMyItem = req.item.ownerId === userId;
      
      let type: 'BORROW' | 'LEND' | 'RETURN' | 'GROUP_REQUEST' = 'BORROW';
      
      if (req.status === 'RETURNED') {
          type = 'RETURN';
      } else if (isMyItem) {
          type = 'LEND';
      } else {
          type = 'BORROW';
      }

      // Add the primary event
      activities.push({
        id: req.id,
        type,
        status: req.status,
        isMyItem,
        item: req.item,
        user: req.requester,
        createdAt: req.status === 'RETURNED' && req.returnedAt ? req.returnedAt : req.createdAt,
      });

      // Synthetic 'BORROWED' event
      if (req.status === 'RETURNED' && req.startDate) {
          activities.push({
              id: `${req.id}-past-borrow`,
              type: isMyItem ? 'LEND' : 'BORROW',
              status: 'BORROWED',
              isMyItem,
              item: req.item,
              user: req.requester,
              createdAt: req.startDate,
          });
      }
    });

    // Process Group Requests
    groupRequests.forEach((req: any) => {
      activities.push({
        id: req.id,
        type: 'GROUP_REQUEST',
        status: req.status, // PENDING, APPROVED, REJECTED, NEEDS_EDIT
        isMyItem: false,
        item: { id: req.id, name: req.groupName, imageUrl: null }, // Mock item structure for compatibility
        user: req.requester,
        createdAt: req.updatedAt || req.createdAt // Use updatedAt for status changes
      });
    });

    // Sort by createdAt desc
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return successResponse(activities);
  } catch (error) {
    console.error('Activity fetch error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return errorResponse('Failed to fetch activities', 500);
  }
}
