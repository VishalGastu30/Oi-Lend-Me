import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function seedInstitutionalGroups() {
  console.log('🌱 Seeding institutional groups system...');

  // Create a super admin user if not exists
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@oilendme.com' },
    update: {},
    create: {
      email: 'admin@oilendme.com',
      name: 'System Administrator',
      role: 'ADMIN',
      karmaScore: 1000,
      passwordHash: '$2a$10$dummyhashfordevonly',
    },
  });

  console.log('✅ Created super admin');

  // Create group owner user
  const sarahJenkins = await prisma.user.upsert({
    where: { email: 'sarah.jenkins@university.edu' },
    update: {},
    create: {
      email: 'sarah.jenkins@university.edu',
      name: 'Sarah Jenkins',
      role: 'STUDENT',
      karmaScore: 450,
      passwordHash: '$2a$10$dummyhashfordevonly',
    },
  });

  console.log('✅ Created group owner user');

  // Create Photography Club (verified group from HTML reference)
  const photographyClub = await prisma.group.upsert({
    where: { slug: 'photography-club' },
    update: {},
    create: {
      slug: 'photography-club',
      name: 'Photography Club',
      category: 'CLUB',
      description: 'University photography club for students passionate about capturing moments.',
      ownerUserId: sarahJenkins.id,
      isVerified: true,
      visibility: 'PUBLIC',
      memberCount: 24,
      itemCount: 15,
    },
  });

  console.log('✅ Created Photography Club');

  // Add Sarah as admin member
  await prisma.groupMember.upsert({
    where: {
      groupId_userId: {
        groupId: photographyClub.id,
        userId: sarahJenkins.id,
      },
    },
    update: {},
    create: {
      groupId: photographyClub.id,
      userId: sarahJenkins.id,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Added Sarah as admin');

  console.log('🎉 Institutional groups system seeded successfully!');
}

async function main() {
  try {
    await seedInstitutionalGroups();
  } catch (error) {
    console.error('Error seeding institutional groups:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
