import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// POST /api/groups/requests/[id]/approve - Approve group creation (Super Admin only)
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

    const groupRequest = await prisma.groupRequest.findUnique({
      where: { id },
      include: { requester: true },
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

    // Create slug from group name
    const slug = groupRequest.groupName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Create the group
    const group = await prisma.group.create({
      data: {
        slug,
        name: groupRequest.groupName,
        category: groupRequest.category,
        description: groupRequest.shortDescription || '',
        ownerUserId: groupRequest.requesterId,
        isVerified: true,
        visibility: 'PUBLIC',
        memberCount: 1,
        itemCount: 0,
      },
    });

    // Add requester as admin member
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: groupRequest.requesterId,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    // Update request status
    await prisma.groupRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // Create action log
    await prisma.groupActionLog.create({
      data: {
        groupId: group.id,
        actorId: user.id,
        actionType: 'GROUP_APPROVED',
        notes: `Group approved by super admin ${user.name}`,
      },
    });

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: groupRequest.requesterId,
        type: 'SYSTEM',
        message: `Your group "${groupRequest.groupName}" has been approved!`,
        resourcePath: `/groups/${group.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      group,
    });
  } catch (error) {
    console.error('Error approving group request:', error);
    return NextResponse.json(
      { error: 'Failed to approve group request' },
      { status: 500 }
    );
  }
}
