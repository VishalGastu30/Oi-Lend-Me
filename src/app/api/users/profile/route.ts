import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-utils';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const updateProfileSchema = z.object({
  about: z.string().max(500).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return errorResponse(result.error.message, 400);
    }

    const { about } = result.data;

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        about,
      },
    });

    return successResponse({ about: updatedUser.about });
  } catch (error) {
    console.error('Profile update error:', error);
    return errorResponse('Failed to update profile', 500);
  }
}
