import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { mode } = await request.json();
    
    if (mode !== 'admin' && mode !== 'user') {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set('view-mode', mode, {
      path: '/',
      httpOnly: false, // Accessible by client-side for immediate UI adjustment
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({ success: true, mode });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
