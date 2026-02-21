
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Real Item Data...');

  // Get or Create Alice
  let alice = await prisma.user.findUnique({ where: { email: 'alice@college.edu' } });
  if (!alice) {
    alice = await prisma.user.create({
      data: {
        email: 'alice@college.edu',
        name: 'Alice Johnson',
        karmaScore: 120,
        role: 'STUDENT',
      }
    });
  }

  // 1. Sony Headphones (Full Data)
  // Delete first to ensure fresh data
  try {
     await prisma.item.delete({ where: { id: '062b415d-1be1-43fb-b2b5-cfc892485f93' } });
  } catch(e) {}

  const sony = await prisma.item.create({
    data: {
      id: '062b415d-1be1-43fb-b2b5-cfc892485f93',
      name: 'Sony WH-1000XM4 Headphones',
      description: 'Industry-leading noise canceling. Great for studying in noisy dorms. Battery lasts 30 hours.',
      category: 'Electronics',
      status: 'AVAILABLE',
      condition: 'LIKE_NEW',
      lenderNote: 'Please wipe the earcups after use. Case included.',
      maxLendingDays: 3,
      deposit: 20.00,
      imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop',
      ownerId: alice.id,
    }
  });
  console.log('✅ Created Full Item:', sony.name);

  // 2. Calculus Textbook (Minimal Data)
  await prisma.item.create({
    data: {
      name: 'Calculus Textbook (Stewart 8th Ed)',
      description: 'Standard calc book. A bit worn but pages are clean.',
      category: 'Books',
      status: 'AVAILABLE',
      ownerId: alice.id,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop',
    }
  });

  // 3. Scientific Calculator (Free for Students)
  try {
      await prisma.item.delete({ where: { id: '9d777431-6fa8-4759-ba16-9e8f32d2f7d0' } });
  } catch(e) {}

  const calc = await prisma.item.create({
    data: {
      id: '9d777431-6fa8-4759-ba16-9e8f32d2f7d0',
      name: 'Scientific Calculator',
      category: 'Electronics',
      status: 'AVAILABLE',
      condition: 'GOOD',
      deposit: 0,
      maxLendingDays: 14,
      ownerId: alice.id,
      imageUrl: 'https://images.unsplash.com/photo-1574607383476-f517b260d35b?q=80&w=1000&auto=format&fit=crop'
    }
  });
  console.log('✅ Created Free Item:', calc.name);

  console.log('✅ Seeding Complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
