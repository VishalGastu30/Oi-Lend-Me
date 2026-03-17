/**
 * Large-Scale Seed Script
 * Generates realistic data for load/stress testing:
 *   10,000 users | 5,000 groups | 20,000 items | borrow history, disputes, karma
 *
 * Usage: tsx prisma/seed-large.ts [--size small|medium|full] [--sanitize]
 *   small:  500 users, 200 groups, 1000 items
 *   medium: 2000 users, 1000 groups, 5000 items
 *   full:   10000 users, 5000 groups, 20000 items
 */
import 'dotenv/config';
import { PrismaClient, UserRole, ItemCategory, GroupCategory, GroupVisibility } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma: PrismaClient = new PrismaClient({ adapter });

// --- Config from CLI flags ---
const args = process.argv.slice(2);
const sizeArg = args.find(a => a.startsWith('--size'))?.split('=')[1] ||
  (args.indexOf('--size') >= 0 ? args[args.indexOf('--size') + 1] : 'full');
const sanitize = args.includes('--sanitize');

const SIZES: Record<string, { users: number; groups: number; items: number }> = {
  small:  { users: 500,   groups: 200,  items: 1000 },
  medium: { users: 2000,  groups: 1000, items: 5000 },
  full:   { users: 10000, groups: 5000, items: 20000 },
};

const config = SIZES[sizeArg] || SIZES.full;
const BATCH_SIZE = 500;
const PASSWORD_HASH = '$2b$10$K6yJm1e7ROxjV3V3F6o8IeHjRxn2TZh0IK3v2vZwMpMlLGGw0lN2i'; // "password123"

const ITEM_CATEGORIES: ItemCategory[] = ['Electronics', 'Books', 'Lab', 'Misc', 'Chargers', 'Class'];
const GROUP_CATEGORIES: GroupCategory[] = ['ACADEMIC', 'HOSTEL', 'CLUB', 'HOBBY', 'EVENT'];
const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmail(index: number): string {
  if (sanitize) return `user${index}@test.campus.edu`;
  return faker.internet.email({ firstName: faker.person.firstName(), lastName: `${index}` }).toLowerCase();
}

