import 'dotenv/config';
import { PrismaClient, UserRole, ItemCategory, ItemStatus, RequestStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma: PrismaClient = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed with real transaction scenario...');

  // 1. Clean up existing data
  console.log('🧹 Cleaning database...');
  
  // Disable trigger to allow cleanup
  await prisma.$executeRawUnsafe('ALTER TABLE reputation_logs DISABLE TRIGGER enforce_reputation_immutability;');
  
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.request.deleteMany();
  await prisma.itemImage.deleteMany();
  await prisma.item.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.reputationLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // Re-enable trigger
  await prisma.$executeRawUnsafe('ALTER TABLE reputation_logs ENABLE TRIGGER enforce_reputation_immutability;');

  // 2. Create password hash
  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Create 2 Users
  console.log('👤 Creating Alice (Lender) and Bob (Borrower)...');
  
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@college.edu',
      passwordHash,
      role: UserRole.STUDENT,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      karmaScore: 150,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@college.edu',
      passwordHash,
      role: UserRole.STUDENT,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      karmaScore: 80,
    },
  });

  console.log(`✅ Created users: ${alice.name} (${alice.email}) and ${bob.name} (${bob.email})`);

  // 4. Alice creates an item to lend
  console.log('📷 Alice creating item: Canon EOS M50 Camera...');
  
  const camera = await prisma.item.create({
    data: {
      name: 'Canon EOS M50 Camera',
      description: 'Mirrorless camera with 24.1MP sensor, perfect for photography students. Includes 15-45mm kit lens, battery, and charger. Great condition!',
      category: ItemCategory.Electronics,
      imageUrl: 'https://picsum.photos/seed/camera-eos-m50/800/600',
      status: ItemStatus.BORROWED, // Will be borrowed by Bob
      ownerId: alice.id,
    },
  });

  // Add more diverse items for search testing
  await prisma.item.createMany({
    data: [
      {
        name: 'DeWalt Cordless Drill',
        description: 'Compact 20V Max drill with brush-less motor. Great for DIY projects.',
        category: ItemCategory.Misc,
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
        status: ItemStatus.AVAILABLE,
        ownerId: alice.id,
      },
      {
        name: 'iPhone 13 Pro',
        description: 'Sierra Blue, 128GB. Available for testing apps or photography.',
        category: ItemCategory.Electronics,
        imageUrl: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&q=80',
        status: ItemStatus.AVAILABLE,
        ownerId: alice.id,
      },
      {
        name: 'Sony WH-1000XM4 Headphones',
        description: 'Industry leading noise canceling headphones. Perfect for studying.',
        category: ItemCategory.Electronics,
        imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
        status: ItemStatus.AVAILABLE,
        ownerId: bob.id, // Bob lends this
      }
    ]
  });

  // Add item images
  await prisma.itemImage.createMany({
    data: [
      {
        itemId: camera.id,
        url: 'https://picsum.photos/seed/camera-eos-m50/800/600',
        orderIndex: 0,
        isPrimary: true,
      },
      {
        itemId: camera.id,
        url: 'https://picsum.photos/seed/camera-eos-m50-2/800/600',
        orderIndex: 1,
        isPrimary: false,
      },
    ],
  });

  console.log(`✅ Created item: ${camera.name}`);

  // 5. Bob creates a borrow request
  console.log('📝 Bob requesting to borrow the camera...');
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7); // Borrow for 1 week

  const borrowRequest = await prisma.request.create({
    data: {
      itemId: camera.id,
      requesterId: bob.id,
      status: RequestStatus.BORROWED, // Alice already approved
      startDate: startDate,
      endDate: endDate,
    },
  });

  console.log(`✅ Created borrow request (Status: ${borrowRequest.status})`);

  // 6. Create conversation between Alice and Bob
  console.log('💬 Creating chat conversation...');
  
  const conversation = await prisma.conversation.create({
    data: {
      userAId: alice.id,
      userBId: bob.id,
      status: 'ACTIVE',
    },
  });

  // Link the request to the conversation
  await prisma.request.update({
    where: { id: borrowRequest.id },
    data: { conversationId: conversation.id }
  });

  // 7. Create messages in the conversation
  const messages = [
    {
      senderId: bob.id,
      content: "Hi Alice! I'm interested in borrowing your Canon EOS M50. I have a photography project due next week.",
      createdAt: new Date(Date.now() - 3600000 * 24), // 1 day ago
    },
    {
      senderId: alice.id,
      content: "Hey Bob! Sure, I can lend it to you. When do you need it?",
      createdAt: new Date(Date.now() - 3600000 * 23),
    },
    {
      senderId: bob.id,
      content: "I'd like to pick it up tomorrow if that works for you. I'll take good care of it!",
      createdAt: new Date(Date.now() - 3600000 * 22),
    },
    {
      senderId: alice.id,
      content: "Perfect! Let's meet at the library at 2 PM tomorrow. I'll bring the camera with the charger and lens.",
      createdAt: new Date(Date.now() - 3600000 * 21),
    },
    {
      senderId: bob.id,
      content: "Awesome, see you then! Thanks so much, Alice! 📷",
      createdAt: new Date(Date.now() - 3600000 * 20),
    },
    {
      senderId: alice.id,
      content: "You're welcome! Just remember to return it by next Friday. Have fun with your project!",
      createdAt: new Date(Date.now() - 3600000 * 19),
    },
  ];

  for (const msg of messages) {
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: msg.senderId,
        content: msg.content,
        isRead: true,
        createdAt: msg.createdAt,
      },
    });
  }

  console.log(`✅ Created ${messages.length} messages in conversation`);

  // 8. Create a Group (Photography Club)
  console.log('🏘️ Creating Photography Club group...');
  
  const photographyClub = await prisma.group.create({
    data: {
      slug: 'photography-club',
      name: 'Photography Club',
      category: 'HOBBY',
      description: 'The best place for campus photographers to share gear and tips.',
      imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80',
      ownerUserId: alice.id,
    },
  });

  // Add Alice and Bob to the group
  await prisma.groupMember.createMany({
    data: [
      { userId: alice.id, groupId: photographyClub.id, role: 'ADMIN', status: 'ACTIVE' },
      { userId: bob.id, groupId: photographyClub.id, role: 'MEMBER', status: 'ACTIVE' },
    ],
  });

  // Create a GROUP-OWNED item (XOR constraint)
  const groupTripod = await prisma.item.create({
    data: {
      name: 'Professional Tripod Z-400',
      description: 'Heavy duty tripod for studio and outdoor shoots. All club members can book this.',
      category: ItemCategory.Misc,
      imageUrl: 'https://images.unsplash.com/photo-1590424753062-ed86048d0865?w=800&q=80',
      status: ItemStatus.AVAILABLE,
      groupId: photographyClub.id,
    },
  });

  console.log(`✅ Created group: ${photographyClub.name} with 2 members and 1 shared item`);

  // 9. Create reputation log for Bob (for borrowing)
  await prisma.reputationLog.create({
    data: {
      userId: bob.id,
      changeAmount: 10,
      reason: 'Borrowed Canon camera from Alice',
      relatedRequestId: borrowRequest.id,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: 2 (Alice & Bob)`);
  console.log(`   Items: 1 (Canon EOS M50 Camera - BORROWED)`);
  console.log(`   Requests: 1 (BORROWED status)`);
  console.log(`   Messages: ${messages.length}`);
  console.log('\n🔐 Login credentials:');
  console.log(`   Alice: alice@college.edu / password123`);
  console.log(`   Bob: bob@college.edu / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
