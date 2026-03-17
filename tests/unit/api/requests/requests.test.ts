/**
 * Unit Tests — Requests API Routes
 * Tests the full request state machine: create, approve, return, reject, cancel
 */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    request: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    item: { update: jest.fn(), findUnique: jest.fn() },
    user: { update: jest.fn(), findUnique: jest.fn() },
    reputationLog: { create: jest.fn() },
    notification: { create: jest.fn() },
    conversation: { findFirst: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}));

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { TEST_USER, TEST_USER_BOB, TEST_ITEM, TEST_REQUEST } from '../../../helpers/test-utils';

const mockPrisma = prisma as any;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe('Request State Machine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Approve Request', () => {
    let approvePATCH: Function;

    beforeAll(async () => {
      const module = await import('@/app/api/requests/[id]/approve/route');
      approvePATCH = module.PATCH;
    });

    it('returns 401 for unauthenticated user', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/requests/test-id/approve', {
        method: 'PATCH',
      });

      const response = await approvePATCH(request, { params: Promise.resolve({ id: 'test-id' }) });
      expect(response.status).toBe(401);
    });

    it('approves PENDING request and updates item to BORROWED', async () => {
      mockGetSession.mockResolvedValue({
        userId: TEST_USER.id,
        email: TEST_USER.email,
        role: 'STUDENT',
      });

      const pendingRequest = {
        ...TEST_REQUEST,
        status: 'PENDING',
        item: { ...TEST_ITEM, ownerId: TEST_USER.id },
      };

      // Mock transaction to execute the function
      mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
        const tx = {
          request: {
            findUnique: jest.fn().mockResolvedValue(pendingRequest),
            update: jest.fn().mockResolvedValue({ ...pendingRequest, status: 'BORROWED' }),
          },
          item: { update: jest.fn() },
          user: { update: jest.fn(), findUnique: jest.fn().mockResolvedValue({ name: 'Alice' }) },
          reputationLog: { create: jest.fn() },
          notification: { create: jest.fn() },
        };
        return fn(tx);
      });

      const request = new Request('http://localhost:3000/api/requests/test-id/approve', {
        method: 'PATCH',
      });

      const response = await approvePATCH(request, { params: Promise.resolve({ id: TEST_REQUEST.id }) });
      expect(response.status).toBe(200);
    });

    it('rejects approval of non-PENDING request', async () => {
      mockGetSession.mockResolvedValue({
        userId: TEST_USER.id,
        email: TEST_USER.email,
        role: 'STUDENT',
      });

      mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
        const tx = {
          request: {
            findUnique: jest.fn().mockResolvedValue({
              ...TEST_REQUEST,
              status: 'BORROWED', // Already borrowed
              item: { ...TEST_ITEM, ownerId: TEST_USER.id },
            }),
          },
        };
        return fn(tx);
      });

      const request = new Request('http://localhost:3000/api/requests/test-id/approve', {
        method: 'PATCH',
      });

      const response = await approvePATCH(request, { params: Promise.resolve({ id: TEST_REQUEST.id }) });
      expect(response.status).toBe(400);
    });

    it('returns 403 when non-owner tries to approve', async () => {
      mockGetSession.mockResolvedValue({
        userId: TEST_USER_BOB.id, // Bob is not the owner
        email: TEST_USER_BOB.email,
        role: 'STUDENT',
      });

      mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
        const tx = {
          request: {
            findUnique: jest.fn().mockResolvedValue({
              ...TEST_REQUEST,
              status: 'PENDING',
              item: { ...TEST_ITEM, ownerId: TEST_USER.id }, // Alice owns it
            }),
          },
        };
        return fn(tx);
      });

      const request = new Request('http://localhost:3000/api/requests/test-id/approve', {
        method: 'PATCH',
      });

      const response = await approvePATCH(request, { params: Promise.resolve({ id: TEST_REQUEST.id }) });
      expect(response.status).toBe(403);
    });

    it('returns 404 for non-existent request', async () => {
      mockGetSession.mockResolvedValue({
        userId: TEST_USER.id,
        email: TEST_USER.email,
        role: 'STUDENT',
      });

      mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
        const tx = {
          request: { findUnique: jest.fn().mockResolvedValue(null) },
        };
        return fn(tx);
      });

      const request = new Request('http://localhost:3000/api/requests/nonexistent/approve', {
        method: 'PATCH',
      });

      const response = await approvePATCH(request, { params: Promise.resolve({ id: 'nonexistent' }) });
      expect(response.status).toBe(404);
    });
  });
});
