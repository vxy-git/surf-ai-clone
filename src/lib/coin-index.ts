/**
 * Token Index System - Local Fuzzy Search
 * Auto-syncs complete CoinGecko list, supports fuzzy matching
 */

import Fuse, { IFuseOptions } from 'fuse.js';
import NodeCache from 'node-cache';

// ============= Type Definitions =============

export interface CoinData {
  id: string;          // CoinGecko ID (e.g., "bitcoin")
  symbol: string;      // Token symbol (e.g., "BTC")
  name: string;        // Full name (e.g., "Bitcoin")
}

export interface CoinMatch {
  coin: CoinData;
  score: number;       // Similarity score 0-1 (1 is perfect match)
}

// ============= Cache Configuration =============

// Coins list cache (24 hours)
const coinsCache = new NodeCache({ stdTTL: 24 * 60 * 60 });

// Search result cache (10 minutes)
const searchCache = new NodeCache({ stdTTL: 10 * 60 });

const CACHE_KEY_COINS = 'all_coins';
const CACHE_KEY_LAST_SYNC = 'last_sync';

// ============= Fuse.js Configuration =============

const fuseOptions: IFuseOptions<CoinData> = {
  keys: [
    { name: 'symbol', weight: 0.5 },     // symbol has highest weight
    { name: 'name', weight: 0.3 },       // name is secondary
    { name: 'id', weight: 0.2 },         // id has lowest weight
  ],
  threshold: 0.4,                        // Similarity threshold (0-1, smaller is stricter)
  distance: 100,                         // Match distance
  minMatchCharLength: 2,                 // Minimum match length
  includeScore: true,                    // Include score
  ignoreLocation: true,                  // Ignore location
};

// ============= Token Index Class =============

class CoinIndex {
  private fuse: Fuse<CoinData> | null = null;
  private coins: CoinData[] = [];
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Sync complete coin list from CoinGecko
   */
  async syncFromCoinGecko(): Promise<void> {
    try {
      console.log('[CoinIndex] Starting sync from CoinGecko...');
      const startTime = Date.now();

      // Use free API (no key required)
      const response = await fetch('https://api.coingecko.com/api/v3/coins/list');

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: CoinData[] = await response.json();

      // Data validation
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid coins list data');
      }

      // Update cache
      this.coins = data;
      coinsCache.set(CACHE_KEY_COINS, data);
      coinsCache.set(CACHE_KEY_LAST_SYNC, new Date().toISOString());

      // Rebuild Fuse index
      this.fuse = new Fuse(data, fuseOptions);

      const duration = Date.now() - startTime;
      console.log(`[CoinIndex] Successfully synced ${data.length} coins in ${duration}ms`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[CoinIndex] Sync failed: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Load coins list from cache
   */
  private async loadFromCache(): Promise<boolean> {
    const cachedCoins = coinsCache.get<CoinData[]>(CACHE_KEY_COINS);

    if (cachedCoins && cachedCoins.length > 0) {
      this.coins = cachedCoins;
      this.fuse = new Fuse(cachedCoins, fuseOptions);
      console.log(`[CoinIndex] Loaded ${cachedCoins.length} coins from cache`);
      return true;
    }

    return false;
  }

  /**
   * Ensure index is initialized
   */
  async ensureInitialized(): Promise<void> {
    if (this.fuse) return;

    if (this.isInitializing && this.initPromise) {
      console.log('[CoinIndex] Waiting for ongoing initialization...');
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        const loaded = await this.loadFromCache();
        if (!loaded) {
          await this.syncFromCoinGecko();
        }
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  /**
   * Check if sync is needed
   */
  needsSync(): boolean {
    const lastSync = coinsCache.get<string>(CACHE_KEY_LAST_SYNC);
    if (!lastSync) return true;

    const lastSyncTime = new Date(lastSync).getTime();
    const now = Date.now();
    const hoursSinceSync = (now - lastSyncTime) / (1000 * 60 * 60);

    return hoursSinceSync > 24; // Sync needed if over 24 hours
  }

  /**
   * Fuzzy search for tokens
   * @param query User input (e.g., "HYPE", "Hyperliquid", "btc")
   * @param limit Number of results to return
   * @returns Array of matching results (sorted by similarity)
   */
  async search(query: string, limit = 5): Promise<CoinMatch[]> {
    // Ensure index is initialized
    await this.ensureInitialized();

    if (!this.fuse) {
      console.error('[CoinIndex] Fuse not initialized');
      return [];
    }

    // Normalize query
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      return []; // Query too short, don't search
    }

    // Check search cache
    const cacheKey = `search:${normalizedQuery.toLowerCase()}`;
    const cached = searchCache.get<CoinMatch[]>(cacheKey);
    if (cached) {
      console.log(`[CoinIndex] Cache hit for "${normalizedQuery}"`);
      return cached;
    }

    // Execute fuzzy search
    const results = this.fuse.search(normalizedQuery, { limit });

    // Convert result format
    const matches: CoinMatch[] = results.map(result => ({
      coin: result.item,
      score: 1 - (result.score || 0), // Fuse.js score is better when smaller, so we invert it
    }));

    // Cache results
    if (matches.length > 0) {
      searchCache.set(cacheKey, matches);
    }

    return matches;
  }

  /**
   * Exact match (symbol or id)
   */
  async exactMatch(query: string): Promise<CoinData | null> {
    await this.ensureInitialized();

    const normalizedQuery = query.toLowerCase();

    // Find in local list
    const coin = this.coins.find(
      c =>
        c.symbol.toLowerCase() === normalizedQuery ||
        c.id.toLowerCase() === normalizedQuery
    );

    return coin || null;
  }

  /**
   * Get statistics
   */
  getStats() {
    const lastSync = coinsCache.get<string>(CACHE_KEY_LAST_SYNC);
    return {
      totalCoins: this.coins.length,
      lastSync: lastSync || 'Never',
      needsSync: this.needsSync(),
      cacheHits: {
        coins: coinsCache.keys().length,
        searches: searchCache.keys().length,
      },
    };
  }

  /**
   * Clear all cache
   */
  clearCache() {
    coinsCache.flushAll();
    searchCache.flushAll();
    console.log('[CoinIndex] Cache cleared');
  }
}

// ============= Export Singleton Instance =============

export const coinIndex = new CoinIndex();

// ============= Convenience Functions =============

/**
 * Search for token (convenience function)
 */
export async function searchCoin(query: string, limit = 5): Promise<CoinMatch[]> {
  return coinIndex.search(query, limit);
}

/**
 * Exact match for token (convenience function)
 */
export async function findCoin(query: string): Promise<CoinData | null> {
  return coinIndex.exactMatch(query);
}

/**
 * Manually trigger sync
 */
export async function syncCoins(): Promise<void> {
  return coinIndex.syncFromCoinGecko();
}

/**
 * Get index statistics
 */
export function getIndexStats() {
  return coinIndex.getStats();
}
