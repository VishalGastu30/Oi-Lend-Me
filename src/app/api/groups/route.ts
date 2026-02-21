import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// GET /api/groups - List all verified groups with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    
    const session = await getSession(request);
    const isAdmin = session?.role === 'ADMIN';

    // Build filter
    let where: any = {};
    
    if (!isAdmin) {
      where.isVerified = true;
      where.status = { not: 'PERMA_BANNED' };
    }

    if (category) {
      where.category = category;
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const groups = await prisma.group.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          }
        },
        // We might want to know if current user is member
      },
      orderBy: {
        memberCount: 'desc', // Popular groups first
      },
      take: 20,
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}
