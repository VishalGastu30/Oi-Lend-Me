/**
 * Test Utilities
 * Shared helpers for creating test data and making authenticated API requests
 */
import { SignJWT } from 'jose';

// ------- Constants -------
export const TEST_SECRET = 'test-secret-do-not-use-in-production-32chars!!';
export const TEST_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'alice@test.edu',
  name: 'Alice Test',
  role: 'STUDENT' as const,
  passwordHash: '$2b$10$abcdefghijklmnopqrstuvwx',
  karmaScore: 100,
  avatarUrl: null,
  phoneNumber: null,
  createdAt: new Date('2025-01-01'),
  lastSeen: new Date('2025-01-01'),
  isOnline: false,
  about: null,
  latitude: null,
  longitude: null,
  bannedUntil: null,
};

export const TEST_ADMIN = {
  id: '00000000-0000-0000-0000-000000000099',
  email: 'admin@test.edu',
  name: 'Admin Test',
  role: 'ADMIN' as const,
  passwordHash: '$2b$10$abcdefghijklmnopqrstuvwx',
  karmaScore: 0,
  avatarUrl: null,
  phoneNumber: null,
  createdAt: new Date('2025-01-01'),
  lastSeen: new Date('2025-01-01'),
  isOnline: false,
  about: null,
  latitude: null,
  longitude: null,
  bannedUntil: null,
};

export const TEST_USER_BOB = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'bob@test.edu',
  name: 'Bob Test',
  role: 'STUDENT' as const,
  passwordHash: '$2b$10$abcdefghijklmnopqrstuvwx',
  karmaScore: 50,
  avatarUrl: null,
  phoneNumber: null,
  createdAt: new Date('2025-01-01'),
  lastSeen: new Date('2025-01-01'),
  isOnline: false,
  about: null,
  latitude: null,
  longitude: null,
  bannedUntil: null,
};

export const TEST_ITEM = {
  id: '00000000-0000-0000-0000-000000000010',
  name: 'Test Camera',
  description: 'A test camera for lending',
  category: 'Electronics' as const,
  imageUrl: 'https://example.com/camera.jpg',
  status: 'AVAILABLE' as const,
  ownerId: TEST_USER.id,
  groupId: null,
  createdAt: new Date('2025-01-01'),
  price: null,
  latitude: null,
  longitude: null,
  condition: 'GOOD',
  lenderNote: null,
  maxLendingDays: 7,
  deposit: null,
};

export const TEST_REQUEST = {
  id: '00000000-0000-0000-0000-000000000020',
  itemId: TEST_ITEM.id,
  requesterId: TEST_USER_BOB.id,
  status: 'PENDING' as const,
  startDate: new Date('2025-01-10'),
  endDate: new Date('2025-01-17'),
  returnedAt: null,
  updatedAt: new Date('2025-01-01'),
  createdAt: new Date('2025-01-01'),
  conversationId: null,
};

// ------- Auth Helpers -------

/**
 * Generate a valid JWT token for testing
 */
export async function generateTestToken(payload: {
  userId: string;
  email: string;
  role: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(TEST_SECRET);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);
}

/**
 * Create a mock Request object with auth cookie
 */
export async function createAuthenticatedRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    user?: typeof TEST_USER;
  } = {}
): Promise<Request> {
  const user = options.user || TEST_USER;
  const token = await generateTestToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const headers: Record<string, string> = {
    'Cookie': `auth-token=${token}`,
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  return new Request(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

/**
 * Create an unauthenticated request
 */
export function createUnauthenticatedRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
  } = {}
): Request {
  const headers: Record<string, string> = {};

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  return new Request(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

/**
 * Parse a NextResponse body
 */
export async function parseResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * UUID v4 generator for test data
 */
export function testUUID(suffix: string): string {
  return `00000000-0000-0000-0000-${suffix.padStart(12, '0')}`;
}
