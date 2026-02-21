import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// POST /api/groups/requests/[id]/send-back - Send back group request for changes (Super Admin only)
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

    if (!reason) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      );
    }

    const groupRequest = await (prisma as any).groupRequest.findUnique({
      where: { id },
    });

    if (!groupRequest) {
      return NextResponse.json(
        { error: 'Group request not found' },
        { status: 404 }
      );
    }

    // Update request status
    await (prisma as any).groupRequest.update({
      where: { id },
      data: {
        status: 'NEEDS_EDIT',
        reviewNotes: reason,
      },
    });

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: groupRequest.requesterId,
        type: 'SYSTEM',
        message: `Your group request "${groupRequest.groupName}" requires stronger or updated proof. Please resubmit. Reason: ${reason}`,
        resourcePath: `/groups/request?edit=${id}`, // Assuming we can edit via query param or similar
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error sending back group request:', error);
    return NextResponse.json(
      { error: 'Failed to send back group request' },
      { status: 500 }
    );
  }
}
