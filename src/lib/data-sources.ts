/**
 * Multi-source Adapter System
 * Implements CoinGecko -> Mobula -> CoinCap three-tier fallback strategy
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { cachedFetch } from './api-cache';
import { resolveCoinId } from './coin-resolver';

// ============= Data Type Definitions =============

export interface PriceData {
  symbol: string;
  price: number;
  change24h?: number;
  volume24h?: number;
  marketCap?: number;
  source: string;
}

export interface MarketData {
  symbol: string;
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  high24h?: number;
  low24h?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  source: string;
}

export interface ProjectInfo {
  id: string;
  symbol: string;
  name: string;
  description?: string;
  homepage?: string;
  blockchain?: string;
  categories?: string[];
  marketCapRank?: number;
  source: string;
}

// ============= Data Source Interface =============

export interface DataSource {
  name: string;
  fetchPrice(symbol: string): Promise<PriceData | null>;
  fetchMarketData(symbol: string): Promise<MarketData | null>;
  fetchProjectInfo(symbol: string): Promise<ProjectInfo | null>;
}

// ============= CoinGecko Adapter =============

class CoinGeckoDataSource implements DataSource {
  name = 'CoinGecko';
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '';

  private getHeaders(): HeadersInit {
    return this.apiKey ? { 'x-cg-pro-api-key': this.apiKey } : {};
  }

  private async getCoinId(symbol: string): Promise<string | null> {
    try {
      // Use smart resolver (auto handles fuzzy matching, multi-source search)
      console.log(`[CoinGecko] Resolving coin ID for: ${symbol}`);
      const resolved = await resolveCoinId(symbol);

      if (resolved) {
        console.log(
          `[CoinGecko] Success: Resolved ${symbol} -> ${resolved.id} (score: ${resolved.score.toFixed(2)}, source: ${resolved.source})`
        );
        return resolved.id;
      }

      console.warn(`[CoinGecko] Warning: Could not resolve coin ID for: ${symbol}`);
      return null;
    } catch (error) {
      console.error(`[CoinGecko] Error getting coin ID for ${symbol}:`, error);
      return null;
    }
  }

  async fetchPrice(symbol: string): Promise<PriceData | null> {
    try {
      const id = await this.getCoinId(symbol);
      if (!id) return null;

      const data = await cachedFetch<any>(
        `${this.baseUrl}/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
        { headers: this.getHeaders() }
      );

      const coinData = data[id];
      if (!coinData) return null;

      return {
        symbol: symbol.toUpperCase(),
        price: coinData.usd || 0,
        change24h: coinData.usd_24h_change || 0,
        volume24h: coinData.usd_24h_vol || 0,
        marketCap: coinData.usd_market_cap || 0,
        source: 'CoinGecko',
      };
    } catch (error) {
      console.error(`[CoinGecko] fetchPrice error for ${symbol}:`, error);
      return null;
    }
  }

  async fetchMarketData(symbol: string): Promise<MarketData | null> {
    try {
      const id = await this.getCoinId(symbol);
      if (!id) return null;

      const data = await cachedFetch<any>(
        `${this.baseUrl}/coins/${id}/market_chart?vs_currency=usd&days=1`,
        { headers: this.getHeaders() }
      );

      const priceData = await this.fetchPrice(symbol);
      if (!priceData) return null;

      const prices = data.prices || [];
      const high24h = Math.max(...prices.map((p: any) => p[1]));
      const low24h = Math.min(...prices.map((p: any) => p[1]));

      return {
        symbol: symbol.toUpperCase(),
        currentPrice: priceData.price,
        marketCap: priceData.marketCap || 0,
        volume24h: priceData.volume24h || 0,
        priceChange24h: priceData.change24h || 0,
        priceChangePercentage24h: priceData.change24h || 0,
        high24h,
        low24h,
        source: 'CoinGecko',
      };
    } catch (error) {
      console.error(`[CoinGecko] fetchMarketData error for ${symbol}:`, error);
      return null;
    }
  }

  async fetchProjectInfo(symbol: string): Promise<ProjectInfo | null> {
    try {
      const id = await this.getCoinId(symbol);
      if (!id) return null;

      const data = await cachedFetch<any>(
        `${this.baseUrl}/coins/${id}`,
        { headers: this.getHeaders() }
      );

      return {
        id: data.id,
        symbol: data.symbol?.toUpperCase() || symbol.toUpperCase(),
        name: data.name || '',
        description: data.description?.en || '',
        homepage: data.links?.homepage?.[0] || '',
        blockchain: data.asset_platform_id || '',
        categories: data.categories || [],
        marketCapRank: data.market_cap_rank,
        source: 'CoinGecko',
      };
    } catch (error) {
      console.error(`[CoinGecko] fetchProjectInfo error for ${symbol}:`, error);
      return null;
    }
  }
}

// ============= Mobula Adapter =============

class MobulaDataSource implements DataSource {
  name = 'Mobula';
  private baseUrl = 'https://api.mobula.io/api/1';
  private apiKey = process.env.MOBULA_API_KEY || '';

  async fetchPrice(symbol: string): Promise<PriceData | null> {
    try {
      // Mobula API requires uppercase symbol
      const normalizedSymbol = symbol.toUpperCase();
      const url = `${this.baseUrl}/market/data?symbol=${normalizedSymbol}${this.apiKey ? `&apiKey=${this.apiKey}` : ''}`;
      const data = await cachedFetch<any>(url);

      if (!data.data) return null;

      return {
        symbol: normalizedSymbol,
        price: data.data.price || 0,
        change24h: data.data.price_change_24h || 0,
        volume24h: data.data.volume_24h || 0,
        marketCap: data.data.market_cap || 0,
        source: 'Mobula',
      };
    } catch (error) {
      console.error(`[Mobula] fetchPrice error for ${symbol}:`, error);
      return null;
    }
  }

  async fetchMarketData(symbol: string): Promise<MarketData | null> {
    try {
      // Mobula API requires uppercase symbol
      const normalizedSymbol = symbol.toUpperCase();
      const url = `${this.baseUrl}/market/data?symbol=${normalizedSymbol}${this.apiKey ? `&apiKey=${this.apiKey}` : ''}`;
      const data = await cachedFetch<any>(url);

      if (!data.data) return null;

      return {
        symbol: normalizedSymbol,
        currentPrice: data.data.price || 0,
        marketCap: data.data.market_cap || 0,
        volume24h: data.data.volume_24h || 0,
        priceChange24h: data.data.price_change_24h || 0,
        priceChangePercentage24h: data.data.price_change_percentage_24h || 0,
        high24h: data.data.high_24h,
        low24h: data.data.low_24h,
        circulatingSupply: data.data.circulating_supply,
        totalSupply: data.data.total_supply,
        source: 'Mobula',
      };
    } catch (error) {
      console.error(`[Mobula] fetchMarketData error for ${symbol}:`, error);
      return null;
    }
  }

  async fetchProjectInfo(symbol: string): Promise<ProjectInfo | null> {
    try {
      // Mobula API requires uppercase symbol
      const normalizedSymbol = symbol.toUpperCase();
      const url = `${this.baseUrl}/metadata?symbol=${normalizedSymbol}${this.apiKey ? `&apiKey=${this.apiKey}` : ''}`;
      const data = await cachedFetch<any>(url);

      if (!data.data) return null;

      return {
        id: data.data.id || normalizedSymbol.toLowerCase(),
        symbol: normalizedSymbol,
        name: data.data.name || '',
        description: data.data.description || '',
        homepage: data.data.website || '',
        blockchain: data.data.blockchain || '',
        categories: data.data.categories || [],
        source: 'Mobula',
      };
    } catch (error) {
      console.error(`[Mobula] fetchProjectInfo error for ${symbol}:`, error);
      return null;
    }
  }
}

// ============= CoinCap Adapter =============

class CoinCapDataSource implements DataSource {
  name = 'CoinCap';
  private baseUrl = 'https://api.coincap.io/v2';
  // CoinCap does not require API key, completely free to use

  private async getAssetId(symbol: string): Promise<string | null> {
    try {
      // CoinCap uses asset ID (usually lowercase symbol)
      // But for accuracy, we search the complete asset list
      const url = `${this.baseUrl}/assets?search=${encodeURIComponent(symbol)}&limit=5`;
      const response = await cachedFetch<any>(url, {}, 5 * 60 * 1000); // 5 minute cache

      if (!response.data || response.data.length === 0) {
        // If search fails, try using lowercase symbol as fallback
        console.warn(`[CoinCap] No search results for ${symbol}, using lowercase as fallback`);
        return symbol.toLowerCase();
      }

      // Find exact match for symbol
      const exactMatch = response.data.find(
        (asset: any) => asset.symbol?.toLowerCase() === symbol.toLowerCase()
      );

      if (exactMatch?.id) {
        console.log(`[CoinCap] Found exact match for ${symbol} -> ${exactMatch.id}`);
        return exactMatch.id;
      }

      // Use first search result
      console.log(`[CoinCap] Using first result for ${symbol} -> ${response.data[0].id}`);
      return response.data[0].id;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      // Distinguish between network errors and other errors
      if (errorMsg.includes('ECONNRESET') || errorMsg.includes('fetch failed')) {
        console.warn(`[CoinCap] Network error for ${symbol}, skipping CoinCap source`);
        return null; // Return null on network error, let fallback system try next source
      }
      console.error(`[CoinCap] Error getting asset ID for ${symbol}:`, errorMsg);
      // For other errors, try using lowercase symbol as last fallback
      return symbol.toLowerCase();
    }
  }

  async fetchPrice(symbol: string): Promise<PriceData | null> {
    try {
      const assetId = await this.getAssetId(symbol);
      if (!assetId) return null;

      const url = `${this.baseUrl}/assets/${assetId}`;
      const response = await cachedFetch<any>(url);

      if (!response.data) return null;

      const asset = response.data;
      return {
        symbol: symbol.toUpperCase(),
        price: parseFloat(asset.priceUsd || '0'),
        change24h: parseFloat(asset.changePercent24Hr || '0'),
        volume24h: parseFloat(asset.volumeUsd24Hr || '0'),
        marketCap: parseFloat(asset.marketCapUsd || '0'),
        source: 'CoinCap',
      };
    } catch (error) {
      console.error(`[CoinCap] fetchPrice error for ${symbol}:`, error);
      return null;
    }
  }

  async fetchMarketData(symbol: string): Promise<MarketData | null> {
    try {
      const assetId = await this.getAssetId(symbol);
      if (!assetId) return null;

      const url = `${this.baseUrl}/assets/${assetId}`;
      const response = await cachedFetch<any>(url);

      if (!response.data) return null;

      const asset = response.data;
      const priceChange24h = parseFloat(asset.changePercent24Hr || '0');

      return {
        symbol: symbol.toUpperCase(),
        currentPrice: parseFloat(asset.priceUsd || '0'),
        marketCap: parseFloat(asset.marketCapUsd || '0'),
        volume24h: parseFloat(asset.volumeUsd24Hr || '0'),
        priceChange24h: priceChange24h,
        priceChangePercentage24h: priceChange24h,
        circulatingSupply: parseFloat(asset.supply || '0'),
        totalSupply: parseFloat(asset.maxSupply || '0'),
        source: 'CoinCap',
      };
    } catch (error) {
      console.error(`[CoinCap] fetchMarketData error for ${symbol}:`, error);
      return null;
    }
  }

  async fetchProjectInfo(symbol: string): Promise<ProjectInfo | null> {
    try {
      const assetId = await this.getAssetId(symbol);
      if (!assetId) return null;

      const url = `${this.baseUrl}/assets/${assetId}`;
      const response = await cachedFetch<any>(url);

      if (!response.data) return null;

      const asset = response.data;
      return {
        id: asset.id,
        symbol: asset.symbol?.toUpperCase() || symbol.toUpperCase(),
        name: asset.name || '',
        description: '', // CoinCap 不提供描述
        homepage: '', // CoinCap 不提供官网链接
        blockchain: '', // CoinCap 不提供区块链信息
        categories: [],
        marketCapRank: parseInt(asset.rank || '0'),
        source: 'CoinCap',
      };
    } catch (error) {
      console.error(`[CoinCap] fetchProjectInfo error for ${symbol}:`, error);
      return null;
    }
  }
}

// ============= Smart Fallback Functions =============

// Data source instances (ordered by priority)
const dataSources: DataSource[] = [
  new CoinGeckoDataSource(),
  new MobulaDataSource(),
  new CoinCapDataSource(),
];

/**
 * Smart fallback to get price data
 * Try in order: CoinGecko -> Mobula -> CoinCap
 */
