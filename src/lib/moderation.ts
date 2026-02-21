import { prisma } from './prisma';

export async function checkEnforcementStatus(userId: string) {
  // 1. Permanent Ban
  const activeBan = await prisma.userBan.findFirst({
    where: { userId, revokedAt: null }
  });
  if (activeBan) return { status: 'PERMA_BANNED', reason: activeBan.reason };

  // 2. Suspension
  const activeSuspension = await prisma.userSuspension.findFirst({
    where: {
      userId,
      revokedAt: null,
      endAt: { gt: new Date() }
    }
  });
  if (activeSuspension) return { status: 'SUSPENDED', reason: activeSuspension.reason };

  // 3. Warning (only unacknowledged)
  const activeWarn = await prisma.userWarn.findFirst({
    where: { userId, acknowledged: false }
  });
  if (activeWarn) return { status: 'WARN', reason: activeWarn.reason };

  return { status: 'CLEAR', reason: null };
}
