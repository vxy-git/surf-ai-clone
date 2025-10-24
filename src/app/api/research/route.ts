import { openai, createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { allTools } from '@/lib/ai-tools';

// 使用 Node.js runtime 以支持完整的 fetch 功能
// Edge runtime 对某些外部 API 有限制
// export const runtime = 'edge';

// 配置 AI 提供商 (支持 OpenAI 或 CometAPI)
const aiProvider = process.env.OPENAI_BASE_URL
  ? createOpenAI({
      baseURL: process.env.OPENAI_BASE_URL,
      apiKey: process.env.OPENAI_API_KEY,
    })
  : openai;

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
  try {
    const { messages } = await req.json();

    // 为研究模式添加额外的上下文
    const enhancedMessages = [
      {
        role: 'system' as const,
        content: 'User has requested a detailed research report. Provide comprehensive analysis using all available tools.'
      },
      ...messages
    ];

    const result = streamText({
      model: aiProvider('gpt-4o'),
      system: researchSystemPrompt,
      messages: enhancedMessages,
      tools: allTools,
      maxSteps: 10, // 研究模式允许更多步骤
      temperature: 0.5, // 降低温度以提高准确性
    } as Parameters<typeof streamText>[0]);

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Research API Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process research request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
