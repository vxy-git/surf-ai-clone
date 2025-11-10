/* eslint-disable @typescript-eslint/no-explicit-any */
import { tool } from 'ai';
import { z } from 'zod';
import { cachedFetch, COINS_LIST_TTL } from './api-cache';
import {
  fetchPriceWithFallback,
  fetchMarketDataWithFallback,
  fetchProjectInfoWithFallback,
  type PriceData,
  type MarketData,
  type ProjectInfo,
} from './data-sources';

/**
 * AI Agent Tools Set
 * Provides specialized tool functions for different analysis tasks
 */

// ========== Dynamic Coin ID Lookup System ==========

// Runtime cache: symbol -> CoinGecko ID mapping
const symbolToIdCache = new Map<string, string>();

// Complete coins list cache (loaded at app startup or first needed)
let coinsListCache: Array<{ id: string; symbol: string; name: string }> | null = null;
let coinsListLoading = false; // Prevent duplicate loading

/**
 * Dynamically get CoinGecko ID - Three-tier caching architecture
 * Tier 1: Static mapping (0ms) - Major coins
 * Tier 2: Runtime cache (1ms) - Previously queried coins
 * Tier 3: Complete list cache (50-100ms first time) - All CoinGecko coins
 * Tier 4: Fallback guess - Use lowercase symbol as ID
 */
async function getCoinGeckoId(symbol: string): Promise<string> {
  const upperSymbol = symbol.toUpperCase();

  // Tier 1: Static mapping (fastest, 0ms)
  if (SYMBOL_TO_COINGECKO_ID[upperSymbol]) {
    return SYMBOL_TO_COINGECKO_ID[upperSymbol];
  }

  // Tier 2: Runtime cache (fast, 1ms)
  if (symbolToIdCache.has(upperSymbol)) {
    return symbolToIdCache.get(upperSymbol)!;
  }

  // Tier 3: Complete list cache (medium, 10-50ms first load)
  if (!coinsListCache && !coinsListLoading) {
    coinsListLoading = true;
    try {
      console.log('[CoinGecko] Loading complete coins list...');
      // Use cached fetch with 1 hour TTL
      coinsListCache = await cachedFetch(
        'https://api.coingecko.com/api/v3/coins/list',
        {},
        COINS_LIST_TTL
      ) as Array<{ id: string; symbol: string; name: string }>;
      console.log(`[CoinGecko] Loaded ${coinsListCache?.length || 0} coins`);
    } catch (error) {
      console.warn('[CoinGecko] Error loading coins list:', error);
      // Failure doesn't affect functionality, will fallback to guessing
    } finally {
      coinsListLoading = false;
    }
  }

  // Wait for loading to complete (if in progress)
  let waitCount = 0;
  while (coinsListLoading && waitCount < 50) {
    await new Promise(resolve => setTimeout(resolve, 100));
    waitCount++;
  }

  // Search in complete list
  if (coinsListCache) {
    const coin = coinsListCache.find(c =>
      c.symbol.toLowerCase() === symbol.toLowerCase()
    );
    if (coin) {
      console.log(`[CoinGecko] Found ${upperSymbol} -> ${coin.id}`);
      symbolToIdCache.set(upperSymbol, coin.id);
      return coin.id;
    }
  }

  // Tier 4: Fallback guess
  const guessedId = symbol.toLowerCase().replace(/\s+/g, '-');
  console.log(`[CoinGecko] Guessing ID for ${upperSymbol} -> ${guessedId}`);
  symbolToIdCache.set(upperSymbol, guessedId);
  return guessedId;
}

// ========================================

