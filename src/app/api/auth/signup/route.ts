import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-node';
import { signJWT } from '@/lib/auth-edge';
import { parseBody, successResponse, errorResponse } from '@/lib/api-utils';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phoneNumber: z.string().optional(),
});

export async function POST(request: Request) {
  const { data, error } = await parseBody(request, signupSchema);
  if (error) return error;
  if (!data) return errorResponse('Invalid input', 400);

  const { email, password, name, phoneNumber } = data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('User already exists', 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phoneNumber,
        // Role defaults to STUDENT via Prisma schema
      },
    });

    const token = await signJWT({
     userId: user.id,
     email: user.email,
     role: user.role,
    });
    
    // Do not return the password hash
    const { passwordHash: _, ...userWithoutHash } = user;

    const response = successResponse({
      user: userWithoutHash,
      token,
    }, 201);
    
    // Set cookie for middleware
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
    
  } catch (e) {
    console.error('Signup error:', e);
    return errorResponse('Internal server error', 500);
  }
}
