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
      const existingRequest = await tx.request.findUnique({
        where: { id },
        include: { item: true },
      });

      if (!existingRequest) throw new Error('NOT_FOUND');
      
      // Authorization: Only Item Owner can approve
      if (existingRequest.item.ownerId !== session.userId) {
        throw new Error('FORBIDDEN');
      }

      if (existingRequest.status !== 'PENDING') {
        throw new Error('INVALID_STATE');
      }

      // Update request to BORROWED immediately (approval = item given)
      const updatedRequest = await tx.request.update({
        where: { id },
        data: { status: 'BORROWED' },
      });

      // Update item status to BORROWED
      await tx.item.update({
        where: { id: existingRequest.itemId },
        data: { status: 'BORROWED' },
      });

      // Award karma to owner for lending
      const karmaReward = 3;
      await tx.user.update({
        where: { id: session.userId },
        data: { karmaScore: { increment: karmaReward } }
      });

      await tx.reputationLog.create({
        data: {
          userId: session.userId,
          changeAmount: karmaReward,
          reason: 'Lended item (Approved and given)',
          relatedRequestId: id,
        }
      });
      
      // Fetch owner name for notification
      const owner = await tx.user.findUnique({
          where: { id: session.userId },
          select: { name: true }
      });

      await tx.notification.create({
          data: {
              userId: existingRequest.requesterId,
              type: 'REQUEST',
              message: `Your request for ${existingRequest.item.name} was approved! You can now pick it up from ${owner?.name || 'Owner'}`,
              resourcePath: `/my-items`
          }
      });

      return updatedRequest;
    });

    return successResponse(result);
  } catch (e: any) {
    console.error('Approve Request error:', e);
    if (e.message === 'NOT_FOUND') return notFoundResponse('Request not found');
    if (e.message === 'FORBIDDEN') return forbiddenResponse('Only item owner can approve requests');
    if (e.message === 'INVALID_STATE') return errorResponse('Request must be PENDING to approve', 400);
    return errorResponse('Internal server error', 500);
  }
}
