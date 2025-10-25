/**
 * API 缓存和请求去重系统
 * 用于优化 CoinGecko API 调用，避免速率限制
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// 内存缓存存储
const cache = new Map<string, CacheEntry<any>>();

// 正在进行的请求（用于去重）
const pendingRequests = new Map<string, Promise<any>>();

// 缓存配置
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟
const COINS_LIST_TTL = 60 * 60 * 1000; // 1 小时（币种列表更新频率低）

/**
 * 生成缓存键
 */
function getCacheKey(url: string, options?: RequestInit): string {
  const headers = options?.headers as Record<string, string> | undefined;
  const apiKey = headers?.['x-cg-pro-api-key'] || 'free';
  return `${url}:${apiKey}`;
}

/**
 * 从缓存获取数据
 */
function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // 检查是否过期
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  console.log(`[Cache] Hit: ${key.substring(0, 60)}...`);
  return entry.data as T;
}

/**
 * 存储数据到缓存
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
 * 缓存的 fetch 包装器
 * - 自动缓存响应
 * - 请求去重（同时只发起一次相同请求）
 * - 速率限制处理
 */
export async function cachedFetch<T = any>(
  url: string,
  options?: RequestInit,
  ttl: number = CACHE_TTL
): Promise<T> {
  const cacheKey = getCacheKey(url, options);

  // 1. 检查缓存
  const cached = getFromCache<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // 2. 检查是否有相同请求正在进行（去重）
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    console.log(`[Cache] Dedup: ${url.substring(0, 60)}...`);
    return pending;
  }

  // 3. 发起新请求
  const requestPromise = (async () => {
    try {
      console.log(`[API] Request: ${url.substring(0, 80)}...`);

      const response = await fetch(url, {
        ...options,
        next: { revalidate: ttl / 1000 }, // Next.js 缓存
      });

      // 处理速率限制
      if (response.status === 429) {
        console.warn('[API] Rate limit (429) - using cache or fallback');
        throw new Error('RATE_LIMIT');
      }

      if (!response.ok) {
        console.warn(`[API] Error ${response.status}: ${url.substring(0, 60)}...`);
        throw new Error(`HTTP_${response.status}`);
      }

      const data = await response.json();

      // 存储到缓存
      setCache(cacheKey, data, ttl);

      return data;
    } finally {
      // 清除pending状态
      pendingRequests.delete(cacheKey);
    }
  })();

  // 记录正在进行的请求
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
}

/**
 * 清除所有缓存
 */
export function clearCache(): void {
  cache.clear();
  console.log('[Cache] Cleared all cache');
}

/**
 * 清除过期缓存（定期清理）
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
 * 获取缓存统计信息
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

// 定期清理过期缓存（每 10 分钟）
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredCache, 10 * 60 * 1000);
}

export { CACHE_TTL, COINS_LIST_TTL };
