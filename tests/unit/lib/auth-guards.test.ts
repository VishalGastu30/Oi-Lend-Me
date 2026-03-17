/**
 * Unit Tests — Auth Guards (src/lib/auth-guards.ts)
 * Pure function tests — no mocking needed
 */
import { isAdmin, isUser, requiresAuth, isAdminRoute, isUserRoute, getRedirectForRole, getLoginForRole } from '@/lib/auth-guards';

describe('Auth Guards', () => {
  describe('isAdmin', () => {
    it('returns true for ADMIN role', () => {
      expect(isAdmin({ userId: '1', role: 'ADMIN' })).toBe(true);
    });
    it('returns false for STUDENT role', () => {
      expect(isAdmin({ userId: '1', role: 'STUDENT' })).toBe(false);
    });
    it('returns false for null session', () => {
      expect(isAdmin(null)).toBe(false);
    });
  });

  describe('isUser', () => {
    it('returns true for STUDENT role', () => {
      expect(isUser({ userId: '1', role: 'STUDENT' })).toBe(true);
    });
    it('returns false for ADMIN role', () => {
      expect(isUser({ userId: '1', role: 'ADMIN' })).toBe(false);
    });
    it('returns false for null session', () => {
      expect(isUser(null)).toBe(false);
    });
  });

  describe('requiresAuth', () => {
    it('returns false for public routes', () => {
      expect(requiresAuth('/')).toBe(false);
      expect(requiresAuth('/login')).toBe(false);
      expect(requiresAuth('/auth/signup')).toBe(false);
      expect(requiresAuth('/admin/login')).toBe(false);
    });
    it('returns false for API auth routes', () => {
      expect(requiresAuth('/api/auth/login')).toBe(false);
      expect(requiresAuth('/api/auth/signup')).toBe(false);
    });
    it('returns true for protected routes', () => {
      expect(requiresAuth('/home')).toBe(true);
      expect(requiresAuth('/dashboard')).toBe(true);
      expect(requiresAuth('/admin')).toBe(true);
      expect(requiresAuth('/api/items')).toBe(true);
    });
  });

  describe('isAdminRoute', () => {
    it('matches admin routes', () => {
      expect(isAdminRoute('/admin')).toBe(true);
      expect(isAdminRoute('/admin/moderation')).toBe(true);
    });
    it('does not match user routes', () => {
      expect(isAdminRoute('/home')).toBe(false);
      expect(isAdminRoute('/items')).toBe(false);
    });
  });

  describe('isUserRoute', () => {
    it('matches user routes', () => {
      expect(isUserRoute('/home')).toBe(true);
      expect(isUserRoute('/chat')).toBe(true);
      expect(isUserRoute('/groups')).toBe(true);
      expect(isUserRoute('/items/123')).toBe(true);
    });
    it('does not match admin routes', () => {
      expect(isUserRoute('/admin')).toBe(false);
    });
  });

  describe('getRedirectForRole', () => {
    it('returns /auth/role-select for ADMIN', () => {
      expect(getRedirectForRole('ADMIN')).toBe('/auth/role-select');
    });
    it('returns /home for STUDENT', () => {
      expect(getRedirectForRole('STUDENT')).toBe('/home');
    });
    it('returns /home for null', () => {
      expect(getRedirectForRole(null)).toBe('/home');
    });
  });

  describe('getLoginForRole', () => {
    it('returns /admin/login for ADMIN', () => {
      expect(getLoginForRole('ADMIN')).toBe('/admin/login');
    });
    it('returns /login for STUDENT', () => {
      expect(getLoginForRole('STUDENT')).toBe('/login');
    });
  });
});
