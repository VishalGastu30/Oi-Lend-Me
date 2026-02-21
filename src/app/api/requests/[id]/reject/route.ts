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
      
      // Authorization: Only Item Owner can reject
      if (existingRequest.item.ownerId !== session.userId) {
        throw new Error('FORBIDDEN');
      }

      if (existingRequest.status !== 'PENDING') {
        throw new Error('INVALID_STATE');
      }

      const updatedRequest = await tx.request.update({
        where: { id },
        data: { status: 'REJECTED' },
      });

      // Release Item lock
      await tx.item.update({
        where: { id: existingRequest.itemId },
        data: { status: 'AVAILABLE' },
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

      // Notification
      const owner = await tx.user.findUnique({
          where: { id: session.userId },
          select: { name: true }
      });
      
      await tx.notification.create({
          data: {
              userId: existingRequest.requesterId,
              type: 'REQUEST',
              message: `Your request for ${existingRequest.item.name} was rejected by ${owner?.name || 'Owner'}`,
              resourcePath: `/home`
          }
      });

      return updatedRequest;
    });

    return successResponse(result);
  } catch (e: any) {
    console.error('Reject Request error:', e);
    if (e.message === 'NOT_FOUND') return notFoundResponse('Request not found');
    if (e.message === 'FORBIDDEN') return forbiddenResponse('Only item owner can reject requests');
    if (e.message === 'INVALID_STATE') return errorResponse('Request must be PENDING to reject', 400);
    return errorResponse('Internal server error', 500);
  }
}
