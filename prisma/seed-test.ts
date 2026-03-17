/**
 * Small Deterministic Test Seed
 * Creates a minimal, reproducible dataset for E2E and integration tests.
 * Users: alice, bob, charlie, diana, admin (5 total)
 * Groups: 3 | Items: 10 | Requests in various states | Messages
 */
import 'dotenv/config';
import { PrismaClient, UserRole, ItemCategory, ItemStatus, RequestStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma: PrismaClient = new PrismaClient({ adapter });

const PASSWORD = 'password123';

async function main() {
  console.log('🧪 Seeding TEST database (small, deterministic)...');

  // --- Cleanup ---
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE reputation_logs DISABLE TRIGGER enforce_reputation_immutability;');
  } catch { /* trigger may not exist */ }

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
  } catch { /* trigger may not exist */ }

  const hash = await bcrypt.hash(PASSWORD, 10);

  // --- Users ---
  const alice = await prisma.user.create({
    data: {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'alice@college.edu', name: 'Alice Johnson', passwordHash: hash,
      role: UserRole.STUDENT, karmaScore: 150,
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: '00000000-0000-4000-8000-000000000002',
      email: 'bob@college.edu', name: 'Bob Smith', passwordHash: hash,
      role: UserRole.STUDENT, karmaScore: 80,
    },
  });

  const charlie = await prisma.user.create({
    data: {
      id: '00000000-0000-4000-8000-000000000003',
      email: 'charlie@college.edu', name: 'Charlie Brown', passwordHash: hash,
      role: UserRole.STUDENT, karmaScore: 30,
    },
  });

  const diana = await prisma.user.create({
    data: {
      id: '00000000-0000-4000-8000-000000000004',
      email: 'diana@college.edu', name: 'Diana Prince', passwordHash: hash,
      role: UserRole.STUDENT, karmaScore: 200,
    },
  });

  const admin = await prisma.user.create({
    data: {
      id: '00000000-0000-4000-8000-000000000099',
      email: 'valiantvishal30@gmail.com', name: 'Super Admin', passwordHash: hash,
      role: UserRole.ADMIN, karmaScore: 0,
    },
  });

  // --- Groups ---
  const photoClub = await prisma.group.create({
    data: {
      id: '00000000-0000-4000-8000-000000000101',
      slug: 'photography-club', name: 'Photography Club', category: 'HOBBY',
      description: 'Campus photographers sharing gear.', ownerUserId: alice.id,
      isVerified: true, visibility: 'PUBLIC', memberCount: 3, itemCount: 1,
    },
  });

  const studyGroup = await prisma.group.create({
    data: {
      id: '00000000-0000-4000-8000-000000000102',
      slug: 'cs-study-group', name: 'CS Study Group', category: 'ACADEMIC',
      description: 'Sharing textbooks and notes.', ownerUserId: bob.id,
      isVerified: false, visibility: 'PUBLIC', memberCount: 2,
    },
  });

  const privateClub = await prisma.group.create({
    data: {
      id: '00000000-0000-4000-8000-000000000103',
      slug: 'robotics-lab', name: 'Robotics Lab', category: 'CLUB',
      description: 'Equipment sharing for robotics team.', ownerUserId: diana.id,
      isVerified: true, visibility: 'PRIVATE', memberCount: 1,
    },
  });

  // --- Group Members ---
  await prisma.groupMember.createMany({
    data: [
      { groupId: photoClub.id, userId: alice.id, role: 'ADMIN', status: 'ACTIVE' },
      { groupId: photoClub.id, userId: bob.id, role: 'MEMBER', status: 'ACTIVE' },
      { groupId: photoClub.id, userId: charlie.id, role: 'MEMBER', status: 'ACTIVE' },
      { groupId: studyGroup.id, userId: bob.id, role: 'ADMIN', status: 'ACTIVE' },
      { groupId: studyGroup.id, userId: diana.id, role: 'MEMBER', status: 'ACTIVE' },
      { groupId: privateClub.id, userId: diana.id, role: 'ADMIN', status: 'ACTIVE' },
    ],
  });

  // --- Items (10 total, various states) ---
  const items = await Promise.all([
    prisma.item.create({ data: { id: '00000000-0000-4000-8000-000000000201', name: 'Canon EOS M50', description: 'Mirrorless camera', category: 'Electronics', status: 'AVAILABLE', ownerId: alice.id, condition: 'LIKE_NEW', maxLendingDays: 7 } }),
    prisma.item.create({ data: { id: '00000000-0000-4000-8000-000000000202', name: 'Sony Headphones', description: 'Noise canceling', category: 'Electronics', status: 'AVAILABLE', ownerId: alice.id, condition: 'GOOD' } }),
    prisma.item.create({ data: { id: '00000000-0000-4000-8000-000000000203', name: 'Calculus Textbook', description: 'Stewart 8th ed', category: 'Books', status: 'AVAILABLE', ownerId: bob.id, condition: 'FAIR' } }),
    prisma.item.create({ data: { id: '00000000-0000-4000-8000-000000000204', name: 'Lab Oscilloscope', description: 'Keysight 100MHz', category: 'Lab', status: 'BORROWED', ownerId: charlie.id, condition: 'GOOD' } }),
    prisma.item.create({ data: { id: '00000000-0000-4000-8000-000000000205', name: 'USB-C Hub', description: '7-in-1 hub', category: 'Chargers', status: 'AVAILABLE', ownerId: diana.id, condition: 'NEW' } }),
    prisma.item.create({ data: { id: '00000000-0000-4000-8000-000000000206', name: 'Whiteboard Markers', description: 'Set of 8 colors', category: 'Class', status: 'AVAILABLE', ownerId: alice.id } }),
    prisma.item.create({ data: { id: '00000000-0000-4000-8000-000000000207', name: 'Arduino Uno', description: 'Rev3 with cables', category: 'Electronics', status: 'AVAILABLE', ownerId: bob.id, condition: 'GOOD' } }),
    prisma.item.create({ data: { id: '00000000-0000-4000-8000-000000000208', name: 'Camping Tent', description: '3-person tent', category: 'Misc', status: 'AVAILABLE', ownerId: charlie.id } }),
    prisma.item.create({ data: { id: '00000000-0000-4000-8000-000000000209', name: 'Physics Textbook', description: 'Halliday 10th ed', category: 'Books', status: 'AVAILABLE', ownerId: diana.id } }),
    prisma.item.create({ data: { id: '00000000-0000-4000-8000-000000000210', name: 'Professional Tripod', description: 'Group owned tripod', category: 'Misc', status: 'AVAILABLE', groupId: photoClub.id } }),
  ]);

  // --- Requests (various states) ---
  // BORROWED: Bob borrowed oscilloscope from Charlie
  const borrowedReq = await prisma.request.create({
    data: {
      id: '00000000-0000-4000-8000-000000000301',
      itemId: items[3].id, requesterId: bob.id, status: 'BORROWED',
      startDate: new Date('2025-01-10'), endDate: new Date('2025-01-17'),
    },
  });

  // PENDING: Charlie wants to borrow camera from Alice
  await prisma.request.create({
    data: {
      id: '00000000-0000-4000-8000-000000000302',
      itemId: items[0].id, requesterId: charlie.id, status: 'PENDING',
      startDate: new Date('2025-01-15'), endDate: new Date('2025-01-22'),
    },
  });

  // RETURNED: Diana previously returned headphones to Alice
  await prisma.request.create({
    data: {
      id: '00000000-0000-4000-8000-000000000303',
      itemId: items[1].id, requesterId: diana.id, status: 'RETURNED',
      startDate: new Date('2024-12-01'), endDate: new Date('2024-12-08'),
      returnedAt: new Date('2024-12-07'),
    },
  });

  // --- Conversation + Messages ---
  const convo = await prisma.conversation.create({
    data: {
      id: '00000000-0000-4000-8000-000000000401',
      userAId: alice.id, userBId: bob.id, status: 'ACTIVE',
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: convo.id, senderId: bob.id, content: 'Hi, can I borrow the camera?', isRead: true, createdAt: new Date('2025-01-09T10:00:00Z') },
      { conversationId: convo.id, senderId: alice.id, content: 'Sure! When do you need it?', isRead: true, createdAt: new Date('2025-01-09T10:05:00Z') },
      { conversationId: convo.id, senderId: bob.id, content: 'Tomorrow would be great!', isRead: false, createdAt: new Date('2025-01-09T10:10:00Z') },
    ],
  });

  // --- Notifications ---
  await prisma.notification.createMany({
    data: [
      { userId: alice.id, type: 'REQUEST', message: 'Charlie wants to borrow your Canon EOS M50', resourcePath: '/my-items' },
      { userId: bob.id, type: 'SYSTEM', message: 'Welcome to Oi Lend Me!', isRead: true },
    ],
  });

  // --- Reputation Logs ---
  await prisma.reputationLog.create({
    data: {
      userId: alice.id, changeAmount: 3, reason: 'Lent camera to Diana',
      relatedRequestId: '00000000-0000-4000-8000-000000000303',
    },
  });

  console.log('✅ Test seed completed!');
  console.log('👤 Users: alice, bob, charlie, diana, admin (all password: password123)');
  console.log('📦 Items: 10 (various states)');
  console.log('📋 Requests: 3 (BORROWED, PENDING, RETURNED)');
  console.log('💬 Conversation: 1 (alice↔bob, 3 messages)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
