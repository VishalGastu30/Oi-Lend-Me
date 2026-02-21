import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth-node';
import { signJWT } from '@/lib/auth-edge';
import { parseBody, successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-utils';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: Request) {
  const { data, error } = await parseBody(request, loginSchema);
  if (error) return error;
  if (!data) return errorResponse('Invalid input', 400);

  const { email, password } = data;

  // -------------------------------------------------------------
  // 1️⃣ HARDCODED ADMIN CHECK (MANDATORY)
  // -------------------------------------------------------------
  if (email === 'valiantvishal30@gmail.com' && password === 'IamAdmin@3004') {
    // Ensure admin exists in DB so we have an ID for logs/relationships
    // We do NOT use the passwordHash for login here, but we need the record.
    const adminUser = await prisma.user.upsert({
      where: { email: 'valiantvishal30@gmail.com' },
      update: { role: 'ADMIN' },
      create: {
        email: 'valiantvishal30@gmail.com',
        name: 'Super Admin',
        role: 'ADMIN',
        // Arbitrary hash, logic bypasses it for these exact credentials
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwx', 
      },
    });

    const token = await signJWT({
      userId: adminUser.id,
      email: adminUser.email,
      role: 'ADMIN',
    });

    const response = successResponse({
      user: adminUser,
      token,
      redirectTo: '/auth/role-select', // Explicit signal for frontend
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  }
  // -------------------------------------------------------------

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Generic error message for security
    if (!user || !user.passwordHash) {
      return unauthorizedResponse('Invalid credentials');
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return unauthorizedResponse('Invalid credentials');
    }

    // Block logic: Database check if this user is an admin but tried normal login?
    // Prompt says: "Invalid credentials: Login fails normally"
    // "Any other valid credentials: User is redirected to Normal User App"
    // So if I have a DB user who is ADMIN but entered wrong password?
    // They fail usage of standard flow.
    // If they enter correct password (hashed) but are admin?
    // The prompt says "If admin: Issue admin session... Redirect to /admin".
    // But verifyPassword logic is what we are in now.
    // If a user manages to login via this flow and IS an admin (e.g. they changed their password manually in DB),
    // they should still probably go to /admin.
    
    // However, the "HARDCODED" rule implies ONLY that combo is the "God Mode".
    // I wont interfere with normal auth flow beyond this.

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { passwordHash: _, ...userWithoutHash } = user;

    const response = successResponse({
      user: userWithoutHash,
      token,
      // If they somehow logged in as ADMIN via standard flow (unlikely given hardcode requirement, but possible if seeded)
      redirectTo: user.role === 'ADMIN' ? '/auth/role-select' : '/home',
    });

    // Set cookie for middleware
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;

  } catch (e) {
    console.error('Login error:', e);
    return errorResponse('Internal server error', 500);
  }
}
