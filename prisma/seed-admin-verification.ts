import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Admin Verification Data...');

  // 1. Ensure Admin Exists (matches hardcoded check logic, but with known ID for relations)
  const adminEmail = 'valiantvishal30@gmail.com';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      name: 'Super Admin',
      role: 'ADMIN',
      passwordHash: 'placeholder', // Login route bypasses this check
    },
  });
  console.log('✅ Admin User ensured:', admin.id);

  // 2. Create Regular Users
  const user1 = await prisma.user.upsert({
    where: { email: 'student1@university.edu' },
    update: {},
    create: { email: 'student1@university.edu', name: 'John Doe', role: 'STUDENT', passwordHash: 'hash' },
  });
  
  const user2 = await prisma.user.upsert({
    where: { email: 'spammer@university.edu' },
    update: {},
    create: { email: 'spammer@university.edu', name: 'Evil Spammer', role: 'STUDENT', passwordHash: 'hash' },
  });

  // 3. Create Items
  const item1 = await prisma.item.create({
    data: {
      name: 'Calculus Textbook',
      category: 'Books',
      status: 'AVAILABLE',
      ownerId: user1.id,
    }
  });

  // 4. Create Reports
  await prisma.report.createMany({
    data: [
      {
        reporterId: user1.id,
        entityType: 'USER',
        entityId: user2.id,
        reason: 'This user is sending spam messages.',
        status: 'PENDING'
      },
      {
        reporterId: user1.id,
        entityType: 'ITEM',
        entityId: item1.id,
        reason: 'This item is fake/damanged.',
        status: 'REVIEWED'
      }
    ]
  });
  console.log('✅ Created Reports');

  // 5. Create Feedback
  await prisma.feedback.createMany({
    data: [
      {
        userId: user1.id,
        category: 'SUGGESTION',
        message: 'It would be great to have a dark mode for the app!'
      },
      {
        userId: user2.id,
        category: 'BUG',
        message: 'I cannot login sometimes.'
      }
    ]
  });
  console.log('✅ Created Feedback');

  console.log('🎉 Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
