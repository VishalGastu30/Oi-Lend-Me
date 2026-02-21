import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// PATCH /api/groups/[id]/items/[itemId]/status - Update item availability status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, itemId } = await params;
    const { status } = await request.json();

    if (!['AVAILABLE', 'MAINTENANCE', 'ON_LOAN', 'LOST'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Verify admin access
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: user.id } }
    });

    const group = await prisma.group.findUnique({
      where: { id },
      include: { owner: true }
    });

    const isOwner = group?.owner.id === user.id;
    const isAdmin = membership?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const item = await prisma.groupItem.findUnique({ where: { id: itemId } });
    if (!item || item.groupId !== id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updated = await prisma.groupItem.update({
      where: { id: itemId },
      data: { availabilityStatus: status }
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('Error updating item status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
