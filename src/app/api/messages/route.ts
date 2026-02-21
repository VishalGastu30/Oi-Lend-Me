import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseBody, successResponse, errorResponse, unauthorizedResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-utils';
import { z } from 'zod';

const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();

    const { data, error } = await parseBody(request, sendMessageSchema);
    if (error) return error;
    if (!data) return errorResponse('Invalid input', 400);

    const { conversationId, content } = data;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        userA: true,
        userB: true,
        requests: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { item: true }
        }
      },
    });

    if (!conversation) return notFoundResponse('Conversation not found');
    if (conversation.status === 'LOCKED') return errorResponse('This conversation is locked', 403);


    const isParticipant = conversation.userAId === session.userId || conversation.userBId === session.userId;
    if (!isParticipant) return forbiddenResponse('You are not a participant');

    // Determine recipient ID (used for both block check and notification)
    const recipientId = conversation.userAId === session.userId ? conversation.userBId : conversation.userAId;

    // Check if users have blocked each other
    const blockCheck = await prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockerId: session.userId, blockedId: recipientId },
          { blockerId: recipientId, blockedId: session.userId },
        ],
      },
    });

    if (blockCheck) {
      return forbiddenResponse('Cannot send message to blocked user');
    }

    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.userId,
        content,
      },
      include: {
          sender: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    // Update lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    if (recipientId) {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'MESSAGE',
          message: `Message from ${newMessage.sender.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
          resourcePath: `/chat/${conversationId}`
        }
      });
    }

    return successResponse(newMessage, 201);
  } catch (e) {
    console.error('Send Message error:', e);
    return errorResponse('Internal server error', 500);
  }
}
