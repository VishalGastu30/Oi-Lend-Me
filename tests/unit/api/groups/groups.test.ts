/**
 * Unit Tests — Groups API Routes
 * Tests group CRUD, join requests, member management
 */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    group: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    groupMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    groupJoinRequest: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    user: { findUnique: jest.fn() },
    $transaction: jest.fn((fn: Function) => fn()),
  },
}));

jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}));

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { TEST_USER } from '../../../helpers/test-utils';

const mockPrisma = prisma as any;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

import { NextRequest } from 'next/server';

describe('Groups API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/groups', () => {
    let GET: Function;

    beforeAll(async () => {
      const module = await import('@/app/api/groups/route');
      GET = module.GET;
    });

    it('returns groups list', async () => {
      mockPrisma.group.findMany.mockResolvedValue([
        { id: 'g1', name: 'Test Group', slug: 'test-group', category: 'HOBBY', memberCount: 5 },
      ]);
      mockPrisma.group.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/groups');
      const response = await GET(request);
      expect(response.status).toBe(200);
    });
  });
});
