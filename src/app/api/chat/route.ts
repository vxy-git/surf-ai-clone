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

const systemPrompt = `You are Surf AI, a professional cryptocurrency research assistant. You help users understand crypto markets, analyze projects, and make informed decisions.

Key capabilities:
- Social Sentiment Analysis: Analyze community discussions and market sentiment
- Technical Analysis: Provide chart analysis and trading signals
- On-chain Data Tracking: Monitor blockchain metrics and whale activities
- Deep Research: Comprehensive project analysis including team, technology, and tokenomics

Guidelines:
- Be professional, accurate, and data-driven
- Explain complex concepts in simple terms
- Always cite data sources when available
- Warn about risks and volatility in crypto markets
- Never provide financial advice, only educational information

When users ask about cryptocurrency projects or markets:
1. Use the appropriate tools to gather data
2. Provide comprehensive analysis
3. Highlight both opportunities and risks
4. Format responses with clear sections and bullet points`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: aiProvider('gpt-4o-mini'),
      system: systemPrompt,
      messages,
      tools: allTools,
      maxSteps: 5,
      temperature: 0.7,
    } as Parameters<typeof streamText>[0]);

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
