import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-utils';
import { RequestService } from '@/services/RequestService';
import { logger } from '@/lib/logger';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorizedResponse();
    const { id } = await params;

    const result = await RequestService.approveRequest(id, session.userId);

    return successResponse(result);
  } catch (e: any) {
    logger.error({ error: e.message }, 'Approve Request error');
    if (e.message === 'NOT_FOUND') return notFoundResponse('Request not found');
    if (e.message === 'FORBIDDEN') return forbiddenResponse('Only item owner can approve requests');
    if (e.message === 'INVALID_STATE') return errorResponse('Request must be PENDING to approve', 400);
    return errorResponse('Internal server error', 500);
  }
}
