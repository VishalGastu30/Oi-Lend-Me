import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

export async function POST(
  request: NextRequest,
) {
  try {
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

    // Acknowledge all pending warnings for the user
    await prisma.userWarn.updateMany({
      where: { userId: user.id, acknowledged: false },
      data: { acknowledged: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error acknowledging warnings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
