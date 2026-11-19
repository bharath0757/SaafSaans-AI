/**
 * In-memory per-client rate limiter with a bounded map (LRU eviction).
 * Suitable for single-instance / Fluid Compute; replace with Redis in multi-region later.
 */

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const MAX_KEYS = 10_000;

export class RateLimiter {
  private readonly windowMs: number;
  private readonly max: number;
  private readonly buckets = new Map<string, Bucket>();

  /**
   * @param max - Max requests per window
   * @param windowMs - Window length in milliseconds
   */
  constructor(max = 60, windowMs = 60_000) {
    this.max = max;
    this.windowMs = windowMs;
  }

  /** Check and consume one request for the given client key. */
  check(key: string): RateLimitResult {
    const now = Date.now();
    this.evictIfNeeded();
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + this.windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: this.max - 1, resetAt };
    }

    if (existing.count >= this.max) {
      return { allowed: false, remaining: 0, resetAt: existing.resetAt };
    }

    existing.count += 1;
    this.buckets.set(key, existing);
    return {
      allowed: true,
      remaining: this.max - existing.count,
      resetAt: existing.resetAt,
    };
  }

  /** Current number of tracked keys (tests / diagnostics). */
  size(): number {
    return this.buckets.size;
  }

  private evictIfNeeded(): void {
    if (this.buckets.size < MAX_KEYS) return;
    const first = this.buckets.keys().next().value;
    if (first !== undefined) {
      this.buckets.delete(first);
    }
  }
}

/** Shared limiter for API routes (60 req / min / client). */
export const apiRateLimiter = new RateLimiter(60, 60_000);

/**
 * Derive a coarse client key from request headers (no PII stored).
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "anonymous";
}
