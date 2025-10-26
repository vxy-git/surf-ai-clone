import { openai, createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { allTools } from '@/lib/ai-tools';

// 使用 Node.js runtime 以支持完整的 fetch 功能
export const runtime = 'nodejs';
// 研究模式需要更长的执行时间（Vercel 免费版最多 10 秒）
export const maxDuration = 10;

// 配置 AI 提供商 (支持 OpenAI 或 CometAPI)
const aiProvider = process.env.OPENAI_BASE_URL
  ? createOpenAI({
      baseURL: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
    })
  : openai;

/**
 * 清理消息数组，确保兼容 CometAPI
 * CometAPI 不接受 content: null，必须转换为空字符串
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeMessages(messages: any[]): any[] {
  return messages.map(message => {
    // 如果 content 为 null 或 undefined，转换为空字符串
    if (message.content === null || message.content === undefined) {
      return {
        ...message,
        content: ''
      };
    }
    return message;
  });
}

const researchSystemPrompt = `You are Surf AI Research Agent, specialized in producing comprehensive, publication-ready cryptocurrency research reports.

Your research methodology:
1. **Multi-Source Analysis**: Gather data from social media, on-chain metrics, technical indicators, and project fundamentals
2. **Structured Reporting**: Organize findings into clear sections with executive summary, detailed analysis, and conclusions
3. **Data Visualization**: Present key metrics and statistics in an easily digestible format
4. **Risk Assessment**: Always include balanced view of opportunities and risks
5. **Source Attribution**: Cite all data sources and analysis methods

Report Structure:
# Executive Summary
- Key findings in 3-5 bullet points
- Overall sentiment and recommendation tier

# Market Overview
- Current price and market cap
- 24h/7d/30d performance
- Trading volume and liquidity analysis

# Technical Analysis
- Chart patterns and key levels
- Indicator readings (RSI, MACD, Moving Averages)
- Support and resistance zones

# On-Chain Metrics
- Wallet activity and distribution
- Whale movements and exchange flows
- Network health indicators

# Social Sentiment
- Community sentiment score
- Trending discussions and topics
- Influencer opinions

# Fundamental Analysis (for deep research)
- Project overview and value proposition
- Team and backers
- Technology and innovation
- Tokenomics and distribution
- Partnerships and ecosystem
- Roadmap and milestones

# Risk Factors
- Market risks
- Technical risks
- Regulatory concerns
- Competition analysis

# Conclusion
- Summary of findings
- Market position assessment
- Key metrics to watch

Use professional language, provide specific data points, and format the report with markdown for readability.`;

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log('[Research API] Received request at', new Date().toISOString());

  try {
    // 1. 检查环境变量配置
    if (!process.env.OPENAI_API_KEY) {
      console.error('[Research API] ERROR: OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({
          error: 'API credentials not configured',
          message: 'OPENAI_API_KEY is missing. Please configure environment variables.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!process.env.OPENAI_BASE_URL) {
      console.warn('[Research API] WARNING: OPENAI_BASE_URL not configured, using default OpenAI');
    }

    console.log('[Research API] Environment check passed');
    console.log('[Research API] Using base URL:', process.env.OPENAI_BASE_URL || 'default OpenAI');

    // 2. 解析请求体
    const { messages } = await req.json();
    console.log('[Research API] Received', messages?.length || 0, 'messages');

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          message: 'Messages array is required and cannot be empty',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 为研究模式添加额外的上下文
    const enhancedMessages = [
      {
        role: 'system' as const,
        content: 'User has requested a detailed research report. Provide comprehensive analysis using all available tools.'
      },
      ...messages
    ];

    // 3. 清理消息（CometAPI 兼容性修复）
    const sanitizedMessages = sanitizeMessages(enhancedMessages);
    console.log('[Research API] Messages sanitized for CometAPI compatibility');

    // 4. 创建流式响应
    console.log('[Research API] Creating stream with model: gpt-4o');
    const result = await streamText({
      model: aiProvider('gpt-4o'),
      system: researchSystemPrompt,
      messages: sanitizedMessages,
      tools: allTools,
      maxSteps: 10, // 研究模式允许更多步骤
      temperature: 0.5, // 降低温度以提高准确性
    } as Parameters<typeof streamText>[0]);

    const elapsedTime = Date.now() - startTime;
    console.log(`[Research API] Stream created successfully in ${elapsedTime}ms`);

    return result.toTextStreamResponse();
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    console.error(`[Research API] Error after ${elapsedTime}ms:`, error);

    // 详细的错误信息
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Research API] Error details:', {
      message: errorMessage,
      stack: errorStack,
      baseUrl: process.env.OPENAI_BASE_URL,
      hasApiKey: !!process.env.OPENAI_API_KEY,
    });

    return new Response(
      JSON.stringify({
        error: 'Failed to process research request',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
