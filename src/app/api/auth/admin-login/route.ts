import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signJWT } from '@/lib/auth-edge';

// Admin credentials (exact - do not modify)
const ADMIN_EMAIL = 'valiantvishal30@gmail.com';

// Rate limiting store (in-memory for now)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * POST /api/auth/admin-login
 * Admin-only login endpoint
 * Email + password only, no OAuth
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Only allow admin email
    if (email !== ADMIN_EMAIL) {
      // Log failed attempt
      console.warn(`[SECURITY] Failed admin login attempt with email: ${email}`);
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Rate limiting check
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const attempts = loginAttempts.get(clientIp);

    if (attempts && attempts.count >= MAX_ATTEMPTS && now < attempts.resetAt) {
      const remainingTime = Math.ceil((attempts.resetAt - now) / 1000 / 60);
      console.warn(`[SECURITY] Rate limit exceeded for IP: ${clientIp}`);
      
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${remainingTime} minutes.` },
        { status: 429 }
      );
    }

    // Find admin user
    const user = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user || user.role !== 'ADMIN') {
      // Log failed attempt
      console.warn(`[SECURITY] Admin user not found or role mismatch`);
      
      // Increment rate limit counter
      if (attempts && now < attempts.resetAt) {
        attempts.count++;
      } else {
        loginAttempts.set(clientIp, {
          count: 1,
          resetAt: now + LOCKOUT_DURATION,
        });
      }
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
    
    if (!isValidPassword) {
      // Log failed attempt
      console.warn(`[SECURITY] Invalid password for admin login`);
      
      // Increment rate limit counter
      if (attempts && now < attempts.resetAt) {
        attempts.count++;
      } else {
        loginAttempts.set(clientIp, {
          count: 1,
          resetAt: now + LOCKOUT_DURATION,
        });
      }
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Clear rate limit on successful login
    loginAttempts.delete(clientIp);

    // Create JWT token with role
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Log successful admin login
    console.log(`[SECURITY] Successful admin login: ${user.email}`);

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour for admin sessions
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[ERROR] Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
