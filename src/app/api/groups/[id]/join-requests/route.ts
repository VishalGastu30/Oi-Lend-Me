import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// POST /api/groups/[id]/join-requests - Apply to join group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
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

    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group || !(group as any).isVerified) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a member of this group' },
        { status: 400 }
      );
    }

    // Check for pending join requests (max 3)
    const pendingRequests = await prisma.groupJoinRequest.count({
      where: {
        userId: user.id,
        status: 'PENDING',
      },
    });

    if (pendingRequests >= 3) {
      return NextResponse.json(
        { error: 'You have too many pending join requests. Maximum 3 allowed.' },
        { status: 429 }
      );
    }

    // Check if already has pending request for this group
    const existingRequest = await prisma.groupJoinRequest.findFirst({
      where: {
        groupId: id,
        userId: user.id,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this group' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { message } = body;

    const joinRequest = await prisma.groupJoinRequest.create({
      data: {
        groupId: id,
        userId: user.id,
        message: message || null,
        status: 'PENDING',
      },
    });

    // Notify group admins
    const groupAdmins = await prisma.groupMember.findMany({
      where: {
        groupId: id,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    await Promise.all(
      groupAdmins.map((admin) =>
        prisma.notification.create({
          data: {
            userId: admin.userId,
            type: 'SYSTEM',
            message: `${user.name} wants to join ${group.name}`,
            resourcePath: `/groups/${id}/requests`,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      joinRequest,
    });
  } catch (error) {
    console.error('Error creating join request:', error);
    return NextResponse.json(
      { error: 'Failed to create join request' },
      { status: 500 }
    );
  }
}

// GET /api/groups/[id]/join-requests - List pending join requests (Group Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
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

    const searchParams = request.nextUrl.searchParams;
    const checkMembership = searchParams.get('check');
    
    // For checking personal membership status/role specifically
    if (checkMembership === 'true') {
         return NextResponse.json({ 
             membership: {
                 role: membership.role,
                 status: membership.status
             }
         });
    }

    const joinRequests = await prisma.groupJoinRequest.findMany({
      where: {
        groupId: id,
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get user details for each request
    const requestsWithUsers = await Promise.all(
      joinRequests.map(async (req) => {
        const applicant = await prisma.user.findUnique({
          where: { id: req.userId },
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            karmaScore: true,
          },
        });

        return {
          ...req,
          applicant,
        };
      })
    );

    return NextResponse.json({ joinRequests: requestsWithUsers });
  } catch (error) {
    console.error('Error fetching join requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch join requests' },
      { status: 500 }
    );
  }
}
