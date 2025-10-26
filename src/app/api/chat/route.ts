import { openai, createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { allTools } from '@/lib/ai-tools';

// 使用 Node.js runtime 以支持完整的 fetch 功能
export const runtime = 'nodejs';
// Vercel 免费版最多 10 秒，Pro 版支持 60 秒
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
  const startTime = Date.now();
  console.log('[Chat API] Received request at', new Date().toISOString());

  try {
    // 1. 检查环境变量配置
    if (!process.env.OPENAI_API_KEY) {
      console.error('[Chat API] ERROR: OPENAI_API_KEY not configured');
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
      console.warn('[Chat API] WARNING: OPENAI_BASE_URL not configured, using default OpenAI');
    }

    console.log('[Chat API] Environment check passed');
    console.log('[Chat API] Using base URL:', process.env.OPENAI_BASE_URL || 'default OpenAI');

    // 2. 解析请求体
    const { messages } = await req.json();
    console.log('[Chat API] Received', messages?.length || 0, 'messages');

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

    // 3. 清理消息（CometAPI 兼容性修复）
    const sanitizedMessages = sanitizeMessages(messages);
    console.log('[Chat API] Messages sanitized for CometAPI compatibility');

    // 4. 创建流式响应
    console.log('[Chat API] Creating stream with model: gpt-4o-mini');
    const result = await streamText({
      model: aiProvider('gpt-4o-mini'),
      system: systemPrompt,
      messages: sanitizedMessages,
      tools: allTools,
      maxSteps: 5,
      temperature: 0.7,
    } as Parameters<typeof streamText>[0]);

    const elapsedTime = Date.now() - startTime;
    console.log(`[Chat API] Stream created successfully in ${elapsedTime}ms`);

    return result.toTextStreamResponse();
  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    console.error(`[Chat API] Error after ${elapsedTime}ms:`, error);

    // 详细的错误信息
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Chat API] Error details:', {
      message: errorMessage,
      stack: errorStack,
      baseUrl: process.env.OPENAI_BASE_URL,
      hasApiKey: !!process.env.OPENAI_API_KEY,
    });

    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
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
