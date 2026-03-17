/**
 * Unit Tests — Admin Moderation API Routes
 * Tests warn, suspend, ban, unban, revoke-suspension
 */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    userWarn: { create: jest.fn() },
    userSuspension: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    userBan: { upsert: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    adminActionLog: { create: jest.fn() },
    moderationAction: { create: jest.fn() },
  },
}));

jest.mock('@/lib/auth-node', () => ({
  getSession: jest.fn(),
}));

jest.mock('@/lib/moderation', () => ({
  checkEnforcementStatus: jest.fn().mockResolvedValue({ status: 'CLEAR', reason: null }),
}));

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-node';
import { TEST_USER, TEST_ADMIN, TEST_USER_BOB } from '../../../helpers/test-utils';

const mockPrisma = prisma as any;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe('Admin Moderation API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/admin/users/[id]/warn', () => {
    let warnPOST: Function;

    beforeAll(async () => {
      const module = await import('@/app/api/admin/users/[id]/warn/route');
      warnPOST = module.POST;
    });

    it('returns 401 for unauthenticated user', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/admin/users/u1/warn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Bad behavior' }),
      });

      const response = await warnPOST(request, { params: Promise.resolve({ id: 'u1' }) });
      expect(response.status).toBe(401);
    });

    it('returns 403 for non-admin user', async () => {
      mockGetSession.mockResolvedValue({ userId: TEST_USER.id, email: TEST_USER.email, role: 'STUDENT' });
      mockPrisma.user.findUnique.mockResolvedValue(TEST_USER); // Requester is STUDENT

      const request = new Request('http://localhost:3000/api/admin/users/u1/warn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Bad behavior' }),
      });

      const response = await warnPOST(request, { params: Promise.resolve({ id: 'u1' }) });
      expect(response.status).toBe(403);
    });

    it('warns user successfully when admin', async () => {
      mockGetSession.mockResolvedValue({ userId: TEST_ADMIN.id, email: TEST_ADMIN.email, role: 'ADMIN' });
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(TEST_ADMIN) // Admin lookup
        .mockResolvedValueOnce(TEST_USER_BOB); // Target user lookup
      mockPrisma.userWarn.create.mockResolvedValue({ id: 'w1' });
      mockPrisma.adminActionLog.create.mockResolvedValue({});
      mockPrisma.moderationAction.create.mockResolvedValue({});

      const request = new Request('http://localhost:3000/api/admin/users/u1/warn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Inappropriate language' }),
      });

      const response = await warnPOST(request, { params: Promise.resolve({ id: TEST_USER_BOB.id }) });
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/admin/users/[id]/ban', () => {
    let banPOST: Function;

    beforeAll(async () => {
      const module = await import('@/app/api/admin/users/[id]/ban/route');
      banPOST = module.POST;
    });

    it('bans user successfully when admin', async () => {
      mockGetSession.mockResolvedValue({ userId: TEST_ADMIN.id, email: TEST_ADMIN.email, role: 'ADMIN' });
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(TEST_ADMIN)
        .mockResolvedValueOnce(TEST_USER_BOB);
      mockPrisma.userBan.upsert.mockResolvedValue({ id: 'b1' });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.adminActionLog.create.mockResolvedValue({});
      mockPrisma.moderationAction.create.mockResolvedValue({});

      const request = new Request('http://localhost:3000/api/admin/users/u1/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Repeated violations' }),
      });

      const response = await banPOST(request, { params: Promise.resolve({ id: TEST_USER_BOB.id }) });
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
    });

    it('returns 400 when reason is missing', async () => {
      mockGetSession.mockResolvedValue({ userId: TEST_ADMIN.id, email: TEST_ADMIN.email, role: 'ADMIN' });
      mockPrisma.user.findUnique.mockResolvedValueOnce(TEST_ADMIN);

      const request = new Request('http://localhost:3000/api/admin/users/u1/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await banPOST(request, { params: Promise.resolve({ id: TEST_USER_BOB.id }) });
      expect(response.status).toBe(400);
    });

    it('returns 404 for non-existent user', async () => {
      mockGetSession.mockResolvedValue({ userId: TEST_ADMIN.id, email: TEST_ADMIN.email, role: 'ADMIN' });
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(TEST_ADMIN)
        .mockResolvedValueOnce(null); // Target not found

      const request = new Request('http://localhost:3000/api/admin/users/u1/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Test' }),
      });

      const response = await banPOST(request, { params: Promise.resolve({ id: 'nonexistent' }) });
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/admin/users/[id]/suspend', () => {
    let suspendPOST: Function;

    beforeAll(async () => {
      const module = await import('@/app/api/admin/users/[id]/suspend/route');
      suspendPOST = module.POST;
    });

    it('returns 401 for unauthenticated user', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/admin/users/u1/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Test', durationDays: 7 }),
      });

      const response = await suspendPOST(request, { params: Promise.resolve({ id: 'u1' }) });
      expect(response.status).toBe(401);
    });
  });
});
