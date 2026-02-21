import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.email) {
      return NextResponse.json({ status: { type: 'NONE' } });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.email },
      include: {
        warns: {
          where: { acknowledged: false },
          orderBy: { createdAt: 'desc' }
        },
        suspensions: {
          where: { endAt: { gt: new Date() }, revokedAt: null },
          orderBy: { createdAt: 'desc' }
        },
        bans: {
          where: { revokedAt: null }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ status: { type: 'NONE' } });
    }

    // 1. Check Permanent Bans first (highest priority)
    // For legacy support, also check if bannedUntil is far in the future
    const isLegacyBan = user.bannedUntil && new Date(user.bannedUntil).getFullYear() > 2090;
    if (user.bans.length > 0 || isLegacyBan) {
      const reason = user.bans[0]?.reason || "Violation of Terms of Service";
      return NextResponse.json({ status: { type: 'BAN', reason } });
    }

    // 2. Check Suspensions
    const activeSuspension = user.suspensions[0];
    const isLegacySuspension = user.bannedUntil && new Date(user.bannedUntil) > new Date();
    
    if (activeSuspension || isLegacySuspension) {
      const reason = activeSuspension?.reason || "Account temporarily suspended";
      const endAt = activeSuspension?.endAt || user.bannedUntil;
      return NextResponse.json({ status: { type: 'SUSPEND', reason, endAt } });
    }

    // 3. Check Unacknowledged Warnings
    if (user.warns.length > 0) {
      const reason = user.warns[0].reason;
      return NextResponse.json({ status: { type: 'WARN', reason, warnIds: user.warns.map(w => w.id) } });
    }

    return NextResponse.json({ status: { type: 'NONE' } });
  } catch (error) {
    console.error('Error checking moderation status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
