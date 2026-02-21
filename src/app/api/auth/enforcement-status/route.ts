import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-edge';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId } = session;

  // 1. Check for Permanent Ban
  const activeBan = await prisma.userBan.findFirst({
    where: {
      userId,
      revokedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (activeBan) {
    return NextResponse.json({
      status: 'PERMA_BANNED',
      reason: activeBan.reason,
      suspensionEndsAt: null,
    }, { headers: NO_CACHE_HEADERS });
  }

  // 2. Check for Active Suspension
  const activeSuspension = await prisma.userSuspension.findFirst({
    where: {
      userId,
      revokedAt: null,
      endAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (activeSuspension) {
    return NextResponse.json({
      status: 'SUSPENDED',
      reason: activeSuspension.reason,
      suspensionEndsAt: activeSuspension.endAt.toISOString(),
    }, { headers: NO_CACHE_HEADERS });
  }

  // 3. Check for Unacknowledged Warning
  const activeWarning = await prisma.userWarn.findFirst({
    where: {
      userId,
      acknowledged: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (activeWarning) {
    return NextResponse.json({
      status: 'WARN',
      reason: activeWarning.reason,
      suspensionEndsAt: null,
    }, { headers: NO_CACHE_HEADERS });
  }

  // 4. Default: Clear
  return NextResponse.json({
    status: 'CLEAR',
    reason: null,
    suspensionEndsAt: null,
  }, { headers: NO_CACHE_HEADERS });
}

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export const dynamic = 'force-dynamic';