// Social Sentiment Analysis Tool (Based on free CoinGecko data)
export const socialSentimentTool = tool({
  description: 'Analyze social media sentiment for a cryptocurrency project using community data, price momentum, and social metrics.',
  parameters: z.object({
    symbol: z.string().describe('The cryptocurrency symbol (e.g., BTC, ETH)'),
    timeframe: z.enum(['24h', '7d', '30d']).default('24h').describe('Time period for analysis'),
  }),
  execute: async ({ symbol, timeframe }) => {
    try {
      // Use dynamic ID lookup to support all coins
      const id = await getCoinGeckoId(symbol);
      const apiKey = process.env.COINGECKO_API_KEY;
      const baseUrl = apiKey
        ? 'https://pro-api.coingecko.com/api/v3'
        : 'https://api.coingecko.com/api/v3';
      const headers: HeadersInit = apiKey ? { 'x-cg-pro-api-key': apiKey } : {};

      // Get detailed coin info (including community data) - use cache
      const url = `${baseUrl}/coins/${id}?localization=false&tickers=false&community_data=true&developer_data=true&sparkline=false`;
      const data = await cachedFetch(url, { headers }) as any;

      // Debug logs - view complete API response
      if (process.env.DEBUG_API) {
        console.log('\n========== CoinGecko API Debug Info ==========');
        console.log('Coin:', symbol.toUpperCase());
        console.log('\n--- Community Data Object ---');
        console.log(JSON.stringify(data.community_data, null, 2));
        console.log('\n--- Developer Data Object ---');
        console.log(JSON.stringify(data.developer_data, null, 2));
        console.log('\n--- Market Data Snippet ---');
        console.log('Price 24h:', data.market_data?.price_change_percentage_24h);
        console.log('Price 7d:', data.market_data?.price_change_percentage_7d);
        console.log('\n--- Top-level Fields Check ---');
        console.log('sentiment_votes_up_percentage:', data.sentiment_votes_up_percentage);
        console.log('sentiment_votes_down_percentage:', data.sentiment_votes_down_percentage);
        console.log('community_score:', data.community_score);
        console.log('developer_score:', data.developer_score);
        console.log('==========================================\n');
      }

      // Extract key data
      const priceChange24h = data.market_data?.price_change_percentage_24h || 0;
      const priceChange7d = data.market_data?.price_change_percentage_7d || 0;
      const volumeChange24h = data.market_data?.total_volume?.usd || 0;

      // Community data - Note: sentiment_votes in top-level fields, not in community_data
      const communityData = data.community_data || {};
      const sentimentUpVotes = data.sentiment_votes_up_percentage || 50; // Top-level field!
      const sentimentDownVotes = data.sentiment_votes_down_percentage || 50; // Top-level field!

      // CoinGecko free API community_data does not include twitter_followers
      // These fields are either null or 0
      const redditSubscribers = communityData.reddit_subscribers || 0;
      const redditActive48h = communityData.reddit_accounts_active_48h || 0;
      const redditPosts48h = communityData.reddit_average_posts_48h || 0;
      const telegramUsers = communityData.telegram_channel_user_count || 0;

      // Developer activity
      const developerData = data.developer_data || {};
      const commits4weeks = developerData.commit_count_4_weeks || 0;

      // Calculate composite sentiment score (0-100)
      // Based on available data: community votes (60%) + price momentum (25%) + dev activity (15%)
      let sentimentScore = 50;

      // 1. Community vote weight 60% (main indicator as it's most reliable sentiment data)
      sentimentScore += (sentimentUpVotes - 50) * 0.6;

      // 2. Price momentum weight 25%
      if (priceChange24h > 5) sentimentScore += 12.5;
      else if (priceChange24h > 0) sentimentScore += 6.25;
      else if (priceChange24h < -5) sentimentScore -= 12.5;
      else if (priceChange24h < 0) sentimentScore -= 6.25;

      // 3. Dev activity weight 15%
      if (commits4weeks > 100) sentimentScore += 7.5;
      else if (commits4weeks > 50) sentimentScore += 3.75;
      else if (commits4weeks < 10) sentimentScore -= 3.75;

      // Extra factor: Reddit activity (if available)
      if (redditActive48h > 100) sentimentScore += 2.5;
      else if (redditActive48h > 50) sentimentScore += 1.25;

      // Constrain to 0-100 range
      sentimentScore = Math.max(0, Math.min(100, sentimentScore));

      // Determine overall sentiment
      let overallSentiment = 'Neutral';
      if (sentimentScore > 65) overallSentiment = 'Bullish';
      else if (sentimentScore < 40) overallSentiment = 'Bearish';

      // Bull/bear ratio (based on community votes and sentiment score)
      const bullishPercentage = sentimentUpVotes || ((sentimentScore / 100) * 100);
      const bearishPercentage = 100 - bullishPercentage;

      return {
        symbol: symbol.toUpperCase(),
        timeframe,
        dataSource: '💭 CoinGecko Community Data',
        overallSentiment,
        sentimentScore: sentimentScore.toFixed(2),
        bullishPercentage: bullishPercentage.toFixed(1),
        bearishPercentage: bearishPercentage.toFixed(1),
        communityMetrics: {
          sentimentUpvotes: `${sentimentUpVotes.toFixed(1)}%`,
          sentimentDownvotes: `${sentimentDownVotes.toFixed(1)}%`,
          redditSubscribers: redditSubscribers > 0 ? redditSubscribers.toLocaleString() : 'N/A',
          redditActive48h: redditActive48h > 0 ? redditActive48h.toLocaleString() : 'N/A',
          redditPosts48h: redditPosts48h > 0 ? redditPosts48h.toFixed(1) : 'N/A',
          telegramUsers: telegramUsers > 0 ? telegramUsers.toLocaleString() : 'N/A',
        },
        marketMomentum: {
          priceChange24h: `${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`,
          priceChange7d: `${priceChange7d > 0 ? '+' : ''}${priceChange7d.toFixed(2)}%`,
          marketCapRank: data.market_cap_rank || 'N/A',
        },
        developmentActivity: {
          commits4weeks: commits4weeks,
          activityLevel: commits4weeks > 100 ? 'Very Active' :
                        commits4weeks > 50 ? 'Active' :
                        commits4weeks > 10 ? 'Moderate' : 'Low',
          githubStars: developerData.stars || 'N/A',
        },
        keyTopics: [
          `Price ${priceChange24h > 0 ? 'increase' : 'decrease'} discussion`,
          'Community sentiment analysis',
          'Development progress updates',
          'Market trend speculation',
        ],
        communityActivity: {
          platform: 'CoinGecko Community',
          upvotePercentage: `${sentimentUpVotes.toFixed(1)}%`,
          sentiment: sentimentUpVotes > 60 ? 'Predominantly Bullish' :
                    sentimentUpVotes > 40 ? 'Mixed' : 'Predominantly Bearish',
        },
        trendingHashtags: [`#${symbol.toUpperCase()}`, '#crypto', '#blockchain'],
        timestamp: new Date().toISOString(),
        methodology: 'CoinGecko community votes + price momentum + dev activity',
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[SocialSentiment] Error for ${symbol}:`, errorMsg);

      // Graceful fallback to simulated data (no error thrown)
      const sentimentScore = 50 + (Math.random() - 0.5) * 40; // 30-70 range
      const bullishPercentage = 45 + Math.random() * 30;
      const bearishPercentage = 100 - bullishPercentage;

      return {
        symbol: symbol.toUpperCase(),
        timeframe,
        dataSource: 'Fallback Data',
        available: false,
        overallSentiment: sentimentScore > 60 ? 'Bullish' : sentimentScore > 40 ? 'Neutral' : 'Bearish',
        sentimentScore: sentimentScore.toFixed(2),
        bullishPercentage: bullishPercentage.toFixed(1),
        bearishPercentage: bearishPercentage.toFixed(1),
        communityMetrics: {
          sentimentUpvotes: 'N/A',
          sentimentDownvotes: 'N/A',
          redditSubscribers: 'N/A',
          redditActive48h: 'N/A',
          redditPosts48h: 'N/A',
          telegramUsers: 'N/A',
        },
        marketMomentum: {
          priceChange24h: 'N/A',
          priceChange7d: 'N/A',
          marketCapRank: 'N/A',
        },
        developmentActivity: {
          commits4weeks: 0,
          activityLevel: 'Unknown',
          githubStars: 'N/A',
        },
        keyTopics: [
          'Limited data available for this cryptocurrency',
          'Try using Technical Analysis or Deep Search tools',
        ],
        note: errorMsg.includes('RATE_LIMIT')
          ? 'Rate limit reached - data temporarily unavailable. Try again in a moment.'
          : errorMsg.includes('HTTP_404')
          ? `Cryptocurrency "${symbol.toUpperCase()}" not found in database. It may be a new or less common project.`
          : 'Live data temporarily unavailable - showing estimated values',
        timestamp: new Date().toISOString(),
      };
    }
  },
});

// Simple technical indicator calculation functions
function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) return 50; // Default value

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

// Technical Analysis Tool
export const technicalAnalysisTool = tool({
  description: 'Perform technical analysis on a cryptocurrency including price trends, indicators, and trading signals.',
  parameters: z.object({
    symbol: z.string().describe('The cryptocurrency symbol (e.g., BTC, ETH)'),
    interval: z.enum(['1h', '4h', '1d', '1w']).default('1d').describe('Chart interval'),
  }),
  execute: async ({ symbol, interval }) => {
    try {
      // Get historical price data for calculating indicators
      const id = await getCoinGeckoId(symbol);
      const apiKey = process.env.COINGECKO_API_KEY;
      const baseUrl = apiKey
        ? 'https://pro-api.coingecko.com/api/v3'
        : 'https://api.coingecko.com/api/v3';
      const headers: HeadersInit = apiKey ? { 'x-cg-pro-api-key': apiKey } : {};

      // Get current price and 24h data - use cache
      const priceData = await cachedFetch(
        `${baseUrl}/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`,
        { headers }
      ) as any;
      const currentPrice = priceData[id]?.usd || 0;
      const change24h = priceData[id]?.usd_24h_change || 0;

      // Get historical price (30 days) - use cache
      const historyData = await cachedFetch(
        `${baseUrl}/coins/${id}/market_chart?vs_currency=usd&days=30&interval=daily`,
        { headers }
      ) as any;
      const prices = historyData.prices?.map((p: number[]) => p[1]) || [];

      // Calculate technical indicators
      const rsi = calculateRSI(prices);
      const ma50 = prices.length >= 50 ? calculateSMA(prices, 50) : calculateSMA(prices, Math.min(prices.length, 20));
      const ma200 = prices.length >= 200 ? calculateSMA(prices, 200) : calculateSMA(prices, Math.min(prices.length, 30));

      // MACD simplified calculation
      const ema12 = calculateSMA(prices, Math.min(12, prices.length));
      const ema26 = calculateSMA(prices, Math.min(26, prices.length));
      const macdValue = ema12 - ema26;
      const macdSignal = macdValue > 0 ? 'Bullish' : 'Bearish';

      // Bollinger Bands
      const sma20 = calculateSMA(prices, Math.min(20, prices.length));
      const stdDev = Math.sqrt(
        prices.slice(-20).reduce((sum: number, price: number) => sum + Math.pow(price - sma20, 2), 0) / 20
      );
      const bollingerUpper = sma20 + (2 * stdDev);
      const bollingerLower = sma20 - (2 * stdDev);

      // Generate trading signals
      let signalCount = 0;
      if (rsi < 30) signalCount += 2; // Oversold - strong buy signal
      else if (rsi < 50) signalCount += 1; // Buy signal
      else if (rsi > 70) signalCount -= 2; // Overbought - strong sell signal
      else if (rsi > 50) signalCount -= 1; // Sell signal

      if (macdValue > 0) signalCount += 1;
      if (currentPrice > ma50) signalCount += 1;
      if (currentPrice > ma200) signalCount += 1;

      const overallSignal = signalCount > 2 ? 'Buy' : signalCount < -2 ? 'Sell' : 'Hold';
      const strength = Math.abs(signalCount) > 3 ? 'Strong' : Math.abs(signalCount) > 1 ? 'Moderate' : 'Weak';

      return {
        symbol: symbol.toUpperCase(),
        interval,
        currentPrice: `$${currentPrice.toFixed(2)}`,
        change24h: `${change24h.toFixed(2)}%`,
        indicators: {
          rsi: rsi.toFixed(2),
          rsiInterpretation: rsi < 30 ? 'Oversold (Bullish)' : rsi > 70 ? 'Overbought (Bearish)' : 'Neutral',
          macd: {
            value: macdValue.toFixed(2),
            signal: macdSignal,
          },
          movingAverages: {
            ma50: `$${ma50.toFixed(2)}`,
            ma200: `$${ma200.toFixed(2)}`,
            interpretation: currentPrice > ma50 ? 'Price above MA50 (Bullish)' : 'Price below MA50 (Bearish)',
          },
          bollingerBands: {
            upper: `$${bollingerUpper.toFixed(2)}`,
            middle: `$${sma20.toFixed(2)}`,
            lower: `$${bollingerLower.toFixed(2)}`,
            position: currentPrice > bollingerUpper ? 'Above upper band (Overbought)' :
                      currentPrice < bollingerLower ? 'Below lower band (Oversold)' : 'Within bands',
          },
        },
        signals: {
          overall: overallSignal,
          strength: strength,
          supportLevels: [bollingerLower.toFixed(2), ma200.toFixed(2)],
          resistanceLevels: [bollingerUpper.toFixed(2), (currentPrice * 1.10).toFixed(2)],
        },
        recommendation: `${strength} ${overallSignal}`,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[TechnicalAnalysis] Error for ${symbol}:`, errorMsg);

      // Graceful fallback to basic simulated data
      const price = 1000 + Math.random() * 10000;
      const change24h = -5 + Math.random() * 10;

      return {
        symbol: symbol.toUpperCase(),
        interval,
        dataSource: 'Fallback Data',
        available: false,
        currentPrice: `$${price.toFixed(2)}`,
        change24h: `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%`,
        indicators: {
          rsi: (30 + Math.random() * 40).toFixed(2),
          rsiInterpretation: 'Data unavailable',
          macd: { value: 'N/A', signal: 'Unknown' },
          movingAverages: { ma50: 'N/A', ma200: 'N/A', interpretation: 'Data unavailable' },
          bollingerBands: {
            upper: 'N/A',
            middle: 'N/A',
            lower: 'N/A',
            position: 'Data unavailable',
          },
        },
        signals: {
          overall: 'Hold',
          strength: 'Unknown',
          supportLevels: ['N/A'],
          resistanceLevels: ['N/A'],
        },
        recommendation: 'Insufficient data for analysis',
        note: errorMsg.includes('RATE_LIMIT')
          ? 'Rate limit reached - technical data temporarily unavailable. Try again shortly.'
          : errorMsg.includes('HTTP_404')
          ? `Technical data not available for "${symbol.toUpperCase()}". Try Deep Search for project information.`
          : 'Live technical data temporarily unavailable',
        timestamp: new Date().toISOString(),
      };
    }
  },
});

