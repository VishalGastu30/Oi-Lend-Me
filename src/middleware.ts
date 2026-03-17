import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth-edge';
import { rateLimit } from '@/lib/rate-limiter';

// Public paths that don't require authentication
const PUBLIC_PATHS = ['/'];
const AUTH_PATHS = ['/auth/login', '/auth/signup'];
const PUBLIC_API_PATHS = ['/api/testimonials', '/api/search'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Bypass static files and Next.js internals
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.includes('.') // images, etc.
  ) {
    return NextResponse.next();
  }

  // Rate Limiting for auth endpoints to prevent brute-force attacks
  if (pathname.startsWith('/api/auth')) {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const limitResult = rateLimit(ip, 10, 5 * 60 * 1000); // 10 requests per 5 minutes per IP
    if (!limitResult.success) {
       return NextResponse.json({ error: 'Too many requests, please slow down.' }, { status: 429 });
    }
  }

  // 2. Check Authentication
  const token = request.cookies.get('auth-token')?.value;
  
  let isAuthenticated = false;
  let userRole = null;

  if (token) {
    const payload = await verifyJWT<{ userId: string; role: string }>(token);
    if (payload) {
      isAuthenticated = true;
      userRole = payload.role;
    }
  }

  // 3. Allow API auth routes and public API routes
  if (pathname.startsWith('/api/auth') || PUBLIC_API_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 4. Landing page logic
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 5. Admin login page
  if (pathname === '/admin/login') {
    if (isAuthenticated) {
      // Already logged in
      if (userRole === 'ADMIN') {
        // Admin already logged in -> redirect to admin dashboard
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        // User trying to access admin login -> redirect to user login
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
    // Not logged in -> show admin login page
    return NextResponse.next();
  }

  // 6. User auth pages (login/signup)
  if (AUTH_PATHS.includes(pathname)) {
    if (isAuthenticated) {
      // Already logged in
      if (userRole === 'ADMIN') {
        // Admin trying to access user login -> redirect to admin login
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      // User already logged in -> redirect to home
      return NextResponse.redirect(new URL('/home', request.url));
    }
    // Not logged in -> show auth page
    return NextResponse.next();
  }

  // 7. All other routes require authentication
  if (!isAuthenticated) {
    // If it's an API route, return 401 JSON instead of redirecting to login
    // This prevents "Unexpected token <" errors when components try to parse HTML as JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access this resource' },
        { status: 401 }
      );
    }

    // Not logged in -> Redirect to appropriate login page
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 8. Role-Based Access Control (RBAC)
  
  // Admin routes - only admins allowed
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'ADMIN') {
      // User trying to access admin routes -> redirect to home
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  // User routes - formerly admins not allowed, now allowed via role-select
  const userOnlyRoutes = ['/home', '/browse', '/my-items', '/chat', '/groups', '/activity', '/items'];
  // const isUserRoute = userOnlyRoutes.some(route => pathname.startsWith(route));
  // if (isUserRoute && userRole === 'ADMIN') { return NextResponse.redirect(new URL('/admin', request.url)); }

  // Authenticated and authorized -> Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
