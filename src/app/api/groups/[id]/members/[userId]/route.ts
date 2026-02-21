import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// PATCH /api/groups/[id]/members/[userId] - Update member role (Admin/Owner only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId, userId } = await params;
    const { role } = await request.json();

    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.email },
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if requester is group admin or owner
    const adminMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: groupId,
          userId: adminUser.id,
        },
      },
    });

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { ownerUserId: true }
    });

    const isOwner = group?.ownerUserId === adminUser.id;
    const isAdmin = adminMembership?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Check if target member exists
    const targetMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: groupId,
          userId: userId,
        },
      },
    });

    // Cannot demote/promote if target is owner
    if (group?.ownerUserId === userId) {
        return NextResponse.json({ error: 'Cannot modify owner role' }, { status: 403 });
    }

    const updated = await prisma.groupMember.update({
      where: {
        groupId_userId: {
          groupId: groupId,
          userId: userId,
        },
      },
      data: { role },
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/groups/[id]/members/[userId] - Remove member (Admin/Owner only, or self)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId, userId } = await params;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Self-removal is always allowed (leave group), unless owner
    const isSelf = currentUser.id === userId;

    const adminMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: groupId,
          userId: currentUser.id,
        },
      },
    });

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { ownerUserId: true }
    });

    const isOwner = group?.ownerUserId === currentUser.id;
    const isAdmin = adminMembership?.role === 'ADMIN';

    if (!isSelf && !isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check target
    const targetMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: groupId,
          userId: userId,
        },
      },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (group?.ownerUserId === userId) {
        return NextResponse.json({ error: 'Owner cannot leave group without transferring ownership' }, { status: 403 });
    }

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: groupId,
          userId: userId,
        },
      },
    });

    // Update group member count
    await prisma.group.update({
        where: { id: groupId },
        data: { memberCount: { decrement: 1 } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
