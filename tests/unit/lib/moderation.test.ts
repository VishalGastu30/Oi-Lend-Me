/**
 * Unit Tests — Moderation Logic (src/lib/moderation.ts)
 * Tests checkEnforcementStatus for ban, suspension, warning, clear states
 */

// Mock prisma before importing
jest.mock('@/lib/prisma', () => ({
  prisma: {
    userBan: { findFirst: jest.fn() },
    userSuspension: { findFirst: jest.fn() },
    userWarn: { findFirst: jest.fn() },
  },
}));

import { checkEnforcementStatus } from '@/lib/moderation';
import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as any;

describe('checkEnforcementStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns PERMA_BANNED when active ban exists', async () => {
    mockPrisma.userBan.findFirst.mockResolvedValue({
      id: '1', userId: 'u1', reason: 'Spam', revokedAt: null,
    });

    const result = await checkEnforcementStatus('u1');
    expect(result).toEqual({ status: 'PERMA_BANNED', reason: 'Spam' });
    expect(mockPrisma.userBan.findFirst).toHaveBeenCalledWith({
      where: { userId: 'u1', revokedAt: null },
    });
  });

  it('returns SUSPENDED when active suspension exists (ban check passes)', async () => {
    mockPrisma.userBan.findFirst.mockResolvedValue(null);
    mockPrisma.userSuspension.findFirst.mockResolvedValue({
      id: '2', userId: 'u1', reason: 'Misconduct', endAt: new Date(Date.now() + 86400000),
    });

    const result = await checkEnforcementStatus('u1');
    expect(result).toEqual({ status: 'SUSPENDED', reason: 'Misconduct' });
  });

  it('returns WARN when unacknowledged warning exists (ban & suspension pass)', async () => {
    mockPrisma.userBan.findFirst.mockResolvedValue(null);
    mockPrisma.userSuspension.findFirst.mockResolvedValue(null);
    mockPrisma.userWarn.findFirst.mockResolvedValue({
      id: '3', userId: 'u1', reason: 'Language', acknowledged: false,
    });

    const result = await checkEnforcementStatus('u1');
    expect(result).toEqual({ status: 'WARN', reason: 'Language' });
  });

  it('returns CLEAR when no enforcement actions exist', async () => {
    mockPrisma.userBan.findFirst.mockResolvedValue(null);
    mockPrisma.userSuspension.findFirst.mockResolvedValue(null);
    mockPrisma.userWarn.findFirst.mockResolvedValue(null);

    const result = await checkEnforcementStatus('u1');
    expect(result).toEqual({ status: 'CLEAR', reason: null });
  });

  it('prioritizes ban over suspension over warning', async () => {
    mockPrisma.userBan.findFirst.mockResolvedValue({
      id: '1', reason: 'Major offense', revokedAt: null,
    });
    // These should not be checked if ban found
    mockPrisma.userSuspension.findFirst.mockResolvedValue({ id: '2', reason: 'Minor' });
    mockPrisma.userWarn.findFirst.mockResolvedValue({ id: '3', reason: 'Warning' });

    const result = await checkEnforcementStatus('u1');
    expect(result.status).toBe('PERMA_BANNED');
    expect(mockPrisma.userSuspension.findFirst).not.toHaveBeenCalled();
    expect(mockPrisma.userWarn.findFirst).not.toHaveBeenCalled();
  });
});
