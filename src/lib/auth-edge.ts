import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-local-dev-key-change-me'
);

const ALG = 'HS256';

export async function signJWT(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('24h') // 24 hour expiry for dev
    .sign(JWT_SECRET);
}

export async function verifyJWT<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as T;
  } catch (error) {
    return null;
  }
}

export async function getSession(request: Request) {
  // Try to get token from cookie first
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const authCookie = cookies.find(c => c.startsWith('auth-token='));
    if (authCookie) {
      const token = authCookie.split('=')[1];
      return verifyJWT<{ userId: string; role: string }>(token);
    }
  }
  
  // Fallback to Authorization header for API clients
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    return verifyJWT<{ userId: string; role: string }>(token);
  }
  
  return null;
}
