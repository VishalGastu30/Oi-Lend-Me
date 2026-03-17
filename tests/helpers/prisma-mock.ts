/**
 * Prisma Mock Helper
 * Provides a mock PrismaClient for unit tests
 */
import { PrismaClient } from '@prisma/client';

// Deep mock of PrismaClient
const createMockPrisma = () => {
  const modelNames = [
    'user', 'group', 'groupMember', 'item', 'itemImage', 'request',
    'conversation', 'message', 'reputationLog', 'notification',
    'feedback', 'report', 'moderationAction', 'blockedUser',
    'requirement', 'requirementResponse', 'groupRequest', 'groupProof',
    'groupJoinRequest', 'groupItem', 'groupBooking', 'groupActionLog',
    'userWarn', 'userSuspension', 'userBan', 'adminActionLog',
  ];

  const mockMethods = [
    'findMany', 'findFirst', 'findUnique', 'create', 'createMany',
    'update', 'updateMany', 'upsert', 'delete', 'deleteMany', 'count',
    'aggregate', 'groupBy',
  ];

  const mock: any = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn((fn: Function) => fn(mock)),
    $executeRawUnsafe: jest.fn(),
    $queryRaw: jest.fn(),
  };

  for (const model of modelNames) {
    mock[model] = {};
    for (const method of mockMethods) {
      mock[model][method] = jest.fn();
    }
  }

  return mock as unknown as PrismaClient & { [key: string]: any };
};

export const prismaMock = createMockPrisma();

// Reset all mocks between tests
export function resetPrismaMock() {
  const resetObj = (obj: any) => {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'function' && obj[key].mockReset) {
        obj[key].mockReset();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        resetObj(obj[key]);
      }
    }
  };
  resetObj(prismaMock);
  // Re-setup $transaction to pass through
  prismaMock.$transaction.mockImplementation((fn: Function) => fn(prismaMock));
}
