import { ItemStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-utils';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const existingRequest = (await tx.request.findUnique({
        where: { id },
        include: { item: true },
      })) as any;

      if (!existingRequest) throw new Error('NOT_FOUND');
      
      // Authorization: Owner confirms return
      if (existingRequest.item.ownerId !== session.userId) {
        throw new Error('FORBIDDEN');
      }

      if (existingRequest.status !== 'BORROWED') {
        throw new Error('INVALID_STATE');
      }

      const updatedRequest = await tx.request.update({
        where: { id },
        data: { 
            status: 'RETURNED',
            returnedAt: new Date(),
        },
      });

      await tx.item.update({
        where: { id: existingRequest.itemId },
        data: { status: ItemStatus.ARCHIVED }, // CRITICAL: Never set back to AVAILABLE. It goes to Archive/History.
      });

      // Update Karma
      const karmaReward = 5;
      
      // Reward Requester (for returning)
      await tx.user.update({
        where: { id: existingRequest.requesterId },
        data: { karmaScore: { increment: karmaReward } },
      });
      await tx.reputationLog.create({
        data: {
          userId: existingRequest.requesterId,
          changeAmount: karmaReward,
          reason: 'Item returned on time',
          relatedRequestId: id,
        }
      });
      
      const owner = await tx.user.findUnique({
          where: { id: session.userId },
          select: { name: true }
      });
      
      await tx.notification.create({
          data: {
              userId: existingRequest.requesterId,
              type: 'KARMA',
              message: `Your return of ${existingRequest.item.name} was confirmed by ${owner?.name || 'Owner'}. You earned ${karmaReward} Karma!`,
              resourcePath: `/my-items`
          }
      });


      // Reward Owner (for lending)
      await tx.user.update({
        where: { id: existingRequest.item.ownerId! },
        data: { karmaScore: { increment: karmaReward } },
      });
      await tx.reputationLog.create({
        data: {
          userId: existingRequest.item.ownerId!,
          changeAmount: karmaReward,
          reason: 'Lended item successfully',
          relatedRequestId: id,
        }
      });

      // Refined Lock Logic: Only lock if NO other active requests exist
      if (existingRequest.conversationId) {
          const activeRequests = await tx.request.count({
              where: {
                  conversationId: existingRequest.conversationId,
                  id: { not: id },
                  status: { in: ['PENDING', 'APPROVED', 'BORROWED'] }
              }
          });
          
          if (activeRequests === 0) {
              await (tx.conversation.update as any)({
                  where: { id: existingRequest.conversationId },
                  data: { status: 'LOCKED' },
              });
          }
      }

      return updatedRequest;
    });

    return successResponse(result);
  } catch (e: any) {
    console.error('Return Request error:', e);
    if (e.message === 'NOT_FOUND') return notFoundResponse('Request not found');
    if (e.message === 'FORBIDDEN') return forbiddenResponse('Only item owner can confirm return');
    if (e.message === 'INVALID_STATE') return errorResponse('Request must be BORROWED to return', 400);
    return errorResponse('Internal server error', 500);
  }
}
