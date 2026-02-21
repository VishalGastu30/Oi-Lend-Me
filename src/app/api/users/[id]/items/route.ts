
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // changing this to verify if user exists first might seem redundant but good for 404 consistency
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return notFoundResponse('User not found');

    const items = await prisma.item.findMany({
      where: { ownerId: id },
      include: {
        images: {
          orderBy: { orderIndex: 'asc' },
          take: 1, // cover image
        },
        _count: {
          select: { requests: true }
        },
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            karmaScore: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(items);
  } catch (e) {
    console.error('Get User Items error:', e);
    return errorResponse('Internal server error', 500);
  }
}
