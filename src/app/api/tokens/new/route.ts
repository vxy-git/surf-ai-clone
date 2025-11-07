import { NextResponse } from 'next/server';
import { geckoTerminal } from '@/lib/data-sources';

/**
 * GET /api/tokens/new
 * 获取最近上线的代币列表
 *
 * Query Parameters:
 * - limit: 返回数量 (默认10,最多50)
 * - source: 数据源 ('recent' | 'trending' | 'both', 默认'both')
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const source = searchParams.get('source') || 'both';

    console.log(`[Tokens API] Fetching new tokens (limit: ${limit}, source: ${source})`);

    let allTokens: Array<{
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
      source?: string;
    }> = [];

    // 获取最近更新的代币 (GeckoTerminal)
    if (source === 'recent' || source === 'both') {
      const recentTokens = await geckoTerminal.fetchRecentlyUpdatedTokens(limit);
      allTokens = [...allTokens, ...recentTokens.map(t => ({...t, source: 'recent'}))];
    }

    // 获取热门代币 (CoinGecko Trending)
    if (source === 'trending' || source === 'both') {
      const trendingTokens = await geckoTerminal.fetchTrendingTokens();
      allTokens = [...allTokens, ...trendingTokens.map(t => ({...t, source: 'trending'}))];
    }

    // 去重 (按 symbol 去重,保留第一个)
    const uniqueTokens = allTokens.filter((token, index, self) =>
      index === self.findIndex(t => t.symbol.toLowerCase() === token.symbol.toLowerCase())
    );

    // 排序: 有价格变化的优先,绝对值大的优先
    const sortedTokens = uniqueTokens.sort((a, b) => {
      const aChange = Math.abs(a.priceChange24h || 0);
      const bChange = Math.abs(b.priceChange24h || 0);
      return bChange - aChange;
    });

    // 限制返回数量
    const result = sortedTokens.slice(0, limit);

    console.log(`[Tokens API] Returning ${result.length} new tokens`);

    return NextResponse.json({
      success: true,
      count: result.length,
      tokens: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Tokens API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch new tokens',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
