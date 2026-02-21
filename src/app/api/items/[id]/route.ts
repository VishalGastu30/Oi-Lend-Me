import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseBody, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-utils';
import { z } from 'zod';
import { ItemCategory, ItemStatus } from '@prisma/client';

const updateItemSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  category: z.nativeEnum(ItemCategory).optional(),
  imageUrl: z.string().url().optional(),
  status: z.nativeEnum(ItemStatus).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, avatarUrl: true, karmaScore: true },
        },
        group: {
          select: { id: true, name: true, imageUrl: true },
        },
        images: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!item) return notFoundResponse('Item not found');

    return successResponse(item);
  } catch (e) {
    console.error('Get Item error:', e);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) return notFoundResponse('Item not found');

    // Check ownership
    if (item.ownerId !== session.userId) {
       return forbiddenResponse('You are not the owner of this item');
    }

    const { data, error } = await parseBody(request, updateItemSchema);
    if (error) return error;
    if (!data) return errorResponse('Invalid input', 400);

    const updatedItem = await prisma.item.update({
      where: { id },
      data,
    });

    return successResponse(updatedItem);
  } catch (e) {
     console.error('Update Item error:', e);
     return errorResponse('Internal server error', 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();

    const { id } = await params;
    const item = await prisma.item.findUnique({ 
        where: { id },
        include: {
            images: true,
            requests: {
                include: {
                    conversation: true
                }
            }
        }
    });

    if (!item) return notFoundResponse('Item not found');

    if (item.ownerId !== session.userId) {
      return forbiddenResponse('You are not the owner of this item');
    }

    // SAFE DELETION: Allow deletion at ANY time with proper cleanup
    // We must bypass the 'enforce_reputation_immutability' trigger for the cascading updates to reputation logs (setting relatedRequestId to NULL)
    await prisma.$transaction(async (tx) => {
        // 1. Delete physical image files from storage
        if (item.images.length > 0) {
            const fs = await import('fs/promises');
            const path = await import('path');
            
            for (const image of item.images) {
                try {
                    const urlPath = image.url.replace(/^\//, ''); // Remove leading slash
                    const filePath = path.join(process.cwd(), urlPath);
                    await fs.unlink(filePath);
                } catch (fileError) {
                    // console.error(`Failed to delete image file: ${image.url}`, fileError);
                }
            }

            try {
                const itemDir = path.join(process.cwd(), 'storage/item-images', id);
                await fs.rmdir(itemDir);
            } catch (dirError) {
                // Directory might not be empty or might not exist
            }
        }

        // 2. Disable Reputation Log Trigger
        await tx.$executeRawUnsafe(`ALTER TABLE reputation_logs DISABLE TRIGGER enforce_reputation_immutability;`);

        try {
            // 3. Delete item (cascades item_images, requests -> sets logs request_id to null via schema constraint)
            await tx.item.delete({ where: { id } });
        } finally {
            // 4. Re-enable Reputation Log Trigger (Must happen even if delete fails)
            await tx.$executeRawUnsafe(`ALTER TABLE reputation_logs ENABLE TRIGGER enforce_reputation_immutability;`);
        }
    });

    return successResponse({ 
        success: true,
        message: 'Item and all related data deleted successfully'
    });
  } catch (e) {
    console.error('Delete Item error:', e);
    return errorResponse('Internal server error', 500);
  }
}
