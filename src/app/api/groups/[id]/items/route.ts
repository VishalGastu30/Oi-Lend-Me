import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// GET /api/groups/[id]/items - List group items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Optional: could restrict visibility to members only for private groups
    const items = await (prisma as any).groupItem.findMany({
      where: { groupId: id },
      include: {
        bookings: {
          where: {
            status: 'BOOKED',
            endDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            startDate: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching group items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

// POST /api/groups/[id]/items - Add equipment (Group Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is group admin
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: user.id,
        },
      },
    });

    if (!membership || membership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Group Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, category, condition, imageUrls } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      );
    }

    
    // Validate Category against Enum
    const validCategories = ['Electronics', 'Books', 'Lab', 'Misc', 'Chargers', 'Class'];
    if (!validCategories.includes(category)) {
         return NextResponse.json(
            { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
            { status: 400 }
         );
    }

    const item = await (prisma as any).groupItem.create({
      data: {
        groupId: id,
        name,
        description,
        category, // valid enum value
        condition,
        imageUrls: imageUrls || [],
        availabilityStatus: 'AVAILABLE',
      },
    });

    // Update item count
    await (prisma as any).group.update({
      where: { id },
      data: { itemCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error creating group item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
