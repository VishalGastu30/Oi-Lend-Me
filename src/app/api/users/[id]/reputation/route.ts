import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if user exists first? Optional, but good for clarity.
    // Optimization: Just query logs directly. Empty list if user doesn't exist or has no logs.

    const logs = await prisma.reputationLog.findMany({
      where: { userId: id },
      include: {
        request: {
          select: {
            id: true,
            item: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to last 20 entries
    });

    return successResponse(logs);
  } catch (e) {
    console.error('Get Reputation error:', e);
    return errorResponse('Internal server error', 500);
  }
}