export async function fetchPriceWithFallback(symbol: string): Promise<PriceData | null> {
  for (const source of dataSources) {
    try {
      console.log(`[DataSource] Trying ${source.name} for price of ${symbol}...`);
      const result = await source.fetchPrice(symbol);
      if (result) {
        console.log(`[DataSource] ✓ ${source.name} returned price data for ${symbol}`);
        return result;
      }
    } catch (error) {
      console.warn(`[DataSource] ${source.name} failed for ${symbol}:`, error);
      continue;
    }
  }

  console.error(`[DataSource] All sources failed for price of ${symbol}`);
  return null;
}

/**
 * Smart fallback to get market data
 * Try in order: CoinGecko -> Mobula -> CoinCap
 */
export async function fetchMarketDataWithFallback(symbol: string): Promise<MarketData | null> {
  for (const source of dataSources) {
    try {
      console.log(`[DataSource] Trying ${source.name} for market data of ${symbol}...`);
      const result = await source.fetchMarketData(symbol);
      if (result) {
        console.log(`[DataSource] ✓ ${source.name} returned market data for ${symbol}`);
        return result;
      }
    } catch (error) {
      console.warn(`[DataSource] ${source.name} failed for ${symbol}:`, error);
      continue;
    }
  }

  console.error(`[DataSource] All sources failed for market data of ${symbol}`);
  return null;
}

