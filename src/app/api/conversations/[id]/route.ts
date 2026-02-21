import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();
    const { id } = await params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
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
          include: { item: true }
        }
      },
    });

    if (!conversation) return notFoundResponse('Conversation not found');

    // Check participation
    const isParticipant = conversation.userAId === session.userId || conversation.userBId === session.userId;

    if (!isParticipant) {
      return forbiddenResponse('You are not a participant in this conversation');
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
            select: {
                id: true,
                name: true,
                avatarUrl: true,
            }
        }
      }
    });

    // Check for Locks (Block or Report)
    const otherUserId = conversation.userAId === session.userId ? conversation.userBId : conversation.userAId;
    
    const blockCheck = await prisma.blockedUser.findFirst({
        where: {
            OR: [
                { blockerId: session.userId, blockedId: otherUserId },
                { blockerId: otherUserId, blockedId: session.userId }
            ]
        }
    });

    const isLocked = conversation.status === 'LOCKED' || !!blockCheck;
    let lockReason = '';
    
    if (conversation.status === 'LOCKED') lockReason = 'This conversation is locked because the item has been returned.';
    if (blockCheck) lockReason = 'This conversation is locked due to a block.';

    // Compute reliable presence (server-side staleness check)
    const now = Date.now();
    const STALE_THRESHOLD = 60 * 1000; // 60 seconds
    const computePresence = (user: any) => {
      if (!user.lastSeen) return { ...user, isOnline: false };
      const lastSeenMs = new Date(user.lastSeen).getTime();
      // If lastSeen older than threshold, override isOnline to false
      const reliableOnline = user.isOnline && (now - lastSeenMs < STALE_THRESHOLD);
      return { ...user, isOnline: reliableOnline };
    };

    return successResponse({
        ...conversation,
        userA: computePresence(conversation.userA),
        userB: computePresence(conversation.userB),
        messages,
        isLocked,
        lockReason
    });
  } catch (e) {
    console.error('Get Messages error:', e);
    return errorResponse('Internal server error', 500);
  }
}
