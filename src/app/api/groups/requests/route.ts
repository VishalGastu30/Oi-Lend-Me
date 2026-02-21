import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// POST /api/groups/requests - Submit group creation request
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || !session.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Rate limiting: Check if user has pending requests or created a group in last 7 days
    const recentRequests = await prisma.groupRequest.count({
      where: {
        requesterId: user.id,
        status: 'PENDING',
      },
    });

    if (recentRequests > 0) {
      return NextResponse.json(
        { error: 'You already have a pending group request' },
        { status: 429 }
      );
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentGroups = await prisma.groupRequest.count({
      where: {
        requesterId: user.id,
        status: 'APPROVED',
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    if (recentGroups > 0) {
      return NextResponse.json(
        { error: 'You can only create one group per 7 days' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      groupName,
      category,
      facultyEmail,
      officialEmail,
      shortDescription,
    } = body;

    if (!groupName || !category) {
      return NextResponse.json(
        { error: 'Group name and category are required' },
        { status: 400 }
      );
    }

    const groupRequest = await prisma.groupRequest.create({
      data: {
        requesterId: user.id,
        groupName,
        category,
        facultyEmail,
        officialEmail,
        shortDescription,
        status: 'PENDING',
      },
    });

    // Create notification for super admins
    const superAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    await Promise.all(
      superAdmins.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'SYSTEM',
            message: `New group creation request: ${groupName}`,
            resourcePath: `/admin/group-requests`,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      groupRequest,
    });
  } catch (error) {
    console.error('Error creating group request:', error);
    return NextResponse.json(
      { error: 'Failed to create group request' },
      { status: 500 }
    );
  }
}

// GET /api/groups/requests - List pending requests (Super Admin only)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    
    if (!session || !session.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Super Admin access required' },
        { status: 403 }
      );
    }

    const requests = await prisma.groupRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            karmaScore: true,
          },
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching group requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group requests' },
      { status: 500 }
    );
  }
}