/**
 * Smart fallback to get project info
 * Try in order: CoinGecko -> Mobula -> CoinCap
 */
export async function fetchProjectInfoWithFallback(symbol: string): Promise<ProjectInfo | null> {
  for (const source of dataSources) {
    try {
      console.log(`[DataSource] Trying ${source.name} for project info of ${symbol}...`);
      const result = await source.fetchProjectInfo(symbol);
      if (result) {
        console.log(`[DataSource] ✓ ${source.name} returned project info for ${symbol}`);
        return result;
      }
    } catch (error) {
      console.warn(`[DataSource] ${source.name} failed for ${symbol}:`, error);
      continue;
    }
  }

  console.error(`[DataSource] All sources failed for project info of ${symbol}`);
  return null;
}

// ============= GeckoTerminal Data Source (On-chain New Coins) =============

export interface NewTokenInfo {
  address: string;
  symbol: string;
  name: string;
  network: string;
  priceUsd?: number;
  priceChange24h?: number;
  volume24h?: number;
  liquidity?: number;
  updatedAt?: string;
  imageUrl?: string;
}

/**
 * GeckoTerminal API - On-chain data platform under CoinGecko
 * Focused on DEX data and newly launched tokens
 * Completely free, 30 requests/minute
 */
export class GeckoTerminalDataSource {
  name = 'GeckoTerminal';
  private baseUrl = 'https://api.geckoterminal.com/api/v2';

