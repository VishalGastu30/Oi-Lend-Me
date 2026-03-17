// src/lib/rate-limiter.ts
// Simple in-memory rate limiter for Edge Runtime

type RateLimitStore = Map<string, { count: number; expiresAt: number }>;

const store: RateLimitStore = new Map();

export function rateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now();
  const record = store.get(ip);

  // Clean up expired entries occasionally to prevent memory leak
  if (Math.random() < 0.01) {
    for (const [key, value] of store.entries()) {
      if (value.expiresAt < now) {
        store.delete(key);
      }
    }
  }

  if (!record) {
    store.set(ip, { count: 1, expiresAt: now + windowMs });
    return { success: true };
  }

  if (now > record.expiresAt) {
    store.set(ip, { count: 1, expiresAt: now + windowMs });
    return { success: true };
  }

  if (record.count >= limit) {
    return { success: false };
  }

  record.count += 1;
  return { success: true };
}
