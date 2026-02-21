import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-utils';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const updateGroupSchema = z.object({
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  category: z.enum(['ACADEMIC', 'HOSTEL', 'CLUB', 'HOBBY', 'EVENT']).optional(),
});

// GET /api/groups/[id] - Fetch group details
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { id } = params;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const group = await prisma.group.findFirst({
      where: isUuid ? { OR: [{ id }, { slug: id }] } : { slug: id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return notFoundResponse('Group not found');
    }

    return successResponse({ group });
  } catch (error) {
    console.error('Group fetch error:', error);
    return errorResponse('Failed to fetch group', 500);
  }
}

// PUT /api/groups/[id] - Update group details (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || !session.userId) return unauthorizedResponse();

    const { id } = await params;

    // Verify Admin Access
    const group = await prisma.group.findUnique({
        where: { id },
        include: { 
            members: { where: { userId: session.userId } },
            owner: true
        }
    });
    
    if (!group) return notFoundResponse('Group not found');

    const isOwner = group.owner.id === session.userId;
    const isMemberAdmin = group.members[0]?.role === 'ADMIN';
    
    if (!isOwner && !isMemberAdmin) {
        return errorResponse('Forbidden', 403);
    }

    const body = await request.json();
    const result = updateGroupSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(result.error.message, 400);
    }

    const { description, imageUrl, visibility, category } = result.data;

    const dataToUpdate: any = {};
    if (description !== undefined) dataToUpdate.description = description;
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl || null;
    if (visibility !== undefined) dataToUpdate.visibility = visibility;
    if (category !== undefined) dataToUpdate.category = category;

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: dataToUpdate,
    });

    return successResponse(updatedGroup);
  } catch (error) {
    console.error('Group update error:', error);
    return errorResponse('Failed to update group', 500);
  }
}
