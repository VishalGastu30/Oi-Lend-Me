import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// GET /api/admin/users/search?q=... — fuzzy search users by name/email
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || !session.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.email },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const q = request.nextUrl.searchParams.get('q')?.trim();

    // Fuzzy search using ILIKE (works on Postgres without extensions)
    const users = await prisma.user.findMany({
      where: q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ]
      } : {},
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        karmaScore: true,
        bannedUntil: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
