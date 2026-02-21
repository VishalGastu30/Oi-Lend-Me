import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseBody, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-utils';
import { z } from 'zod';

const inviteUserSchema = z.object({
  email: z.string().email(), // Invite by email for now
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();
    const { id } = await params;

    const { data, error } = await parseBody(request, inviteUserSchema);
    if (error) return error;
    if (!data) return errorResponse('Invalid input', 400);

    // Check if requester is ADMIN
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: session.userId,
        },
      },
    });

    if (!membership || membership.role !== 'ADMIN') {
      return forbiddenResponse('Only admins can invite members');
    }

    // Find user to invite
    const userToInvite = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!userToInvite) {
      return notFoundResponse('User with this email not found');
    }

    // Check if already member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: userToInvite.id,
        },
      },
    });

    if (existingMember) {
      return errorResponse('User is already a member', 409);
    }

    await prisma.groupMember.create({
      data: {
        groupId: id,
        userId: userToInvite.id,
        role: 'MEMBER',
      },
    });

    return successResponse({ success: true, message: 'Member added' });
  } catch (e) {
    console.error('Invite Member error:', e);
    return errorResponse('Internal server error', 500);
  }
}
