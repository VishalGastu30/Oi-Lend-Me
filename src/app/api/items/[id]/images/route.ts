import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-utils';
import { storageService, StorageValidation, STORAGE_LIMITS } from '@/lib/storage/storage.service';
import { LocalStorageService } from '@/lib/storage/local-storage.service';
import type { ItemImage } from '@prisma/client';

/**
 * POST /api/items/[id]/images
 * Upload images for an item
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();

    const { id: itemId } = await params;

    // 2. Verify item exists and user owns it
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { images: true },
    });

    if (!item) {
      return errorResponse('Item not found', 404);
    }

    if (item.ownerId !== session.userId) {
      return errorResponse('You do not own this item', 403);
    }

    // 3. Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
      return errorResponse('No images provided', 400);
    }

    // 4. Validate total image count
    const totalImages = item.images.length + files.length;
    if (totalImages > STORAGE_LIMITS.MAX_IMAGES_PER_ITEM) {
      return errorResponse(
        `Maximum ${STORAGE_LIMITS.MAX_IMAGES_PER_ITEM} images per item allowed. You currently have ${item.images.length} images.`,
        400
      );
    }

    // 5. Validate each file
    for (const file of files) {
      // Check MIME type
      if (!StorageValidation.isAllowedMimeType(file.type)) {
        return errorResponse(
          `Invalid file type: ${file.type}. Allowed types: ${STORAGE_LIMITS.ALLOWED_MIME_TYPES.join(', ')}`,
          400
        );
      }

      // Check file size
      if (!StorageValidation.isValidFileSize(file.size)) {
        return errorResponse(
          `File "${file.name}" exceeds maximum size of ${StorageValidation.getMaxFileSizeFormatted()}`,
          413
        );
      }
    }

    // 6. Get current max order index
    const maxOrderIndex = item.images.length > 0
      ? Math.max(...item.images.map(img => img.orderIndex))
      : -1;

    // 7. Process and save each file
    const uploadedImages: ItemImage[] = [];
    let currentOrderIndex = maxOrderIndex + 1;

    for (const file of files) {
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Generate unique filename
      const filename = LocalStorageService.generateFileName(file.name);
      const relativePath = LocalStorageService.getItemImagePath(itemId, filename);

      // Save to storage
      const uploadResult = await storageService.save(buffer, relativePath, file.type);

      // Determine if this should be primary (first image uploaded to item)
      const isPrimary: boolean = item.images.length === 0 && uploadedImages.length === 0;

      // Create database record
      const imageRecord = await prisma.itemImage.create({
        data: {
          itemId,
          url: uploadResult.url,
          orderIndex: currentOrderIndex,
          isPrimary,
        },
      });

      uploadedImages.push(imageRecord);
      currentOrderIndex++;
    }

    return successResponse({
      message: `Successfully uploaded ${uploadedImages.length} image(s)`,
      images: uploadedImages,
    }, 201);

  } catch (error) {
    console.error('Image upload error:', error);
    return errorResponse('Failed to upload images', 500);
  }
}

/**
 * DELETE /api/items/[id]/images
 * Delete a specific image
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();

    // Get imageId from query params
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return errorResponse('imageId query parameter is required', 400);
    }

    // 2. Find image and verify ownership
    const image = await prisma.itemImage.findUnique({
      where: { id: imageId },
      include: {
        item: {
          select: { ownerId: true },
        },
      },
    });

    if (!image) {
      return errorResponse('Image not found', 404);
    }

    if (image.item.ownerId !== session.userId) {
      return errorResponse('You do not own this item', 403);
    }

    // 3. Extract path from URL
    // URL format: http://localhost:3000/storage/item-images/itemId/filename.jpg
    const urlObj = new URL(image.url);
    const pathParts = urlObj.pathname.split('/storage/');
    if (pathParts.length < 2) {
      return errorResponse('Invalid image URL format', 500);
    }
    const relativePath = pathParts[1];

    // 4. Delete from storage
    try {
      await storageService.delete(relativePath);
    } catch (err) {
      console.error('Failed to delete file from storage:', err);
      // Continue to delete from database even if file deletion fails
    }

    // 5. Delete from database
    await prisma.itemImage.delete({
      where: { id: imageId },
    });

    return successResponse({
      message: 'Image deleted successfully',
    });

  } catch (error) {
    console.error('Image deletion error:', error);
    return errorResponse('Failed to delete image', 500);
  }
}
