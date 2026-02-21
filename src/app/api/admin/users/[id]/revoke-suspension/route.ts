import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.email },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Revoke Suspension Record if exists
    await prisma.userSuspension.updateMany({
      where: { userId: id, revokedAt: null, endAt: { gt: new Date() } },
      data: { revokedAt: new Date() },
    });

    // Update User bannedUntil to null
    await prisma.user.update({
      where: { id },
      data: { bannedUntil: null },
    });

    // Create Audit Log
    await prisma.adminActionLog.create({
      data: {
        adminId: admin.id,
        action: 'REVOKE_SUSPENSION',
        targetType: 'USER',
        targetId: id,
        reason: 'Revoked by admin',
      }
    });

    // We can also create moderation log for consistency
    await prisma.moderationAction.create({
      data: {
        adminId: admin.id,
        actionType: 'WARN', // Using WARN as placeholder
        targetType: 'USER',
        targetId: id,
        notes: 'User suspension revoked'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking suspension:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
