import { prisma } from '@/lib/prisma';
import { successResponse, notFoundResponse, errorResponse } from '@/lib/api-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
        karmaScore: true,
        createdAt: true,
      },
    });

    if (!user) return notFoundResponse('User not found');

    return successResponse(user);
  } catch (e) {
    console.error('Get User error:', e);
    return errorResponse('Internal server error', 500);
  }
}
