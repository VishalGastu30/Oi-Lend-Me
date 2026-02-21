import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-edge';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = session;

  // Mark all unacknowledged warnings for this user as acknowledged
  await prisma.userWarn.updateMany({
    where: {
      userId,
      acknowledged: false,
    },
    data: {
      acknowledged: true,
    },
  });

  return NextResponse.json({ success: true });
}
