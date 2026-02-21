/**
 * Admin User Creation Script
 * Creates or verifies the admin user with correct credentials
 * Safe to run multiple times (idempotent)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'valiantvishal30@gmail.com';
const ADMIN_PASSWORD = 'IamAdmin@3004';
const SALT_ROUNDS = 12;

async function createAdminUser() {
  try {
    console.log('🔍 Checking for existing admin user...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      // Verify role is ADMIN
      if (existingAdmin.role !== 'ADMIN') {
        console.log('⚠️  Updating role to ADMIN...');
        await prisma.user.update({
          where: { email: ADMIN_EMAIL },
          data: { role: 'ADMIN' },
        });
        console.log('✅ Role updated to ADMIN');
      }
      
      // Update password to ensure it matches
      console.log('🔐 Updating password hash...');
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { passwordHash: hashedPassword },
      });
      console.log('✅ Password hash updated');
      
      return existingAdmin;
    }

    // Create new admin user
    console.log('📝 Creating new admin user...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
    
    const admin = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        passwordHash: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    
    return admin;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('\n✅ Admin setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Admin setup failed:', error);
      process.exit(1);
    });
}

export { createAdminUser };