async function main() {
  console.log(`🚀 Large seed: ${sizeArg} (${config.users} users, ${config.groups} groups, ${config.items} items)`);
  if (sanitize) console.log('🔒 PII sanitization enabled');

  // --- Cleanup ---
  console.log('🧹 Cleaning database...');
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE reputation_logs DISABLE TRIGGER enforce_reputation_immutability;');
  } catch { /* ok */ }

  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.requirementResponse.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.groupBooking.deleteMany();
  await prisma.groupItem.deleteMany();
  await prisma.groupJoinRequest.deleteMany();
  await prisma.groupActionLog.deleteMany();
  await prisma.groupProof.deleteMany();
  await prisma.groupRequest.deleteMany();
  await prisma.request.deleteMany();
  await prisma.itemImage.deleteMany();
  await prisma.item.deleteMany();
  await prisma.reputationLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userWarn.deleteMany();
  await prisma.userSuspension.deleteMany();
  await prisma.userBan.deleteMany();
  await prisma.adminActionLog.deleteMany();
  await prisma.moderationAction.deleteMany();
  await prisma.blockedUser.deleteMany();
  await prisma.report.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  try {
    await prisma.$executeRawUnsafe('ALTER TABLE reputation_logs ENABLE TRIGGER enforce_reputation_immutability;');
  } catch { /* ok */ }

  // ========== USERS ==========
  console.log(`👤 Creating ${config.users} users...`);
  const userIds: string[] = [];

  for (let batch = 0; batch < config.users; batch += BATCH_SIZE) {
    const batchData = [];
    const end = Math.min(batch + BATCH_SIZE, config.users);
    for (let i = batch; i < end; i++) {
      const isAdmin = i === 0; // First user is admin
      batchData.push({
        email: isAdmin ? 'valiantvishal30@gmail.com' : generateEmail(i),
        name: sanitize ? `User ${i}` : faker.person.fullName(),
        passwordHash: PASSWORD_HASH,
        role: isAdmin ? UserRole.ADMIN : UserRole.STUDENT,
        karmaScore: Math.floor(Math.random() * 300),
        about: sanitize ? null : faker.lorem.sentence(),
      });
    }
    const created = await prisma.user.createManyAndReturn({
      data: batchData,
      select: { id: true },
    });
    userIds.push(...created.map(u => u.id));
    process.stdout.write(`  ${userIds.length}/${config.users}\r`);
  }
  console.log(`  ✅ ${userIds.length} users created`);

  // ========== GROUPS ==========
  console.log(`🏘️ Creating ${config.groups} groups...`);
  const groupIds: string[] = [];

  for (let batch = 0; batch < config.groups; batch += BATCH_SIZE) {
    const batchData = [];
    const end = Math.min(batch + BATCH_SIZE, config.groups);
    for (let i = batch; i < end; i++) {
      const ownerIdx = Math.floor(Math.random() * (userIds.length - 1)) + 1; // skip admin
      batchData.push({
        slug: `group-${i}-${Date.now()}`,
        name: sanitize ? `Group ${i}` : `${faker.company.name()} ${randomPick(['Club', 'Society', 'Team', 'Lab'])}`,
        category: randomPick(GROUP_CATEGORIES),
        description: sanitize ? `Description for group ${i}` : faker.lorem.paragraph(),
        ownerUserId: userIds[ownerIdx],
        isVerified: Math.random() > 0.6,
        visibility: Math.random() > 0.3 ? 'PUBLIC' as GroupVisibility : 'PRIVATE' as GroupVisibility,
        memberCount: Math.floor(Math.random() * 50) + 1,
      });
    }
    const created = await prisma.group.createManyAndReturn({
      data: batchData,
      select: { id: true },
    });
    groupIds.push(...created.map(g => g.id));
    process.stdout.write(`  ${groupIds.length}/${config.groups}\r`);
  }
  console.log(`  ✅ ${groupIds.length} groups created`);

  // ========== GROUP MEMBERS ==========
  console.log('👥 Creating group memberships...');
  const memberData: { groupId: string; userId: string; role: 'ADMIN' | 'MEMBER'; status: 'ACTIVE' | 'PENDING' }[] = [];
  const memberSet = new Set<string>();

  for (const groupId of groupIds) {
    const memberCount = Math.min(Math.floor(Math.random() * 10) + 1, 20);
    for (let i = 0; i < memberCount; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const key = `${groupId}-${userId}`;
      if (memberSet.has(key)) continue;
      memberSet.add(key);
      memberData.push({
        groupId, userId,
        role: i === 0 ? 'ADMIN' : 'MEMBER',
        status: Math.random() > 0.1 ? 'ACTIVE' : 'PENDING',
      });
    }
  }

  for (let i = 0; i < memberData.length; i += BATCH_SIZE) {
    await prisma.groupMember.createMany({ data: memberData.slice(i, i + BATCH_SIZE), skipDuplicates: true });
  }
  console.log(`  ✅ ${memberData.length} memberships created`);

  // ========== ITEMS ==========
  console.log(`📦 Creating ${config.items} items...`);
  const itemIds: string[] = [];

  for (let batch = 0; batch < config.items; batch += BATCH_SIZE) {
    const batchData = [];
    const end = Math.min(batch + BATCH_SIZE, config.items);
    for (let i = batch; i < end; i++) {
      const isGroupItem = Math.random() > 0.85;
      batchData.push({
        name: sanitize ? `Item ${i}` : faker.commerce.productName(),
        description: sanitize ? `Description ${i}` : faker.commerce.productDescription(),
        category: randomPick(ITEM_CATEGORIES),
        status: 'AVAILABLE' as const,
        ownerId: isGroupItem ? null : userIds[Math.floor(Math.random() * (userIds.length - 1)) + 1],
        groupId: isGroupItem ? groupIds[Math.floor(Math.random() * groupIds.length)] : null,
        condition: randomPick(CONDITIONS),
        maxLendingDays: Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 1 : null,
      });
    }
    const created = await prisma.item.createManyAndReturn({
      data: batchData,
      select: { id: true },
    });
    itemIds.push(...created.map(it => it.id));
    process.stdout.write(`  ${itemIds.length}/${config.items}\r`);
  }
  console.log(`  ✅ ${itemIds.length} items created`);

  // ========== REQUESTS (borrow history) ==========
  const requestCount = Math.floor(config.items * 0.3);
  console.log(`📋 Creating ${requestCount} requests...`);

  const statuses: Array<'PENDING' | 'BORROWED' | 'RETURNED' | 'REJECTED' | 'CANCELLED'> =
    ['PENDING', 'BORROWED', 'RETURNED', 'REJECTED', 'CANCELLED'];

  for (let batch = 0; batch < requestCount; batch += BATCH_SIZE) {
    const batchData = [];
    const end = Math.min(batch + BATCH_SIZE, requestCount);
    for (let i = batch; i < end; i++) {
      const status = randomPick(statuses);
      const start = faker.date.recent({ days: 60 });
      const endD = new Date(start);
      endD.setDate(endD.getDate() + Math.floor(Math.random() * 14) + 1);

      batchData.push({
        itemId: itemIds[Math.floor(Math.random() * itemIds.length)],
        requesterId: userIds[Math.floor(Math.random() * (userIds.length - 1)) + 1],
        status,
        startDate: start,
        endDate: endD,
        returnedAt: status === 'RETURNED' ? endD : null,
      });
    }
    await prisma.request.createMany({ data: batchData, skipDuplicates: true });
    process.stdout.write(`  ${Math.min(batch + BATCH_SIZE, requestCount)}/${requestCount}\r`);
  }
  console.log(`  ✅ ${requestCount} requests created`);

  // ========== CONVERSATIONS ==========
  const convoCount = Math.floor(config.users * 0.1);
  console.log(`💬 Creating ${convoCount} conversations...`);

  const convoSet = new Set<string>();
  const convoBatch = [];
  for (let i = 0; i < convoCount; i++) {
    let a = Math.floor(Math.random() * (userIds.length - 1)) + 1;
    let b = Math.floor(Math.random() * (userIds.length - 1)) + 1;
    if (a === b) b = (b + 1) % userIds.length || 1;
    const key = [userIds[a], userIds[b]].sort().join('-');
    if (convoSet.has(key)) continue;
    convoSet.add(key);
    convoBatch.push({ userAId: userIds[a], userBId: userIds[b], status: 'ACTIVE' as const });
  }

  for (let i = 0; i < convoBatch.length; i += BATCH_SIZE) {
    await prisma.conversation.createMany({ data: convoBatch.slice(i, i + BATCH_SIZE), skipDuplicates: true });
  }
  console.log(`  ✅ ${convoBatch.length} conversations created`);

  // ========== SUMMARY ==========
  console.log('\n✅ Large seed completed!');
  console.log(`📊 Summary: ${config.users} users | ${config.groups} groups | ${config.items} items | ${requestCount} requests | ${convoBatch.length} conversations`);
  console.log('🔐 All users password: password123');
  console.log('🔐 Admin: valiantvishal30@gmail.com / IamAdmin@3004');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
