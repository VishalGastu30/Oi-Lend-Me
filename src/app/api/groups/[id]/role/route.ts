import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseBody, successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-utils';
import { z } from 'zod';
import { GroupRole } from '@prisma/client';

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.nativeEnum(GroupRole),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();
    const { id } = await params;

    const { data, error } = await parseBody(request, updateRoleSchema);
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
      return forbiddenResponse('Only admins can update roles');
    }

    await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId: id,
          userId: data.userId,
        },
      },
      data: { role: data.role },
    });

    return successResponse({ success: true });
  } catch (e) {
    console.error('Update Role error:', e);
    // Handle record not found
    return errorResponse('Internal server error', 500);
  }
}
