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
    const { reason, duration_days = 7 } = body;

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const endAt = new Date();
    endAt.setDate(endAt.getDate() + duration_days);

    // Create Suspension Record
    await prisma.userSuspension.create({
      data: {
        userId: id,
        adminId: admin.id,
        reason,
        endAt,
      },
    });

    // Update User bannedUntil
    await prisma.user.update({
      where: { id },
      data: { bannedUntil: endAt },
    });

    // Create Audit Log
    await prisma.adminActionLog.create({
      data: {
        adminId: admin.id,
        action: 'SUSPEND',
        targetType: 'USER',
        targetId: id,
        reason,
        metadata: { duration_days }
      }
    });

    await prisma.moderationAction.create({
      data: {
        adminId: admin.id,
        actionType: 'BLOCK',
        targetType: 'USER',
        targetId: id,
        notes: reason
      }
    });

    return NextResponse.json({ success: true, endAt });
  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