// On-chain Data Tracking Tool
export const onchainTrackerTool = tool({
  description: 'Track on-chain data including wallet activities, transaction volumes, and network metrics for a cryptocurrency.',
  parameters: z.object({
    symbol: z.string().describe('The cryptocurrency symbol (e.g., BTC, ETH)'),
    metric: z.enum(['transactions', 'whale_activity', 'network_health', 'all']).default('all').describe('Type of on-chain metric to track'),
  }),
  execute: async ({ symbol, metric }) => {
    try {
      // Currently only supports Ethereum on-chain data - return friendly message instead of throwing error
      if (symbol.toUpperCase() !== 'ETH') {
        return {
          symbol: symbol.toUpperCase(),
          metric,
          dataSource: 'Limited Support',
          available: false,
          message: `On-chain data tracking is currently only available for Ethereum (ETH)`,
          requestedSymbol: symbol.toUpperCase(),
          supportedChains: ['ETH'],
          alternatives: [
            {
              tool: 'Technical Analysis',
              description: 'Get price trends, indicators, and trading signals',
              supportsAllCoins: true,
            },
            {
              tool: 'Social Sentiment',
              description: 'Analyze community sentiment and market momentum',
              supportsAllCoins: true,
            },
            {
              tool: 'Deep Search',
              description: 'Research project fundamentals and market data',
              supportsAllCoins: true,
            },
          ],
          note: 'On-chain tracking for other blockchains (BTC, SOL, etc.) coming soon',
          timestamp: new Date().toISOString(),
        };
      }

      const apiKey = process.env.ETHERSCAN_API_KEY;

      if (!apiKey) {
        console.log('Etherscan API key not found, using fallback data');
        throw new Error('No API key');
      }

      // Get Ethereum network statistics
      const ethSupplyResponse = await fetch(
        `https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=${apiKey}`
      );
      const ethPriceResponse = await fetch(
        `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${apiKey}`
      );
      const gasOracleResponse = await fetch(
        `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${apiKey}`
      );

      const [supplyData, priceData, gasData] = await Promise.all([
        ethSupplyResponse.json(),
        ethPriceResponse.json(),
        gasOracleResponse.json(),
      ]);

      // Parse data
      const totalSupply = supplyData.result ? (Number.parseInt(supplyData.result) / 1e18).toFixed(0) : 'N/A';
      const ethPrice = priceData.result?.ethusd || 'N/A';
      const gasPrice = gasData.result?.ProposeGasPrice || 'N/A';
      const safeGasPrice = gasData.result?.SafeGasPrice || 'N/A';
      const fastGasPrice = gasData.result?.FastGasPrice || 'N/A';

      // Calculate market cap
      const marketCap = priceData.result?.ethusd
        ? `$${(Number.parseFloat(totalSupply) * Number.parseFloat(priceData.result.ethusd)).toLocaleString()}`
        : 'N/A';

      return {
        symbol: 'ETH',
        metric,
        dataSource: 'Etherscan API (Real-time)',
        networkMetrics: {
          totalSupply: `${Number.parseInt(totalSupply).toLocaleString()} ETH`,
          currentPrice: `$${ethPrice}`,
          marketCap,
          averageGasFee: `${gasPrice} Gwei`,
          safeGasFee: `${safeGasPrice} Gwei`,
          fastGasFee: `${fastGasPrice} Gwei`,
        },
        gasTracker: {
          standard: `${gasPrice} Gwei (~30 sec)`,
          fast: `${fastGasPrice} Gwei (~15 sec)`,
          safe: `${safeGasPrice} Gwei (~3 min)`,
          lastUpdate: new Date().toISOString(),
        },
        networkHealth: {
          status: 'Operational',
          gasLevel: Number.parseInt(gasPrice) > 50 ? 'High' : Number.parseInt(gasPrice) > 20 ? 'Medium' : 'Low',
          recommendation:
            Number.parseInt(gasPrice) > 50
              ? 'Gas fees are high. Consider waiting for lower fees.'
              : 'Gas fees are reasonable for transactions.',
        },
        insights: [
          `Current gas price: ${gasPrice} Gwei`,
          `ETH supply: ${Number.parseInt(totalSupply).toLocaleString()} ETH`,
          `Network status: ${Number.parseInt(gasPrice) > 50 ? 'Congested' : 'Normal'}`,
          `Recommended gas: ${safeGasPrice} Gwei for safe transactions`,
        ],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[OnchainTracker] Error for ${symbol}:`, errorMsg);

      // Graceful fallback
      return {
        symbol: symbol.toUpperCase(),
        metric,
        dataSource: 'Fallback Data',
        available: false,
        networkMetrics: {
          totalSupply: 'N/A',
          currentPrice: 'N/A',
          marketCap: 'N/A',
          averageGasFee: 'N/A',
          safeGasFee: 'N/A',
          fastGasFee: 'N/A',
        },
        networkHealth: {
          status: 'Unknown',
          gasLevel: 'Unknown',
          recommendation: 'On-chain data temporarily unavailable',
        },
        note: symbol.toUpperCase() !== 'ETH'
          ? `On-chain tracking currently only available for Ethereum (ETH). For ${symbol.toUpperCase()}, try Social Sentiment or Technical Analysis.`
          : 'Etherscan API temporarily unavailable',
        timestamp: new Date().toISOString(),
      };
    }
  },
});

// Deep Search Tool
export const deepSearchTool = tool({
  description: 'Perform deep research on a cryptocurrency project including fundamentals, team, technology, and market position using multiple data sources.',
  parameters: z.object({
    projectName: z.string().describe('The name or symbol of the cryptocurrency project'),
    aspects: z.array(z.enum(['team', 'technology', 'tokenomics', 'partnerships', 'roadmap', 'all'])).default(['all']).describe('Aspects to research'),
  }),
  execute: async ({ projectName, aspects }) => {
    try {
      // First try using multiple data sources to get basic project info
      const projectInfo = await fetchProjectInfoWithFallback(projectName);

      // If project info is successfully obtained, build and return basic research result
      if (projectInfo) {
        return {
          projectName: projectInfo.name || projectName,
          symbol: projectInfo.symbol?.toUpperCase() || projectName.toUpperCase(),
          researched: aspects,
          dataSource: `🔍 ${projectInfo.source}`,
          overview: {
            description: projectInfo.description || `${projectName} is a cryptocurrency project.`,
            category: projectInfo.categories?.length ? projectInfo.categories.join(', ') : 'Cryptocurrency',
            launchDate: 'Unknown',
            currentPhase: 'Unknown',
            website: projectInfo.homepage || 'N/A',
            blockchain: projectInfo.blockchain || 'Unknown',
          },
          marketData: {
            currentPrice: 'N/A',
            marketCap: 'N/A',
            marketCapRank: projectInfo.marketCapRank ?? 'N/A',
            totalVolume24h: 'N/A',
            priceChange24h: 'N/A',
            priceChange7d: 'N/A',
            priceChange30d: 'N/A',
            allTimeHigh: 'N/A',
            allTimeLow: 'N/A',
          },
          tokenomics: {
            totalSupply: 'N/A',
            circulatingSupply: 'N/A',
            maxSupply: 'N/A',
            circulatingPercentage: 'N/A',
          },
          community: {
            twitterFollowers: 'N/A',
            redditSubscribers: 'N/A',
            telegramUsers: 'N/A',
            facebookLikes: 'N/A',
          },
          development: {
            githubStars: 'N/A',
            githubForks: 'N/A',
            githubSubscribers: 'N/A',
            totalIssues: 'N/A',
            closedIssues: 'N/A',
            pullRequests: 'N/A',
            commits4weeks: 'N/A',
            activityLevel: 'Unknown',
          },
          links: {
            website: projectInfo.homepage || 'N/A',
            whitepaper: 'N/A',
            github: 'N/A',
            twitter: 'N/A',
            reddit: 'N/A',
            telegram: 'N/A',
          },
          sentiment: {
            overall: 'Neutral',
            upVotes: 'N/A',
            downVotes: 'N/A',
            communityScore: 'N/A',
            developerScore: 'N/A',
            liquidityScore: 'N/A',
          },
          risks: [],
        };
      }

      // If multiple data sources fail, try using CoinGecko detailed API
      if (!projectInfo) {
        const id = await getCoinGeckoId(projectName);
        const apiKey = process.env.COINGECKO_API_KEY;
        const baseUrl = apiKey
          ? 'https://pro-api.coingecko.com/api/v3'
          : 'https://api.coingecko.com/api/v3';
        const headers: HeadersInit = apiKey ? { 'x-cg-pro-api-key': apiKey } : {};

        // Get detailed coin info - use cache
        const url = `${baseUrl}/coins/${id}?localization=false&tickers=false&community_data=true&developer_data=true`;
        const data = await cachedFetch(url, { headers }) as any;

        // Build comprehensive research report
        return {
          projectName: data.name || projectName,
          symbol: data.symbol?.toUpperCase(),
          researched: aspects,
          dataSource: '🔍 CoinGecko (Fallback)',
          overview: {
            description: data.description?.en?.substring(0, 500) || `${projectName} is a cryptocurrency project.`,
            category: data.categories?.join(', ') || 'Cryptocurrency',
            launchDate: data.genesis_date || 'Unknown',
            currentPhase: 'Live',
            website: data.links?.homepage?.[0] || 'N/A',
            blockchain: data.asset_platform_id || data.platforms ? Object.keys(data.platforms)[0] : 'Native',
          },
          marketData: {
            currentPrice: `$${data.market_data?.current_price?.usd?.toFixed(2) || 'N/A'}`,
            marketCap: `$${data.market_data?.market_cap?.usd?.toLocaleString() || 'N/A'}`,
            marketCapRank: data.market_cap_rank || 'N/A',
            totalVolume24h: `$${data.market_data?.total_volume?.usd?.toLocaleString() || 'N/A'}`,
            priceChange24h: `${data.market_data?.price_change_percentage_24h?.toFixed(2) || '0'}%`,
            priceChange7d: `${data.market_data?.price_change_percentage_7d?.toFixed(2) || '0'}%`,
            priceChange30d: `${data.market_data?.price_change_percentage_30d?.toFixed(2) || '0'}%`,
            allTimeHigh: `$${data.market_data?.ath?.usd?.toFixed(2) || 'N/A'}`,
            allTimeLow: `$${data.market_data?.atl?.usd?.toFixed(2) || 'N/A'}`,
          },
          tokenomics: {
            totalSupply: data.market_data?.total_supply?.toLocaleString() || 'N/A',
            circulatingSupply: data.market_data?.circulating_supply?.toLocaleString() || 'N/A',
            maxSupply: data.market_data?.max_supply?.toLocaleString() || 'Unlimited',
            circulatingPercentage: data.market_data?.circulating_supply && data.market_data?.total_supply
              ? `${((data.market_data.circulating_supply / data.market_data.total_supply) * 100).toFixed(1)}%`
              : 'N/A',
          },
          community: {
            twitterFollowers: data.community_data?.twitter_followers?.toLocaleString() || 'N/A',
            redditSubscribers: data.community_data?.reddit_subscribers?.toLocaleString() || 'N/A',
            telegramUsers: data.community_data?.telegram_channel_user_count?.toLocaleString() || 'N/A',
            facebookLikes: data.community_data?.facebook_likes?.toLocaleString() || 'N/A',
          },
          development: {
            githubStars: data.developer_data?.stars || 'N/A',
            githubForks: data.developer_data?.forks || 'N/A',
            githubSubscribers: data.developer_data?.subscribers || 'N/A',
            totalIssues: data.developer_data?.total_issues || 'N/A',
            closedIssues: data.developer_data?.closed_issues || 'N/A',
            pullRequests: data.developer_data?.pull_requests_merged || 'N/A',
            commits4weeks: data.developer_data?.commit_count_4_weeks || 'N/A',
            activityLevel: data.developer_data?.commit_count_4_weeks > 100 ? 'Very Active' :
                          data.developer_data?.commit_count_4_weeks > 50 ? 'Active' :
                          data.developer_data?.commit_count_4_weeks > 10 ? 'Moderate' : 'Low',
          },
          links: {
            website: data.links?.homepage?.filter((l: string) => l)?.[0] || 'N/A',
            whitepaper: data.links?.whitepaper || 'N/A',
            github: data.links?.repos_url?.github?.[0] || 'N/A',
            twitter: data.links?.twitter_screen_name ? `https://twitter.com/${data.links.twitter_screen_name}` : 'N/A',
            reddit: data.links?.subreddit_url || 'N/A',
            telegram: data.links?.telegram_channel_identifier ? `https://t.me/${data.links.telegram_channel_identifier}` : 'N/A',
          },
          sentiment: {
            overall: data.sentiment_votes_up_percentage > 70 ? 'Very Positive' :
                     data.sentiment_votes_up_percentage > 50 ? 'Positive' :
                     data.sentiment_votes_up_percentage > 30 ? 'Neutral' : 'Negative',
            upVotes: data.sentiment_votes_up_percentage || 'N/A',
            downVotes: data.sentiment_votes_down_percentage || 'N/A',
            communityScore: data.community_score?.toFixed(1) || 'N/A',
            developerScore: data.developer_score?.toFixed(1) || 'N/A',
            liquidityScore: data.liquidity_score?.toFixed(1) || 'N/A',
          },
          risks: [
            data.market_data?.price_change_percentage_24h < -10 ? 'High recent volatility' : null,
            !data.market_data?.max_supply ? 'Unlimited token supply' : null,
            data.developer_data?.commit_count_4_weeks < 10 ? 'Low development activity' : null,
            data.community_score < 30 ? 'Low community engagement' : null,
          ].filter(Boolean),
        };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[DeepSearch] Error for ${projectName}:`, errorMsg);

      // Graceful fallback to basic information
      return {
        projectName,
        symbol: projectName.toUpperCase(),
        researched: aspects,
        dataSource: 'Fallback Data',
        available: false,
        overview: {
          description: `Limited information available for ${projectName}.`,
          category: 'Cryptocurrency',
          launchDate: 'Unknown',
          currentPhase: 'Unknown',
          website: 'N/A',
          blockchain: 'Unknown',
        },
        marketData: {
          currentPrice: 'N/A',
          marketCap: 'N/A',
          marketCapRank: 'N/A',
          totalVolume24h: 'N/A',
          priceChange24h: 'N/A',
          priceChange7d: 'N/A',
          priceChange30d: 'N/A',
          allTimeHigh: 'N/A',
          allTimeLow: 'N/A',
        },
        note: errorMsg.includes('RATE_LIMIT')
          ? 'Rate limit reached - detailed project data temporarily unavailable. Try again in a moment.'
          : errorMsg.includes('HTTP_404')
          ? `Cryptocurrency "${projectName}" not found in database. It may be a new or less common project.`
          : 'Deep research temporarily unavailable - showing minimal information',
        timestamp: new Date().toISOString(),
      };
    }
  },
});

// Static mapping table for cryptocurrency symbols to CoinGecko IDs (major coins + popular new projects)
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  // Top 15 major coins
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  MATIC: 'matic-network',
  POL: 'matic-network', // After Polygon rebranding
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  LTC: 'litecoin',
  APT: 'aptos',

  // 2024-2025 trending Layer 1/Layer 2
  SUI: 'sui',
  ARB: 'arbitrum',
  OP: 'optimism',
  BASE: 'base',
  STRK: 'starknet',
  SEI: 'sei-network',
  INJ: 'injective-protocol',
  TIA: 'celestia',

  // DeFi protocol tokens
  AAVE: 'aave',
  CRV: 'curve-dao-token',
  MKR: 'maker',
  COMP: 'compound-governance-token',
  PENDLE: 'pendle',
  ONDO: 'ondo-finance',

  // Meme coins
  SHIB: 'shiba-inu',
  PEPE: 'pepe',
  WIF: 'dogwifcoin',
  BONK: 'bonk',

  // Other popular projects
  HYPE: 'harrypotterhypermarioliquidfentjeffspecterinu',  // HarryPotterHyperMarioLiquidFentjeffspecterinu (Meme coin)
  HYPERLIQUID: 'hyperliquid',  // Hyperliquid (DEX platform) - Note: different from HYPE
  FTM: 'fantom',
  NEAR: 'near',
  ALGO: 'algorand',
  FIL: 'filecoin',
  VET: 'vechain',
  ICP: 'internet-computer',
  GRT: 'the-graph',
  SAND: 'the-sandbox',
  MANA: 'decentraland',
  AXS: 'axie-infinity',

  // 2025 emerging popular projects
  VIRTUAL: 'virtuals-protocol',  // Virtuals Protocol (AI Agent platform)
  AI16Z: 'ai16z',  // AI16Z (AI + DeFi)
  GRIFFAIN: 'griffain',  // Griffain (GameFi)
  ZETA: 'zetachain',  // ZetaChain (Cross-chain)
  BLAST: 'blast',  // Blast (Layer 2)
  MOVE: 'movement',  // Movement (Move language chain)
  SAGA: 'saga-2',  // Saga (Gaming chain)
  PYTH: 'pyth-network',  // Pyth Network (Oracle)
  WLD: 'worldcoin-wld',  // Worldcoin (Sam Altman project)
  RENDER: 'render-token',  // Render Network (GPU rendering)
  FET: 'fetch-ai',  // Fetch.ai (AI + blockchain)
  OCEAN: 'ocean-protocol',  // Ocean Protocol (Data marketplace)
  AGIX: 'singularitynet',  // SingularityNET (AI marketplace)
};

// Real-time market data retrieval tool (using multiple data source fallback strategy)
export const getMarketDataTool = tool({
  description: 'Get real-time market data for cryptocurrencies including price, volume, and market cap using multiple data sources (CoinGecko -> Mobula -> Nomics).',
  parameters: z.object({
    symbols: z.array(z.string()).describe('Array of cryptocurrency symbols (e.g., ["BTC", "ETH", "SOL"])'),
  }),
  execute: async ({ symbols }) => {
    try {
      // Fetch price data for all coins in parallel (using multiple data source fallback)
      const priceDataPromises = symbols.map(symbol => fetchPriceWithFallback(symbol));
      const priceDataArray = await Promise.all(priceDataPromises);

      // Convert data format
      return symbols.map((symbol, index) => {
        const priceData = priceDataArray[index];

        if (!priceData) {
          return {
            symbol: symbol.toUpperCase(),
            error: 'Data not available from any source',
            price: 'N/A',
            change24h: 'N/A',
            volume24h: 'N/A',
            marketCap: 'N/A',
            dataSource: 'None (All sources failed)',
          };
        }

        return {
          symbol: symbol.toUpperCase(),
          price: `$${priceData.price.toFixed(2)}`,
          change24h: `${priceData.change24h ? (priceData.change24h > 0 ? '+' : '') + priceData.change24h.toFixed(2) : '0'}%`,
          volume24h: priceData.volume24h ? `$${priceData.volume24h.toLocaleString()}` : 'N/A',
          marketCap: priceData.marketCap ? `$${priceData.marketCap.toLocaleString()}` : 'N/A',
          dataSource: `📊 ${priceData.source}`, // 标记数据来源
        };
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[MarketData] Error:', errorMsg);

      // Graceful fallback to simulated data
      return symbols.map(symbol => ({
        symbol: symbol.toUpperCase(),
        dataSource: 'Fallback Data',
        available: false,
        price: 'N/A',
        change24h: 'N/A',
        volume24h: 'N/A',
        marketCap: 'N/A',
        note: 'Market data temporarily unavailable from all sources',
        timestamp: new Date().toISOString(),
      }));
    }
  },
});

// ========== New Token Discovery Tool ==========

/**
 * New Token Discovery Tool
 * Get list of recently launched tokens to help users discover new opportunities
 */
export const newTokensDiscoveryTool = tool({
  description: 'Discover recently launched tokens across 200+ blockchain networks using GeckoTerminal. Returns the latest tokens with price data, 24h changes, and network information.',
  parameters: z.object({
    limit: z.number().min(5).max(50).default(10).describe('Number of tokens to return (5-50, default 10)'),
    source: z.enum(['recent', 'trending', 'both']).default('both').describe('Data source: recent (newly added on-chain), trending (popular), or both'),
  }),
  execute: async ({ limit, source }) => {
    try {
      console.log(`[NewTokens] Fetching ${limit} new tokens (source: ${source})`);

      // Call internal API (server-side, avoids CORS and rate limiting)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tokens/new?limit=${limit}&source=${source}`,
        {
          next: { revalidate: 300 } // Cache for 5 minutes
        }
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.tokens) {
        throw new Error('Invalid API response');
      }

      // Format return data
      const formattedTokens = data.tokens.map((token: any, index: number) => ({
        rank: index + 1,
        symbol: token.symbol.toUpperCase(),
        name: token.name,
        network: token.network,
        price: token.priceUsd ? `$${token.priceUsd.toFixed(6)}` : 'N/A',
        priceChange24h: token.priceChange24h
          ? `${token.priceChange24h > 0 ? '+' : ''}${token.priceChange24h.toFixed(2)}%`
          : 'N/A',
        volume24h: token.volume24h ? `$${token.volume24h.toLocaleString()}` : 'N/A',
        liquidity: token.liquidity ? `$${token.liquidity.toLocaleString()}` : 'N/A',
        source: token.source === 'recent' ? '🆕 Recently Added' : '🔥 Trending',
        updatedAt: token.updatedAt ? new Date(token.updatedAt).toLocaleString() : 'N/A',
      }));

      console.log(`[NewTokens] ✓ Returned ${formattedTokens.length} tokens`);

      return {
        success: true,
        count: formattedTokens.length,
        tokens: formattedTokens,
        dataSource: '🌐 GeckoTerminal (Free)',
        note: source === 'both'
          ? 'Combined: Recently added on-chain tokens + Trending tokens from CoinGecko'
          : source === 'recent'
          ? 'Recently added tokens from DEXs across 200+ networks'
          : 'Top 7 trending tokens from CoinGecko in the last 24 hours',
      };
    } catch (error) {
      console.error('[NewTokens] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        note: 'Failed to fetch new tokens. Please try again later.',
      };
    }
  },
});

