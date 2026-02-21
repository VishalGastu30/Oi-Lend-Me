'use server'

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth-edge';
import { redirect } from 'next/navigation';
import { ActionType, EntityType, ReportStatus, ItemStatus, UserRole, FeedbackStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) redirect('/');

  const payload = await verifyJWT<{ userId: string; role: string }>(token);
  if (!payload || payload.role !== 'ADMIN') redirect('/');

  return payload;
}

export async function getAdminStats() {
  await requireAdmin();

  const [totalUsers, totalItems, activeRequests, pendingReports] = await Promise.all([
    prisma.user.count(),
    prisma.item.count(),
    prisma.request.count({
      where: {
        status: {
          in: ['PENDING', 'APPROVED', 'BORROWED']
        }
      }
    }),
    prisma.report.count({
      where: {
        status: 'PENDING'
      }
    })
  ]);

  return {
    totalUsers,
    totalItems,
    activeRequests,
    pendingReports
  };
}

export async function getAdminAnalytics() {
  await requireAdmin();
  
  // Get last 30 days dates
  const dates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
  });
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [users, items] = await Promise.all([
      prisma.user.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { createdAt: true }
      }),
      prisma.item.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { createdAt: true }
      })
  ]);

  // Aggregate by date
  const data = dates.map(date => {
      return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: users.filter(u => u.createdAt.toISOString().split('T')[0] === date).length,
          items: items.filter(i => i.createdAt.toISOString().split('T')[0] === date).length
      };
  });

  return data;
}

export async function getReports(filter: 'ALL' | 'PENDING' | 'REVIEWED' | 'ACTION_TAKEN' | 'DISMISSED' = 'ALL') {
  await requireAdmin();

  const where = filter === 'ALL' ? {} : { status: filter as ReportStatus };

  return prisma.report.findMany({
    where,
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function updateReportStatus(id: string, status: ReportStatus) {
  await requireAdmin();
  await prisma.report.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/admin/reports');
}

export async function getFeedback(status?: FeedbackStatus) {
  await requireAdmin();

  const where = status ? { status } : {};

  return prisma.feedback.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function updateFeedbackStatus(id: string, status: FeedbackStatus) {
  await requireAdmin();
  
  try {
    await prisma.feedback.update({
      where: { id },
      data: { status }
    });
    
    revalidatePath('/admin/feedback');
    return { success: true };
  } catch (error) {
    console.error('Failed to update feedback status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

export async function getModerationLogs() {
  await requireAdmin();

  return prisma.moderationAction.findMany({
    include: {
      admin: {
        select: {
          name: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50 // Recent logs
  });
}

export async function searchEntities(query: string, type: 'USER' | 'ITEM') {
  await requireAdmin();
  
  if (!query) return [];

  if (type === 'USER') {
    return prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        bannedUntil: true
      }
    });
  } else {
    return prisma.item.findMany({
      where: {
         name: { contains: query, mode: 'insensitive' }
      },
      take: 10,
      include: {
        owner: {
          select: { name: true, email: true }
        }
      }
    });
  }
}

export async function getDetailedUserModeration(userId: string) {
  await requireAdmin();

  const [warns, suspensions, bans] = await Promise.all([
    prisma.userWarn.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.userSuspension.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.userBan.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
  ]);

  return { warns, suspensions, bans };
}

export async function performModerationAction(data: {
  actionType: 'WARN' | 'BLOCK' | 'BAN' | 'REVOKE_WARN' | 'REVOKE_SUSPENSION' | 'REVOKE_BAN' | 'REMOVE_ITEM' | 'LOCK_CHAT';
  targetType: EntityType;
  targetId: string;
  notes?: string;
  durationDays?: number; // For suspension
}) {
  const admin = await requireAdmin();

  try {
    // 1. Log the generic action
    await prisma.moderationAction.create({
      data: {
        adminId: admin.userId,
        actionType: (data.actionType.startsWith('REVOKE_') ? 'WARN' : data.actionType) as ActionType,
        targetType: data.targetType,
        targetId: data.targetId,
        notes: data.notes
      }
    });

    // 2. Perform the specific effect
    if (data.targetType === 'USER') {
      const userId = data.targetId;

      if (data.actionType === 'BAN') {
        await prisma.userBan.create({
          data: {
            userId,
            adminId: admin.userId,
            reason: data.notes || 'Permanent ban issued by admin',
          }
        });
      } else if (data.actionType === 'BLOCK') {
        const duration = data.durationDays || 7;
        const endAt = new Date();
        endAt.setDate(endAt.getDate() + duration);

        await prisma.userSuspension.create({
          data: {
            userId,
            adminId: admin.userId,
            reason: data.notes || `Suspended for ${duration} days`,
            endAt,
          }
        });
      } else if (data.actionType === 'WARN') {
        await prisma.userWarn.create({
          data: {
            userId,
            adminId: admin.userId,
            reason: data.notes || 'Official warning issued',
          }
        });
      } else if (data.actionType === 'REVOKE_BAN') {
        await prisma.userBan.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() }
        });
      } else if (data.actionType === 'REVOKE_SUSPENSION') {
        await prisma.userSuspension.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() }
        });
      } else if (data.actionType === 'REVOKE_WARN') {
        await prisma.userWarn.updateMany({
          where: { userId, acknowledged: false },
          data: { acknowledged: true }
        });
      }
    } else if (data.targetType === 'ITEM' && data.actionType === 'REMOVE_ITEM') {
      await prisma.item.update({
        where: { id: data.targetId },
        data: { status: 'ARCHIVED' }
      });
    } else if (data.targetType === 'MESSAGE' && data.actionType === 'LOCK_CHAT') {
      const msg = await prisma.message.findUnique({ where: { id: data.targetId } });
      if (msg) {
        await prisma.conversation.update({
          where: { id: msg.conversationId },
          data: { status: 'LOCKED' }
        });
      }
    } else if ((data.targetType as string) === 'CHAT' && data.actionType === 'LOCK_CHAT') {
       await prisma.conversation.update({
          where: { id: data.targetId },
          data: { status: 'LOCKED' }
        });
    } else if ((data.targetType as string) === 'GROUP' && data.actionType === 'BAN') {
        // FULL CASCADE: Permanent Group Ban
        const groupId = data.targetId;

        // 1. Set group to PERMA_BANNED
        await (prisma.group as any).update({
            where: { id: groupId },
            data: { status: 'PERMA_BANNED' }
        });

        // 2. Fetch group details + all members
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: { name: true },
        });
        const members = await prisma.groupMember.findMany({
            where: { groupId },
            select: { userId: true },
        });

        const groupName = group?.name || 'Unknown Group';
        const reason = data.notes || 'Group violated platform rules.';
        const banEnd = new Date();
        banEnd.setDate(banEnd.getDate() + 7);

        // 3. For each member: 7-day suspension + notification
        for (const member of members) {
            // 7-day suspension
            await prisma.userSuspension.create({
                data: {
                    userId: member.userId,
                    adminId: admin.userId,
                    reason: `You were a member of a group that violated platform rules. Group "${groupName}" was permanently banned. Reason: ${reason}`,
                    endAt: banEnd,
                }
            });

            // Notification
            await prisma.notification.create({
                data: {
                    userId: member.userId,
                    type: 'SYSTEM',
                    message: `The group "${groupName}" has been permanently banned. Reason: ${reason}. Your account has been restricted for 7 days.`,
                    resourcePath: '/home',
                }
            });
        }
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Moderation Action Failed:', error);
    return { success: false, error: 'Failed to perform action' };
  }
}
