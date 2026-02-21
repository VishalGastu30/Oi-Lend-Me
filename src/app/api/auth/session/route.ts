import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-node';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ user: null });
    }
    
    // Fetch full user details if needed, but session usually has basic info
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
      }
    });
    
    if (!user) {
        return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
