import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth-edge';
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  // Get current user role before clearing token
  const token = request.cookies.get('auth-token')?.value;
  let redirectUrl = '/login';
  
  if (token) {
    const payload = await verifyJWT<{ userId: string; role: string }>(token);
    if (payload) {
      // Redirect admin to admin login, users to regular login
      redirectUrl = payload.role === 'ADMIN' ? '/admin/login' : '/login';

      // Set user offline
      try {
        await prisma.user.update({
          where: { id: payload.userId },
          data: { isOnline: false, lastSeen: new Date() }
        });
      } catch (e) {
        console.error("Failed to set offline status on logout", e);
      }
    }
  }
  
  const response = NextResponse.json({ 
    success: true,
    status: "logged_out",
    redirectUrl 
  });
  
  // Clear the auth-token cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  
  return response;
}
