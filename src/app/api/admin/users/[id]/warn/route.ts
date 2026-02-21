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
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create Warn Record
    await prisma.userWarn.create({
      data: {
        userId: id,
        adminId: admin.id,
        reason,
        acknowledged: false,
      },
    });

    // Create Audit Log
    await prisma.adminActionLog.create({
      data: {
        adminId: admin.id,
        action: 'WARN',
        targetType: 'USER',
        targetId: id,
        reason,
      }
    });

    // Also write to old moderation logs for backwards compatibility with UI
    await prisma.moderationAction.create({
      data: {
        adminId: admin.id,
        actionType: 'WARN',
        targetType: 'USER',
        targetId: id,
        notes: reason
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error warning user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
