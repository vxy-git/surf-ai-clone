/**
 * Health Check API
 * 用于检查服务状态和环境变量配置
 */

export const runtime = 'nodejs';

export async function GET() {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      runtime: 'nodejs',
    },
    configuration: {
      // 只检查是否存在，不暴露实际值
      openaiApiKey: !!process.env.OPENAI_API_KEY,
      openaiBaseUrl: !!process.env.OPENAI_BASE_URL,
      openaiBaseUrlValue: process.env.OPENAI_BASE_URL || 'not configured (using default OpenAI)',
      walletConnectProjectId: !!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
      coingeckoApiKey: !!process.env.COINGECKO_API_KEY,
      etherscanApiKey: !!process.env.ETHERSCAN_API_KEY,
    },
    checks: {
      canAccessEnv: true,
      apiReady: !!process.env.OPENAI_API_KEY,
    }
  };

  // 如果缺少关键配置，返回警告状态
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({
      ...healthStatus,
      status: 'error',
      message: 'OPENAI_API_KEY is not configured. Chat functionality will not work.',
      checks: {
        ...healthStatus.checks,
        apiReady: false,
      }
    }, { status: 500 });
  }

  return Response.json(healthStatus);
}
