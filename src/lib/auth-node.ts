import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { verifyJWT } from './auth-edge';
import { redirect } from 'next/navigation';
import { checkEnforcementStatus } from './moderation';

export async function hashPassword(password: string): Promise<string> {
  // 10 rounds is standard for bcrypt
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Get current session - supports both cookies() and Request objects
 */
export async function getSession(request?: Request) {
  let token: string | undefined;

  if (request) {
    // Try to get token from request cookies
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const authCookie = cookies.find(c => c.startsWith('auth-token='));
      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }
    
    // Fallback to Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }
  } else {
    // Use Next.js cookies() helper
    const cookieStore = await cookies();
    token = cookieStore.get('auth-token')?.value;
  }
  
  if (!token) return null;
  
  const payload = await verifyJWT<{ userId: string; email: string; role: string }>(token);
  if (!payload) return null;

  // Hard Access Control: Check enforcement status
  // We only do this for non-admin users to avoid locking out admins
  if (payload.role !== 'ADMIN') {
    const { status } = await checkEnforcementStatus(payload.userId);
    if (status === 'PERMA_BANNED' || status === 'SUSPENDED') {
      return null; // Effectively logs them out/blocks access
    }
  }

  return payload;
}

/**
 * Require admin role - redirects to /admin/login if not admin
 */
export async function requireAdmin() {
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }
  
  return session;
}

/**
 * Require user role - redirects to /login if not user
 */
export async function requireUser() {
  const session = await getSession();
  
  if (!session || session.role !== 'STUDENT') {
    redirect('/login');
  }
  
  return session;
}
