import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseBody, successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-utils';
import { z } from 'zod';
import { ItemCategory, ItemStatus } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Schema for creating an item
const createItemSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  category: z.nativeEnum(ItemCategory),
  imageUrl: z.string().url().optional(), // Main image
  images: z.array(z.string().url()).optional(), // Additional images
  condition: z.string().optional(),
  lenderNote: z.string().optional(),
  maxLendingDays: z.number().int().positive().optional(),
  deposit: z.number().nonnegative().optional(), // Receive as number, Prisma handles Decimal
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

  if (searchParams.get('suggest') === 'true') {
     const searchStr = search || '';
     const isCategory = Object.values(ItemCategory).includes(searchStr as ItemCategory);
     
     const orConditions: any[] = [
       { name: { contains: searchStr, mode: 'insensitive' } },
       { description: { contains: searchStr, mode: 'insensitive' } } // Also search description for context
     ];

     if (isCategory) {
       orConditions.push({ category: { equals: searchStr as ItemCategory } });
     }

     const suggestions = await prisma.item.findMany({
        where: {
          OR: orConditions,
          status: 'AVAILABLE'
        },
        select: { id: true, name: true, category: true },
        take: 5,
      });
      return successResponse(suggestions);
    }
  
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && Object.values(ItemCategory).includes(category as ItemCategory)) {
      where.category = category as ItemCategory;
    }

    if (status && Object.values(ItemStatus).includes(status as ItemStatus)) {
      where.status = status as ItemStatus;
    } 

    // Default to AVAILABLE if on browse mode (no specific status requested)? 
    // For general browse, usually we want available.
    if (!status && !search) {
       // where.status = 'AVAILABLE'; // Optional: enforce availability for default lists
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where: {
          ...where,
          status: 'AVAILABLE',
          // CRITICAL: Strict Browse Rule
          // If an item has EVER been requested, it is removed from Browse.
          // It implies a 1:1 interaction lifecycle.
          requests: {
             none: {} // strictly no requests
          }
        },
        include: {
          owner: {
            select: { id: true, name: true, avatarUrl: true, karmaScore: true },
          },
          images: {
            orderBy: { orderIndex: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.item.count({ 
        where: {
          ...where,
          status: 'AVAILABLE',
          requests: {
             none: {}
          }
        }
      }),
    ]);

    return successResponse({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error('Get Items error:', e);
    return errorResponse('Internal server error', 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();

    // Check Content-Type to decide how to parse
    const contentType = request.headers.get("content-type") || "";
    
    let itemData: any = {};
    let files: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      
      // Extract text fields
      itemData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as ItemCategory,
        groupId: formData.get("groupId") ? (formData.get("groupId") as string) : undefined,
        condition: formData.get("condition") ? (formData.get("condition") as string) : undefined,
        lenderNote: formData.get("lenderNote") ? (formData.get("lenderNote") as string) : undefined,
        maxLendingDays: formData.get("maxLendingDays") ? parseInt(formData.get("maxLendingDays") as string) : undefined,
        deposit: formData.get("deposit") ? parseFloat(formData.get("deposit") as string) : undefined,
      };

      // Extract files
      files = formData.getAll("images") as File[];
    } else {
      // JSON fallback (legacy or no images)
      const json = await request.json();
      const { images: jsonImages, ...jsonData } = json; 
      itemData = jsonData;
      // We don't support JSON image uploads in this flow anymore properly, but keeping structure
    }

    // Validate using Zod (partial validation since we constructed itemData manually)
    // We can reuse createItemSchema but might need to relax 'images' validation or handle it separately
    // Let's validate the core fields
    const parsed = createItemSchema.omit({ images: true, imageUrl: true }).safeParse(itemData);
    
    if (!parsed.success) {
      return errorResponse('Invalid input: ' + parsed.error.message, 400);
    }
    const validatedData = parsed.data;

    // Transaction to create item and images
    const newItem = await prisma.$transaction(async (tx) => {
      const item = await tx.item.create({
        data: {
          ...validatedData,
          ownerId: session.userId,
          status: 'AVAILABLE',
          imageUrl: null, // Will be updated if images are uploaded
        },
      });

      if (files.length > 0) {
        const uploadDir = path.join(process.cwd(), 'storage/item-images', item.id);
        await fs.mkdir(uploadDir, { recursive: true });

        const imageRecords = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const buffer = Buffer.from(await file.arrayBuffer());
          // Simple extension extraction or default to bin/jpg
          const nameParts = file.name.split('.');
          const ext = nameParts.length > 1 ? `.${nameParts.pop()}` : '.jpg';
          const fileName = `${crypto.randomUUID()}${ext}`;
          const filePath = path.join(uploadDir, fileName);
          
          await fs.writeFile(filePath, buffer);

          const publicUrl = `/api/storage/item-images/${item.id}/${fileName}`; // Assuming storage route is /api/storage or similar. 
          // Wait, previous storage route was /storage/[...path] which maps to src/app/storage/[...path]/route.ts
          // But Next.js App Router route hierarchy: src/app/storage/[...path]/route.ts -> /storage/... 
          // So URL should be /storage/item-images/${item.id}/${fileName}

          const fileUrl = `/storage/item-images/${item.id}/${fileName}`;

          imageRecords.push({
            itemId: item.id,
            url: fileUrl,
            orderIndex: i,
            isPrimary: i === 0,
          });
        }

        if (imageRecords.length > 0) {
            await tx.itemImage.createMany({ data: imageRecords });
            
            // Update item with primary image URL for easy access
            await tx.item.update({
                where: { id: item.id },
                data: { imageUrl: imageRecords[0].url }
            });
            item.imageUrl = imageRecords[0].url; // Update local object for response
        }
      } else if (itemData.imageUrl) {
          // If JSON had imageUrl (legacy placeholder), keep it? 
          // User requirement: "Default images should be used ONLY IF User uploads zero images"
          // If User uploads nothing, we might want to assign a default based on category, 
          // BUT the prompt says "Automatically assigns default images... This is a BLOCKER".
          // It also says "Default images should be used ONLY IF User uploads zero images".
          // So if NO files, we can fallback to a placeholder if we want, or just leave it null.
          // The current code passes a placeholder in JSON content. 
          // If we are in Multipart mode and no files, we have no images.
          // We can assign a default here if we want.
          // Let's leave it null or generic default so the UI handles it or we assign a static default.
           const defaultImage = "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80";
           await tx.item.update({
                where: { id: item.id },
                data: { imageUrl: defaultImage }
           });
           item.imageUrl = defaultImage;
      }

      return item;
    });

    return successResponse(newItem, 201);
  } catch (e) {
    console.error('Create Item error:', e);
    return errorResponse('Internal server error', 500);
  }
}
