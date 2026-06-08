// In-memory rate limiter for serverless (works per-instance on Vercel)
// For 2000+ societies, this prevents brute-force attacks on login

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries inline (no setInterval — serverless unsafe)
function cleanupStale() {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (val.resetAt < now) rateLimitMap.delete(key);
  }
}

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number; resetIn: number } {
  cleanupStale(); // safe inline cleanup (no setInterval in serverless)
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetAt - now,
  };
}

// Auth rate limit: 15 attempts per minute per IP
// (5 was too strict — shared IPs and retry loops caused false lockouts)
export function authRateLimit(ip: string): boolean {
  return rateLimit(`auth:${ip}`, 15, 60 * 1000).allowed;
}

// General API rate limit: 60 requests per minute per user
export function apiRateLimit(userId: string): boolean {
  return rateLimit(`api:${userId}`, 60, 60 * 1000).allowed;
}
