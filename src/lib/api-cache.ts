/**
 * API Cache and Request Deduplication System
 * Used to optimize CoinGecko API calls and avoid rate limiting
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// In-memory cache store
const cache = new Map<string, CacheEntry<any>>();

// Pending requests (for deduplication)
const pendingRequests = new Map<string, Promise<any>>();

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const COINS_LIST_TTL = 60 * 60 * 1000; // 1 hour (coins list updates less frequently)

/**
 * Generate cache key
 */
function getCacheKey(url: string, options?: RequestInit): string {
  const headers = options?.headers as Record<string, string> | undefined;
  const apiKey = headers?.['x-cg-pro-api-key'] || 'free';
  return `${url}:${apiKey}`;
}

/**
 * Get data from cache
 */
function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  console.log(`[Cache] Hit: ${key.substring(0, 60)}...`);
  return entry.data as T;
}

/**
 * Store data to cache
 */
function setCache<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttl,
  };

  cache.set(key, entry);
  console.log(`[Cache] Set: ${key.substring(0, 60)}... (TTL: ${ttl / 1000}s)`);
}

/**
 * Cached fetch wrapper
 * - Auto cache responses
 * - Request deduplication (only make one request at a time for same URL)
 * - Rate limit handling
 */
export async function cachedFetch<T = any>(
  url: string,
  options?: RequestInit,
  ttl: number = CACHE_TTL
): Promise<T> {
  const cacheKey = getCacheKey(url, options);

  // 1. Check cache
  const cached = getFromCache<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // 2. Check if same request is in progress (deduplication)
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    console.log(`[Cache] Dedup: ${url.substring(0, 60)}...`);
    return pending;
  }

  // 3. Make new request
  const requestPromise = (async () => {
    try {
      console.log(`[API] Request: ${url.substring(0, 80)}...`);

      const response = await fetch(url, {
        ...options,
        next: { revalidate: ttl / 1000 }, // Next.js cache
      });

      // Handle rate limit
      if (response.status === 429) {
        console.warn('[API] Rate limit (429) - using cache or fallback');
        throw new Error('RATE_LIMIT');
      }

      if (!response.ok) {
        console.warn(`[API] Error ${response.status}: ${url.substring(0, 60)}...`);
        throw new Error(`HTTP_${response.status}`);
      }

      const data = await response.json();

      // Store to cache
      setCache(cacheKey, data, ttl);

      return data;
    } finally {
      // Clear pending status
      pendingRequests.delete(cacheKey);
    }
  })();

  // Record in-progress request
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  cache.clear();
  console.log('[Cache] Cleared all cache');
}

/**
 * Clean up expired cache (periodic cleanup)
 */
export function cleanupExpiredCache(): void {
  const now = Date.now();
  let count = 0;

  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
      count++;
    }
  }

  if (count > 0) {
    console.log(`[Cache] Cleaned up ${count} expired entries`);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  activeRequests: number;
  oldestEntry: number | null;
} {
  const now = Date.now();
  let oldestEntry: number | null = null;

  for (const entry of cache.values()) {
    const age = now - entry.timestamp;
    if (oldestEntry === null || age > oldestEntry) {
      oldestEntry = age;
    }
  }

  return {
    totalEntries: cache.size,
    activeRequests: pendingRequests.size,
    oldestEntry,
  };
}

// Periodic cleanup of expired cache (every 10 minutes)
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredCache, 10 * 60 * 1000);
}

export { CACHE_TTL, COINS_LIST_TTL };
