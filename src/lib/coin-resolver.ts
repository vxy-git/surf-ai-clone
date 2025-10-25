/**
 * 智能代币解析器
 * 三层识别策略: 本地索引 → 多源API → AI语义
 */

import { coinIndex, type CoinData, type CoinMatch } from './coin-index';
import NodeCache from 'node-cache';

// ============= 类型定义 =============

export interface ResolvedCoin {
  id: string;          // CoinGecko ID
  symbol: string;      // 代币符号
  name: string;        // 全称
  score: number;       // 置信度 0-1
  source: string;      // 数据来源
}

export interface APISearchResult {
  id: string;
  symbol: string;
  name: string;
  source: string;
}

// ============= 缓存配置 =============

// 解析结果缓存 (1小时)
const resolveCache = new NodeCache({ stdTTL: 60 * 60 });

// ============= 层1: 本地索引搜索 =============

/**
 * 从本地索引搜索
 * 最快,覆盖率最高
 */
async function searchLocalIndex(query: string): Promise<ResolvedCoin | null> {
  try {
    // 1. 先尝试精确匹配 (symbol 或 id)
    const exactMatch = await coinIndex.exactMatch(query);
    if (exactMatch) {
      console.log(`[CoinResolver] ✓ Exact match: ${query} -> ${exactMatch.id}`);
      return {
        id: exactMatch.id,
        symbol: exactMatch.symbol,
        name: exactMatch.name,
        score: 1.0, // 完全匹配
        source: 'Local Index (Exact)',
      };
    }

    // 2. 模糊搜索
    const matches = await coinIndex.search(query, 1);

    if (matches.length > 0 && matches[0].score > 0.6) {
      const match = matches[0];
      console.log(
        `[CoinResolver] ✓ Fuzzy match: ${query} -> ${match.coin.id} (score: ${match.score.toFixed(2)})`
      );
      return {
        id: match.coin.id,
        symbol: match.coin.symbol,
        name: match.coin.name,
        score: match.score,
        source: 'Local Index (Fuzzy)',
      };
    }

    console.log(`[CoinResolver] Local index: no confident match for "${query}"`);
    return null;
  } catch (error) {
    console.error('[CoinResolver] Local search error:', error);
    return null;
  }
}

// ============= 层2: 多源API搜索 =============

/**
 * CoinGecko 搜索 API
 */
async function searchCoinGecko(query: string): Promise<APISearchResult | null> {
  try {
    const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
      // 不抛出错误,静默失败
      console.warn(`[CoinResolver] CoinGecko search failed: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.coins && data.coins.length > 0) {
      const firstResult = data.coins[0];
      return {
        id: firstResult.id,
        symbol: firstResult.symbol,
        name: firstResult.name,
        source: 'CoinGecko API',
      };
    }

    return null;
  } catch (error) {
    console.warn('[CoinResolver] CoinGecko search error:', error);
    return null;
  }
}

/**
 * Mobula 搜索
 */
async function searchMobula(query: string): Promise<APISearchResult | null> {
  try {
    const apiKey = process.env.MOBULA_API_KEY;
    const normalizedQuery = query.toUpperCase();
    const url = `https://api.mobula.io/api/1/metadata?symbol=${normalizedQuery}${apiKey ? `&apiKey=${apiKey}` : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.data) {
      return {
        id: data.data.id || normalizedQuery.toLowerCase(),
        symbol: normalizedQuery,
        name: data.data.name || '',
        source: 'Mobula API',
      };
    }

    return null;
  } catch (error) {
    console.warn('[CoinResolver] Mobula search error:', error);
    return null;
  }
}

/**
 * CoinCap 搜索
 */
async function searchCoinCap(query: string): Promise<APISearchResult | null> {
  try {
    const url = `https://api.coincap.io/v2/assets?search=${encodeURIComponent(query)}&limit=1`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const asset = data.data[0];
      return {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        source: 'CoinCap API',
      };
    }

    return null;
  } catch (error) {
    console.warn('[CoinResolver] CoinCap search error:', error);
    return null;
  }
}

/**
 * 并行搜索多个 API
 */
async function searchMultipleAPIs(query: string): Promise<ResolvedCoin | null> {
  console.log(`[CoinResolver] Trying multiple APIs for "${query}"...`);

  // 并行调用三个 API
  const results = await Promise.allSettled([
    searchCoinGecko(query),
    searchMobula(query),
    searchCoinCap(query),
  ]);

  // 收集成功的结果
  const successResults: APISearchResult[] = [];
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      successResults.push(result.value);
    }
  });

  if (successResults.length === 0) {
    console.log(`[CoinResolver] No API results for "${query}"`);
    return null;
  }

  // 选择第一个成功的结果 (CoinGecko 优先)
  const bestResult = successResults[0];
  console.log(`[CoinResolver] ✓ API match: ${query} -> ${bestResult.id} (${bestResult.source})`);

  return {
    id: bestResult.id,
    symbol: bestResult.symbol,
    name: bestResult.name,
    score: 0.7, // API 搜索的置信度设为 0.7
    source: bestResult.source,
  };
}

// ============= 主解析函数 =============

/**
 * 智能解析代币名称
 * 三层策略: 本地索引 → 多源API → (未来: AI语义)
 *
 * @param input 用户输入 (任意格式: HYPE / Hyperliquid / 哈利波特币)
 * @returns 解析结果 (包含 CoinGecko ID)
 */
export async function resolveCoinId(input: string): Promise<ResolvedCoin | null> {
  // 输入验证
  if (!input || input.trim().length < 2) {
    return null;
  }

  const normalizedInput = input.trim();

  // 检查缓存
  const cacheKey = `resolve:${normalizedInput.toLowerCase()}`;
  const cached = resolveCache.get<ResolvedCoin>(cacheKey);
  if (cached) {
    console.log(`[CoinResolver] Cache hit for "${normalizedInput}"`);
    return cached;
  }

  // 层1: 本地索引搜索 (最快)
  const localResult = await searchLocalIndex(normalizedInput);
  if (localResult && localResult.score > 0.6) {
    resolveCache.set(cacheKey, localResult);
    return localResult;
  }

  // 层2: 多源 API 搜索
  const apiResult = await searchMultipleAPIs(normalizedInput);
  if (apiResult) {
    resolveCache.set(cacheKey, apiResult);
    return apiResult;
  }

  // 层3: AI 语义理解 (未来扩展)
  // TODO: 添加 OpenAI API 调用,理解中文/拼写错误等
  // const aiGuess = await aiSuggestCoinName(normalizedInput);
  // if (aiGuess) {
  //   return searchLocalIndex(aiGuess);
  // }

  console.warn(`[CoinResolver] ⚠️ No match found for "${normalizedInput}"`);
  return null;
}

/**
 * 批量解析多个代币
 */
export async function resolveMultipleCoins(inputs: string[]): Promise<(ResolvedCoin | null)[]> {
  return Promise.all(inputs.map(input => resolveCoinId(input)));
}

/**
 * 获取解析统计信息
 */
export function getResolverStats() {
  return {
    cacheSize: resolveCache.keys().length,
    indexStats: coinIndex.getStats(),
  };
}

/**
 * 清除解析缓存
 */
export function clearResolverCache() {
  resolveCache.flushAll();
  console.log('[CoinResolver] Cache cleared');
}
