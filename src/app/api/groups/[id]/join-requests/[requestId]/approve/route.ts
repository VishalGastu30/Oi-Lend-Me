import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// POST /api/groups/[id]/join-requests/[requestId]/approve
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const { id, requestId } = await params;
    const session = await getSession();
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is group admin
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: user.id,
        },
      },
    });

    if (!membership || membership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Group Admin access required' },
        { status: 403 }
      );
    }

    const joinRequest = await prisma.groupJoinRequest.findUnique({
      where: { id: requestId },
    });

    if (!joinRequest || joinRequest.groupId !== id) {
      return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
    }

    if (joinRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Join request already processed' }, { status: 400 });
    }

    // Create group member
    await prisma.groupMember.create({
      data: {
        groupId: id,
        userId: joinRequest.userId,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });

    // Update join request
    await prisma.groupJoinRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' },
    });

    // Update member count
    await prisma.group.update({
      where: { id },
      data: { memberCount: { increment: 1 } },
    });

    // Notify applicant
    const group = await prisma.group.findUnique({ where: { id } });
    await prisma.notification.create({
      data: {
        userId: (joinRequest as any).userId,
        type: 'SYSTEM',
        message: `You've been accepted to ${group?.name}!`,
        resourcePath: `/groups/${id}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving join request:', error);
    return NextResponse.json({ error: 'Failed to approve join request' }, { status: 500 });
  }
}
