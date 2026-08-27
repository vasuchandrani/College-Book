/**
 * In-Memory Client Cache with Stale-While-Revalidate pattern.
 * Enables 0ms instantaneous tab switching and background synchronization.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

const memoryStore = new Map<string, CacheEntry<any>>();

export const clientCache = {
  get<T>(key: string): T | null {
    const entry = memoryStore.get(key);
    if (!entry) return null;
    return entry.data as T;
  },

  isFresh(key: string): boolean {
    const entry = memoryStore.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp < entry.ttlMs;
  },

  set<T>(key: string, data: T, ttlMs = 300_000): void {
    memoryStore.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
    });
  },

  invalidate(prefix?: string): void {
    if (!prefix) {
      memoryStore.clear();
      return;
    }
    for (const key of memoryStore.keys()) {
      if (key.startsWith(prefix)) {
        memoryStore.delete(key);
      }
    }
  },
};