  /**
   * Get list of recently updated tokens
   * @param limit Number to return (max 100)
   */
  async fetchRecentlyUpdatedTokens(limit: number = 20): Promise<NewTokenInfo[]> {
    try {
      console.log(`[GeckoTerminal] Fetching ${limit} recently updated tokens...`);

      const data = await cachedFetch<any>(
        `${this.baseUrl}/tokens/info_recently_updated`,
        {
          // GeckoTerminal free version does not require API key
          // Cache for 5 minutes (on-chain data updates quickly)
          next: { revalidate: 300 }
        }
      );

      if (!data?.data || !Array.isArray(data.data)) {
        console.warn('[GeckoTerminal] Invalid response format');
        return [];
      }

      const tokens: NewTokenInfo[] = data.data.slice(0, limit).map((item: any) => ({
        address: item.id || item.attributes?.address || '',
        symbol: item.attributes?.symbol || '',
        name: item.attributes?.name || '',
        network: this.extractNetwork(item.id),
        priceUsd: item.attributes?.price_usd ? parseFloat(item.attributes.price_usd) : undefined,
        priceChange24h: item.attributes?.price_change_percentage_24h,
        volume24h: item.attributes?.volume_usd?.h24 ? parseFloat(item.attributes.volume_usd.h24) : undefined,
        imageUrl: item.attributes?.image_url,
        updatedAt: item.attributes?.updated_at,
      }));

      console.log(`[GeckoTerminal] Successfully fetched ${tokens.length} tokens`);
      return tokens.filter(t => t.symbol && t.name); // Filter invalid data
    } catch (error) {
      console.error('[GeckoTerminal] Error fetching recently updated tokens:', error);
      return [];
    }
  }

