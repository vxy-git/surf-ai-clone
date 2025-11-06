/**
 * Next.js Middleware - x402 Payment Integration
 *
 * 拦截 API 请求，超过额度时返回 402 Payment Required
 * Intercepts API requests and returns 402 Payment Required when quota exceeded
 */

import { paymentMiddleware } from 'x402-next';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PAYMENT_CONFIG } from './src/config/payment-config';

// 确保收款地址已配置
if (!PAYMENT_CONFIG.RECEIVER_ADDRESS) {
  console.warn('⚠️  RECEIVER_ADDRESS not configured in environment variables');
}

// 创建 x402 支付中间件
const x402Middleware = PAYMENT_CONFIG.RECEIVER_ADDRESS
  ? paymentMiddleware(
      PAYMENT_CONFIG.RECEIVER_ADDRESS,
      {
        '/api/chat': {
          price: PAYMENT_CONFIG.PAYMENT_PRICE,
          network: PAYMENT_CONFIG.NETWORK,
          config: {
            description: PAYMENT_CONFIG.PAYMENT_DESCRIPTION,
            maxTimeoutSeconds: 60
          }
        },
        '/api/research': {
          price: PAYMENT_CONFIG.PAYMENT_PRICE,
          network: PAYMENT_CONFIG.NETWORK,
          config: {
            description: PAYMENT_CONFIG.PAYMENT_DESCRIPTION,
            maxTimeoutSeconds: 60
          }
        }
      }
    )
  : null;

export async function middleware(request: NextRequest) {
  // 如果未配置收款地址，直接放行
  if (!x402Middleware) {
    return NextResponse.next();
  }

  try {
    const response = await x402Middleware(request);

    // 如果返回 402 响应，添加必要的 CORS 和安全头
    if (response && response.status === 402) {
      const newResponse = new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-PAYMENT');

      return newResponse;
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/api/chat/:path*',
    '/api/research/:path*',
  ]
};
