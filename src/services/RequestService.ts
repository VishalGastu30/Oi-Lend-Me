import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export class RequestService {
    static async approveRequest(requestId: string, ownerId: string) {
        logger.info({ requestId, ownerId }, 'Approving request via RequestService');
        
        return await prisma.$transaction(async (tx) => {
            const existingRequest = await tx.request.findUnique({
                 where: { id: requestId },
                 include: { item: true },
            });

            if (!existingRequest) throw new Error('NOT_FOUND');
            if (existingRequest.item.ownerId !== ownerId) throw new Error('FORBIDDEN');

            // Optimistic Concurrency Control
            const { count } = await tx.request.updateMany({
                 where: { id: requestId, status: 'PENDING' },
                 data: { status: 'BORROWED' },
            });

            if (count === 0) {
                 logger.warn({ requestId }, 'Concurrency or state invalidation on approve request');
                 throw new Error('INVALID_STATE');
            }

            const updatedRequest = await tx.request.findUnique({ where: { id: requestId } });

            await tx.item.update({
                 where: { id: existingRequest.itemId },
                 data: { status: 'BORROWED' },
            });

            const karmaReward = 3;
            await tx.user.update({
                 where: { id: ownerId },
                 data: { karmaScore: { increment: karmaReward } }
            });

            await tx.reputationLog.create({
                 data: {
                      userId: ownerId,
                      changeAmount: karmaReward,
                      reason: 'Lended item (Approved and given)',
                      relatedRequestId: requestId,
                 }
            });

            const owner = await tx.user.findUnique({
                 where: { id: ownerId },
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
    }
}
