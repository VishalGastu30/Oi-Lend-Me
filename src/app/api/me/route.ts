import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { successResponse, unauthorizedResponse, errorResponse } from '@/lib/api-utils';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();

    const cookieStore = await cookies();
    const viewMode = cookieStore.get('view-mode')?.value || (session.role === 'ADMIN' ? 'admin' : 'user');

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { lastSeen: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        karmaScore: true,
        createdAt: true,
      },
    });

    if (!user) return unauthorizedResponse('User not found');

    return successResponse({ ...user, viewMode });
  } catch (e) {
    console.error('Get Me error:', e);
    return errorResponse('Internal server error', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const { name, role, avatarUrl } = body;

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        role, // Assuming role field is used for 'Major/Title' as per modal
        avatarUrl
      },
      select: {
        id: true,
        name: true,
        role: true,
        avatarUrl: true
      }
    });

    return successResponse(user);
  } catch (e) {
    console.error('Update Me error:', e);
    return errorResponse('Failed to update profile', 500);
  }
}
