/**
 * 代币索引系统 - 本地模糊搜索
 * 自动同步 CoinGecko 完整列表,支持模糊匹配
 */

import Fuse, { IFuseOptions } from 'fuse.js';
import NodeCache from 'node-cache';

// ============= 类型定义 =============

export interface CoinData {
  id: string;          // CoinGecko ID (如 "bitcoin")
  symbol: string;      // 代币符号 (如 "BTC")
  name: string;        // 全称 (如 "Bitcoin")
}

export interface CoinMatch {
  coin: CoinData;
  score: number;       // 相似度得分 0-1 (1为完全匹配)
}

// ============= 缓存配置 =============

// 币种列表缓存 (24小时)
const coinsCache = new NodeCache({ stdTTL: 24 * 60 * 60 });

// 搜索结果缓存 (10分钟)
const searchCache = new NodeCache({ stdTTL: 10 * 60 });

const CACHE_KEY_COINS = 'all_coins';
const CACHE_KEY_LAST_SYNC = 'last_sync';

// ============= Fuse.js 配置 =============

const fuseOptions: IFuseOptions<CoinData> = {
  keys: [
    { name: 'symbol', weight: 0.5 },     // symbol 权重最高
    { name: 'name', weight: 0.3 },       // name 次之
    { name: 'id', weight: 0.2 },         // id 最低
  ],
  threshold: 0.4,                        // 相似度阈值 (0-1,越小越严格)
  distance: 100,                         // 匹配距离
  minMatchCharLength: 2,                 // 最小匹配长度
  includeScore: true,                    // 包含得分
  ignoreLocation: true,                  // 忽略位置
};

// ============= 代币索引类 =============

class CoinIndex {
  private fuse: Fuse<CoinData> | null = null;
  private coins: CoinData[] = [];
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  /**
   * 从 CoinGecko 同步完整币种列表
   */
  async syncFromCoinGecko(): Promise<void> {
    try {
      console.log('[CoinIndex] Starting sync from CoinGecko...');
      const startTime = Date.now();

      // 使用免费 API (无需 key)
      const response = await fetch('https://api.coingecko.com/api/v3/coins/list');

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: CoinData[] = await response.json();

      // 数据验证
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid coins list data');
      }

      // 更新缓存
      this.coins = data;
      coinsCache.set(CACHE_KEY_COINS, data);
      coinsCache.set(CACHE_KEY_LAST_SYNC, new Date().toISOString());

      // 重建 Fuse 索引
      this.fuse = new Fuse(data, fuseOptions);

      const duration = Date.now() - startTime;
      console.log(`[CoinIndex] ✓ Synced ${data.length} coins in ${duration}ms`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[CoinIndex] Sync failed: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * 从缓存加载币种列表
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
   * 确保索引已初始化
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
   * 检查是否需要同步
   */
  needsSync(): boolean {
    const lastSync = coinsCache.get<string>(CACHE_KEY_LAST_SYNC);
    if (!lastSync) return true;

    const lastSyncTime = new Date(lastSync).getTime();
    const now = Date.now();
    const hoursSinceSync = (now - lastSyncTime) / (1000 * 60 * 60);

    return hoursSinceSync > 24; // 超过24小时需要同步
  }

  /**
   * 模糊搜索代币
   * @param query 用户输入 (如 "HYPE", "Hyperliquid", "btc")
   * @param limit 返回结果数量
   * @returns 匹配结果数组 (按相似度排序)
   */
  async search(query: string, limit = 5): Promise<CoinMatch[]> {
    // 确保索引已初始化
    await this.ensureInitialized();

    if (!this.fuse) {
      console.error('[CoinIndex] Fuse not initialized');
      return [];
    }

    // 标准化查询
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      return []; // 查询太短,不搜索
    }

    // 检查搜索缓存
    const cacheKey = `search:${normalizedQuery.toLowerCase()}`;
    const cached = searchCache.get<CoinMatch[]>(cacheKey);
    if (cached) {
      console.log(`[CoinIndex] Cache hit for "${normalizedQuery}"`);
      return cached;
    }

    // 执行模糊搜索
    const results = this.fuse.search(normalizedQuery, { limit });

    // 转换结果格式
    const matches: CoinMatch[] = results.map(result => ({
      coin: result.item,
      score: 1 - (result.score || 0), // Fuse.js 的 score 越小越好,我们反转一下
    }));

    // 缓存结果
    if (matches.length > 0) {
      searchCache.set(cacheKey, matches);
    }

    return matches;
  }

  /**
   * 精确匹配 (symbol 或 id)
   */
  async exactMatch(query: string): Promise<CoinData | null> {
    await this.ensureInitialized();

    const normalizedQuery = query.toLowerCase();

    // 在本地列表中查找
    const coin = this.coins.find(
      c =>
        c.symbol.toLowerCase() === normalizedQuery ||
        c.id.toLowerCase() === normalizedQuery
    );

    return coin || null;
  }

  /**
   * 获取统计信息
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
   * 清除所有缓存
   */
  clearCache() {
    coinsCache.flushAll();
    searchCache.flushAll();
    console.log('[CoinIndex] Cache cleared');
  }
}

// ============= 导出单例实例 =============

export const coinIndex = new CoinIndex();

// ============= 便捷函数 =============

/**
 * 搜索代币 (便捷函数)
 */
export async function searchCoin(query: string, limit = 5): Promise<CoinMatch[]> {
  return coinIndex.search(query, limit);
}

/**
 * 精确匹配代币 (便捷函数)
 */
export async function findCoin(query: string): Promise<CoinData | null> {
  return coinIndex.exactMatch(query);
}

/**
 * 手动触发同步
 */
export async function syncCoins(): Promise<void> {
  return coinIndex.syncFromCoinGecko();
}

/**
 * 获取索引统计信息
 */
export function getIndexStats() {
  return coinIndex.getStats();
}
