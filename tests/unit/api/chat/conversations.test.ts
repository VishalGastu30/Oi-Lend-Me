/**
 * Unit Tests — Chat/Conversations API
 */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    conversation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    message: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    blockedUser: { findFirst: jest.fn() },
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

describe('Conversations API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/conversations', () => {
    let GET: Function;

    beforeAll(async () => {
      const module = await import('@/app/api/conversations/route');
      GET = module.GET;
    });

    it('returns 401 for unauthenticated user', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/conversations');
      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('returns conversations for authenticated user', async () => {
      mockGetSession.mockResolvedValue({
        userId: TEST_USER.id,
        email: TEST_USER.email,
        role: 'STUDENT',
      });
      mockPrisma.conversation.findMany.mockResolvedValue([
        {
          id: 'c1', userAId: TEST_USER.id, userBId: 'u2',
          userA: { id: TEST_USER.id, name: 'Alice' },
          userB: { id: 'u2', name: 'Bob' },
          messages: [{ content: 'Hello', createdAt: new Date() }],
          requests: [],
        },
      ]);

      const request = new Request('http://localhost:3000/api/conversations');
      const response = await GET(request);
      expect(response.status).toBe(200);
    });
  });
});