  /**
   * Get new liquidity pools (representing newly launched tokens)
   * @param network Blockchain network (e.g., 'eth', 'bsc', 'base')
   */
  async fetchNewPools(network?: string): Promise<NewTokenInfo[]> {
    try {
      const endpoint = network
        ? `/networks/${network}/new_pools`
        : '/networks/new_pools';

      console.log(`[GeckoTerminal] Fetching new pools${network ? ` on ${network}` : ' (all networks)'}...`);

      const data = await cachedFetch<any>(
        `${this.baseUrl}${endpoint}`,
        { next: { revalidate: 300 } }
      );

      if (!data?.data || !Array.isArray(data.data)) {
        console.warn('[GeckoTerminal] Invalid response format for new pools');
        return [];
      }

      // Extract token info from liquidity pools
      const tokens: NewTokenInfo[] = [];
      for (const pool of data.data.slice(0, 20)) {
        const baseToken = pool.relationships?.base_token?.data;
        const quoteToken = pool.relationships?.quote_token?.data;

        // Prioritize base token (usually new coins)
        if (baseToken && pool.attributes?.base_token_price_usd) {
          tokens.push({
            address: baseToken.id,
            symbol: pool.attributes.base_token_symbol || '',
            name: pool.attributes.name || '',
            network: this.extractNetwork(pool.id),
            priceUsd: parseFloat(pool.attributes.base_token_price_usd),
            volume24h: pool.attributes.volume_usd?.h24 ? parseFloat(pool.attributes.volume_usd.h24) : undefined,
            liquidity: pool.attributes.reserve_in_usd ? parseFloat(pool.attributes.reserve_in_usd) : undefined,
          });
        }
      }

      console.log(`[GeckoTerminal] Successfully fetched ${tokens.length} tokens from new pools`);
      return tokens.filter(t => t.symbol && t.name);
    } catch (error) {
      console.error('[GeckoTerminal] Error fetching new pools:', error);
      return [];
    }
  }

  /**
   * Get trending/hot tokens (CoinGecko free API)
   */
  async fetchTrendingTokens(): Promise<NewTokenInfo[]> {
    try {
      console.log('[GeckoTerminal] Fetching trending tokens from CoinGecko...');

      const baseUrl = 'https://api.coingecko.com/api/v3';
      const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '';
      const headers = apiKey ? { 'x-cg-pro-api-key': apiKey } : undefined;

      const data = await cachedFetch<any>(
        `${baseUrl}/search/trending`,
        {
          headers,
          next: { revalidate: 3600 } // Cache for 1 hour
        }
      );

      if (!data?.coins || !Array.isArray(data.coins)) {
        console.warn('[GeckoTerminal] Invalid trending response format');
        return [];
      }

      const tokens: NewTokenInfo[] = data.coins.map((item: any) => ({
        address: item.item.id || '',
        symbol: item.item.symbol || '',
        name: item.item.name || '',
        network: 'multi-chain',
        priceUsd: item.item.data?.price,
        priceChange24h: item.item.data?.price_change_percentage_24h?.usd,
        imageUrl: item.item.thumb || item.item.small || item.item.large,
      }));

      console.log(`[GeckoTerminal] Successfully fetched ${tokens.length} trending tokens`);
      return tokens.filter(t => t.symbol && t.name);
    } catch (error) {
      console.error('[GeckoTerminal] Error fetching trending tokens:', error);
      return [];
    }
  }

  /**
   * Extract network name from ID
   * Example: "eth_0x..." -> "eth"
   */
  private extractNetwork(id: string): string {
    if (!id) return 'unknown';
    const parts = id.split('_');
    return parts[0] || 'unknown';
  }
}

// Export singleton
export const geckoTerminal = new GeckoTerminalDataSource();
