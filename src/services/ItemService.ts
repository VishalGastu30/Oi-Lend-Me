import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export class ItemService {
    static async createItem(
        itemId: string,
        validatedData: any,
        ownerId: string,
        mainImageUrl: string | null,
        imageRecords: Array<{ itemId: string; url: string; orderIndex: number; isPrimary: boolean }>
    ) {
        logger.info({ itemId, ownerId }, 'Creating item via ItemService');
        
        // Securely run the ultra-fast Database Transaction
        return await prisma.$transaction(async (tx) => {
            const item = await tx.item.create({
                data: {
                    id: itemId,
                    ...validatedData,
                    ownerId,
                    status: 'AVAILABLE',
                    imageUrl: mainImageUrl,
                },
            });

            if (imageRecords.length > 0) {
                await tx.itemImage.createMany({ data: imageRecords });
            }

            return item;
        });
    }
}
