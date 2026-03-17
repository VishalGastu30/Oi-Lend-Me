/**
 * Unit Tests — Auth API Routes
 * Tests login, signup, session handling
 */

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth-node', () => ({
  verifyPassword: jest.fn(),
  hashPassword: jest.fn(),
  getSession: jest.fn(),
}));

jest.mock('@/lib/auth-edge', () => ({
  signJWT: jest.fn().mockResolvedValue('mock-jwt-token'),
  verifyJWT: jest.fn(),
}));

jest.mock('@/lib/moderation', () => ({
  checkEnforcementStatus: jest.fn().mockResolvedValue({ status: 'CLEAR', reason: null }),
}));

import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/auth-node';
import { signJWT } from '@/lib/auth-edge';
import { TEST_USER, TEST_ADMIN } from '../../../helpers/test-utils';

const mockPrisma = prisma as any;
const mockVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;

// Dynamic import of route handlers
let loginPOST: Function;
let signupPOST: Function;

beforeAll(async () => {
  const loginModule = await import('@/app/api/auth/login/route');
  loginPOST = loginModule.POST;

  const signupModule = await import('@/app/api/auth/signup/route');
  signupPOST = signupModule.POST;
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with token for valid credentials', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(TEST_USER);
    mockVerifyPassword.mockResolvedValue(true);

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@test.edu', password: 'password123' }),
    });

    const response = await loginPOST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data.token).toBeDefined();
    expect(body.data.user.email).toBe('alice@test.edu');
  });

  it('returns 401 for invalid password', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(TEST_USER);
    mockVerifyPassword.mockResolvedValue(false);

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@test.edu', password: 'wrongpassword' }),
    });

    const response = await loginPOST(request);
    expect(response.status).toBe(401);
  });

  it('returns 401 for non-existent user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@test.edu', password: 'password123' }),
    });

    const response = await loginPOST(request);
    expect(response.status).toBe(401);
  });

  it('returns 400 for missing email', async () => {
    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'password123' }),
    });

    const response = await loginPOST(request);
    expect(response.status).toBe(400);
  });

  it('handles hardcoded admin login', async () => {
    mockPrisma.user.upsert.mockResolvedValue(TEST_ADMIN);

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'valiantvishal30@gmail.com',
        password: 'IamAdmin@3004',
      }),
    });

    const response = await loginPOST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data.redirectTo).toBe('/auth/role-select');
  });
});

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 for invalid email format', async () => {
    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'not-an-email',
        password: 'password123',
      }),
    });

    const response = await signupPOST(request);
    expect(response.status).toBe(400);
  });

  it('creates user and returns token for valid input', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null); // No existing user
    mockPrisma.user.create.mockResolvedValue({
      ...TEST_USER,
      email: 'newuser@test.edu',
      name: 'New User',
    });
    mockHashPassword.mockResolvedValue('hashed-password');

    const request = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New User',
        email: 'newuser@test.edu',
        password: 'password123',
      }),
    });

    const response = await signupPOST(request);
    // Signup should succeed (200 or 201)
    expect([200, 201]).toContain(response.status);
  });
});
