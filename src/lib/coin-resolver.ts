/**
 * Smart Token Resolver
 * Three-tier identification strategy: Local Index -> Multi-source API -> AI Semantics
 */

import { coinIndex, type CoinData, type CoinMatch } from './coin-index';
import NodeCache from 'node-cache';

// ============= Type Definitions =============

export interface ResolvedCoin {
  id: string;          // CoinGecko ID
  symbol: string;      // Token symbol
  name: string;        // Full name
  score: number;       // Confidence 0-1
  source: string;      // Data source
}

export interface APISearchResult {
  id: string;
  symbol: string;
  name: string;
  source: string;
}

// ============= Cache Configuration =============

// Resolution result cache (1 hour)
const resolveCache = new NodeCache({ stdTTL: 60 * 60 });

// ============= Tier 1: Local Index Search =============

/**
 * Search from local index
 * Fastest, highest coverage
 */
async function searchLocalIndex(query: string): Promise<ResolvedCoin | null> {
  try {
    // 1. First try exact match (symbol or id)
    const exactMatch = await coinIndex.exactMatch(query);
    if (exactMatch) {
      console.log(`[CoinResolver] Success: Exact match: ${query} -> ${exactMatch.id}`);
      return {
        id: exactMatch.id,
        symbol: exactMatch.symbol,
        name: exactMatch.name,
        score: 1.0, // Perfect match
        source: 'Local Index (Exact)',
      };
    }

    // 2. Fuzzy search
    const matches = await coinIndex.search(query, 1);

    if (matches.length > 0 && matches[0].score > 0.6) {
      const match = matches[0];
      console.log(
        `[CoinResolver] Success: Fuzzy match: ${query} -> ${match.coin.id} (score: ${match.score.toFixed(2)})`
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

// ============= Tier 2: Multi-source API Search =============

/**
 * CoinGecko Search API
 */
async function searchCoinGecko(query: string): Promise<APISearchResult | null> {
  try {
    const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
      // Don't throw error, fail silently
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
 * Search multiple APIs in parallel
 */
async function searchMultipleAPIs(query: string): Promise<ResolvedCoin | null> {
  console.log(`[CoinResolver] Trying multiple APIs for "${query}"...`);

  // Call three APIs in parallel
  const results = await Promise.allSettled([
    searchCoinGecko(query),
    searchMobula(query),
    searchCoinCap(query),
  ]);

  // Collect successful results
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

  // Select first successful result (CoinGecko priority)
  const bestResult = successResults[0];
  console.log(`[CoinResolver] Success: API match: ${query} -> ${bestResult.id} (${bestResult.source})`);

  return {
    id: bestResult.id,
    symbol: bestResult.symbol,
    name: bestResult.name,
    score: 0.7, // API search confidence set to 0.7
    source: bestResult.source,
  };
}

// ============= Main Resolution Function =============

/**
 * Smart token name resolution
 * Three-tier strategy: Local Index -> Multi-source API -> (Future: AI Semantics)
 *
 * @param input User input (any format: HYPE / Hyperliquid / Harry Potter Coin)
 * @returns Resolution result (contains CoinGecko ID)
 */
export async function resolveCoinId(input: string): Promise<ResolvedCoin | null> {
  // Input validation
  if (!input || input.trim().length < 2) {
    return null;
  }

  const normalizedInput = input.trim();

  // Check cache
  const cacheKey = `resolve:${normalizedInput.toLowerCase()}`;
  const cached = resolveCache.get<ResolvedCoin>(cacheKey);
  if (cached) {
    console.log(`[CoinResolver] Cache hit for "${normalizedInput}"`);
    return cached;
  }

  // Tier 1: Local index search (fastest)
  const localResult = await searchLocalIndex(normalizedInput);
  if (localResult && localResult.score > 0.6) {
    resolveCache.set(cacheKey, localResult);
    return localResult;
  }

  // Tier 2: Multi-source API search
  const apiResult = await searchMultipleAPIs(normalizedInput);
  if (apiResult) {
    resolveCache.set(cacheKey, apiResult);
    return apiResult;
  }

  // Tier 3: AI semantic understanding (future expansion)
  // TODO: Add OpenAI API call to understand Chinese/spelling errors, etc.
  // const aiGuess = await aiSuggestCoinName(normalizedInput);
  // if (aiGuess) {
  //   return searchLocalIndex(aiGuess);
  // }

  console.warn(`[CoinResolver] Warning: No match found for "${normalizedInput}"`);
  return null;
}

/**
 * Batch resolve multiple tokens
 */
export async function resolveMultipleCoins(inputs: string[]): Promise<(ResolvedCoin | null)[]> {
  return Promise.all(inputs.map(input => resolveCoinId(input)));
}

/**
 * Get resolution statistics
 */
export function getResolverStats() {
  return {
    cacheSize: resolveCache.keys().length,
    indexStats: coinIndex.getStats(),
  };
}

/**
 * Clear resolution cache
 */
export function clearResolverCache() {
  resolveCache.flushAll();
  console.log('[CoinResolver] Cache cleared');
}
