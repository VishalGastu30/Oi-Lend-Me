import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// POST /api/groups/requests/[id]/reject - Reject group creation (Super Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !session.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Super Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reason } = body;

    const groupRequest = await (prisma as any).groupRequest.findUnique({
      where: { id },
    });

    if (!groupRequest) {
      return NextResponse.json(
        { error: 'Group request not found' },
        { status: 404 }
      );
    }

    if (groupRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Group request already processed' },
        { status: 400 }
      );
    }

    // Update request status
    await (prisma as any).groupRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewNotes: reason || 'Request rejected by super admin',
      },
    });

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: groupRequest.requesterId,
        type: 'SYSTEM',
        message: `Your group request "${groupRequest.groupName}" was not approved. ${reason || ''}`,
        resourcePath: `/profile/requests`,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error rejecting group request:', error);
    return NextResponse.json(
      { error: 'Failed to reject group request' },
      { status: 500 }
    );
  }
}
