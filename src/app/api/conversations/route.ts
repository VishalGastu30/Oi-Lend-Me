import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-utils';

export async function GET(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();

    const conversations = await (prisma.conversation as any).findMany({
      where: {
        OR: [
          { userAId: session.userId },
          { userBId: session.userId },
        ],
      },
      include: {
        userA: {
          select: { id: true, name: true, avatarUrl: true, lastSeen: true, isOnline: true }
        },
        userB: {
          select: { id: true, name: true, avatarUrl: true, lastSeen: true, isOnline: true }
        },
        requests: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            item: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                ownerId: true,
              }
            },
            requester: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Transform to maintain frontend compatibility or simplify
    const formatted = (conversations as any[]).map(c => ({
      ...c,
      request: c.requests[0] || null, // UI expects .request
      isLocked: c.status === 'LOCKED',
      lockReason: c.status === 'LOCKED' ? 'This conversation is locked because the item has been returned.' : '',
    }));

    return successResponse(formatted);
  } catch (e) {
    console.error('Get Conversations error:', e);
    return errorResponse('Internal server error', 500);
  }
}