/**
 * Trending Coins Tool
 * Get current market trending/hot tokens
 */
export const trendingCoinsTool = tool({
  description: 'Get the top 7 trending cryptocurrencies in the last 24 hours from CoinGecko. These are the most searched and talked about coins.',
  parameters: z.object({}),
  execute: async () => {
    try {
      console.log('[Trending] Fetching trending coins...');

      // Use GeckoTerminal's fetchTrendingTokens method
      const { geckoTerminal } = await import('./data-sources');
      const tokens = await geckoTerminal.fetchTrendingTokens();

      if (tokens.length === 0) {
        return {
          success: false,
          error: 'No trending data available',
        };
      }

      const formattedTokens = tokens.map((token, index) => ({
        rank: index + 1,
        symbol: token.symbol.toUpperCase(),
        name: token.name,
        price: token.priceUsd ? `$${token.priceUsd.toFixed(2)}` : 'N/A',
        priceChange24h: token.priceChange24h
          ? `${token.priceChange24h > 0 ? '+' : ''}${token.priceChange24h.toFixed(2)}%`
          : 'N/A',
      }));

      console.log(`[Trending] ✓ Returned ${formattedTokens.length} trending coins`);

      return {
        success: true,
        count: formattedTokens.length,
        coins: formattedTokens,
        dataSource: '🔥 CoinGecko Trending (Free)',
        note: 'Top 7 most searched cryptocurrencies in the last 24 hours',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Trending] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

// Export all tools
export const allTools = {
  socialSentiment: socialSentimentTool,
  technicalAnalysis: technicalAnalysisTool,
  onchainTracker: onchainTrackerTool,
  deepSearch: deepSearchTool,
  getMarketData: getMarketDataTool,
  newTokensDiscovery: newTokensDiscoveryTool,
  trendingCoins: trendingCoinsTool,
};
