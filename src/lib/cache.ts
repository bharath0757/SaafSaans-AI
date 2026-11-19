/**
 * In-memory TTL cache with LRU eviction and stale fallback support.
 */

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  staleUntil: number;
};

const MAX_CACHE_ENTRIES = 500;

export class TtlCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();
  private readonly ttlMs: number;
  private readonly staleTtlMs: number;

  /**
   * @param ttlMs - Time-to-live for fresh data in milliseconds (default 10 minutes)
   * @param staleTtlMs - Time data can be served as stale fallback in milliseconds (default 1 hour)
   */
  constructor(ttlMs = 10 * 60 * 1000, staleTtlMs = 60 * 60 * 1000) {
    this.ttlMs = ttlMs;
    this.staleTtlMs = staleTtlMs;
  }

  set(key: string, value: T): void {
    const now = Date.now();
    this.evictIfNeeded();
    this.store.set(key, {
      value,
      expiresAt: now + this.ttlMs,
      staleUntil: now + this.staleTtlMs,
    });
  }

  get(key: string): { value: T; isStale: boolean } | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now <= entry.expiresAt) {
      return { value: entry.value, isStale: false };
    }
    if (now <= entry.staleUntil) {
      return { value: entry.value, isStale: true };
    }

    this.store.delete(key);
    return null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  private evictIfNeeded(): void {
    if (this.store.size < MAX_CACHE_ENTRIES) return;
    const oldestKey = this.store.keys().next().value;
    if (oldestKey !== undefined) {
      this.store.delete(oldestKey);
    }
  }
}
