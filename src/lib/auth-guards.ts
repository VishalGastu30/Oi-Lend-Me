/**
 * Auth Guard Helpers
 * Role-based access control utilities for admin/user separation
 */

import { UserRole } from '@prisma/client';

export interface SessionWithRole {
  userId: string;
  email?: string;
  role: UserRole;
}

/**
 * Check if session belongs to an admin
 */
export function isAdmin(session: SessionWithRole | null): boolean {
  return session?.role === 'ADMIN';
}

/**
 * Check if session belongs to a regular user (STUDENT)
 */
export function isUser(session: SessionWithRole | null): boolean {
  return session?.role === 'STUDENT';
}

/**
 * Get appropriate redirect URL based on user role
 */
export function getRedirectForRole(role: UserRole | null | undefined): string {
  if (role === 'ADMIN') {
    return '/auth/role-select';
  }
  return '/home';
}

/**
 * Get appropriate login URL based on user role
 */
export function getLoginForRole(role: UserRole | null | undefined): string {
  if (role === 'ADMIN') {
    return '/admin/login';
  }
  return '/login';
}

/**
 * Check if a route is an admin route
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

/**
 * Check if a route is a user-only route
 */
export function isUserRoute(pathname: string): boolean {
  const userRoutes = ['/home', '/browse', '/my-items', '/chat', '/groups', '/activity', '/items'];
  return userRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if a route requires authentication
 */
export function requiresAuth(pathname: string): boolean {
  const publicRoutes = ['/', '/login', '/auth/signup', '/admin/login'];
  return !publicRoutes.includes(pathname) && !pathname.startsWith('/api/auth');
}
