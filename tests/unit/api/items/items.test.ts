/**
 * Unit Tests — Items API Routes
 * Tests GET (list, search, filter) and POST (create with validation)
 */

jest.mock('@/lib/prisma', () => ({
  prisma: {
    item: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    itemImage: { createMany: jest.fn() },
    $transaction: jest.fn((fn: Function) => fn({
      item: {
        create: jest.fn().mockResolvedValue({
          id: 'new-item-id', name: 'Test Item', status: 'AVAILABLE',
          imageUrl: null, ownerId: '00000000-0000-0000-0000-000000000001',
        }),
        update: jest.fn(),
      },
      itemImage: { createMany: jest.fn() },
    })),
  },
}));

jest.mock('@/lib/auth', () => ({
  getSession: jest.fn(),
}));

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { TEST_USER, TEST_ITEM } from '../../../helpers/test-utils';

const mockPrisma = prisma as any;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

let GET: Function;
let POST: Function;

beforeAll(async () => {
  const module = await import('@/app/api/items/route');
  GET = module.GET;
  POST = module.POST;
});

describe('GET /api/items', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns paginated items with default params', async () => {
    const mockItems = [
      { ...TEST_ITEM, owner: { id: TEST_USER.id, name: 'Alice', avatarUrl: null, karmaScore: 100 }, images: [] },
    ];
    mockPrisma.item.findMany.mockResolvedValue(mockItems);
    mockPrisma.item.count.mockResolvedValue(1);

    const request = new Request('http://localhost:3000/api/items');
    const response = await GET(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data.items).toHaveLength(1);
    expect(body.data.pagination).toBeDefined();
    expect(body.data.pagination.page).toBe(1);
  });

  it('filters by category', async () => {
    mockPrisma.item.findMany.mockResolvedValue([]);
    mockPrisma.item.count.mockResolvedValue(0);

    const request = new Request('http://localhost:3000/api/items?category=Electronics');
    await GET(request);

    expect(mockPrisma.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: 'Electronics',
        }),
      })
    );
  });

  it('supports search query', async () => {
    mockPrisma.item.findMany.mockResolvedValue([]);
    mockPrisma.item.count.mockResolvedValue(0);

    const request = new Request('http://localhost:3000/api/items?search=camera');
    await GET(request);

    expect(mockPrisma.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ contains: 'camera' }) }),
          ]),
        }),
      })
    );
  });

  it('returns suggestions when suggest=true', async () => {
    const suggestions = [
      { id: '1', name: 'Camera', category: 'Electronics' },
    ];
    mockPrisma.item.findMany.mockResolvedValue(suggestions);

    const request = new Request('http://localhost:3000/api/items?suggest=true&search=cam');
    const response = await GET(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.data).toHaveLength(1);
  });
});

describe('POST /api/items', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 for unauthenticated requests', async () => {
    mockGetSession.mockResolvedValue(null);

    const request = new Request('http://localhost:3000/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', category: 'Electronics' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid item data', async () => {
    mockGetSession.mockResolvedValue({ userId: TEST_USER.id, email: TEST_USER.email, role: 'STUDENT' });

    const request = new Request('http://localhost:3000/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ab', category: 'InvalidCategory' }),  // name too short, invalid category
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('creates item for authenticated user with valid data', async () => {
    mockGetSession.mockResolvedValue({ userId: TEST_USER.id, email: TEST_USER.email, role: 'STUDENT' });

    const request = new Request('http://localhost:3000/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Camera',
        description: 'Great camera for tests',
        category: 'Electronics',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
