import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';

// GET /api/admin/items/search?q=... — fuzzy search items by name
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

    const items = await prisma.item.findMany({
      where: q ? {
        name: { contains: q, mode: 'insensitive' }
      } : {},
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Admin item search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
