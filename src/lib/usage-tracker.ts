/**
 * 使用次数追踪模块 - 数据库版本
 * Usage Tracking Module - Database Version
 *
 * 管理用户的免费额度和支付状态(通过数据库 API)
 * Manages user free quota and payment status (via database API)
 */

import { PAYMENT_CONFIG } from '@/config/payment-config';
import type { UsageData, UsageCheckResult } from '@/types/usage';

/**
 * 获取使用数据(从数据库)
 * Get usage data from database
 */
export async function getUsageData(walletAddress: string): Promise<UsageData> {
  try {
    const response = await fetch(`/api/usage?walletAddress=${encodeURIComponent(walletAddress)}`);

    if (!response.ok) {
      throw new Error('Failed to fetch usage data');
    }

    return await response.json();
  } catch (error) {
    console.error('获取使用数据失败:', error);
    // 返回默认数据
    return {
      walletAddress: walletAddress.toLowerCase(),
      freeUsage: 0,
      paidCredits: 0,
      lastFreeReset: Date.now(),
      totalPurchased: 0,
      paymentHistory: []
    };
  }
}

/**
 * 检查是否可以使用 API
 * Check if user can use the API
 */
export async function canUseAPI(walletAddress: string): Promise<UsageCheckResult> {
  const data = await getUsageData(walletAddress);

  const freeRemaining = Math.max(0, PAYMENT_CONFIG.FREE_TIER_LIMIT - data.freeUsage);
  const paidRemaining = data.paidCredits;

  // 还有免费次数
  if (freeRemaining > 0) {
    return {
      canUse: true,
      needPayment: false,
      freeRemaining,
      paidRemaining,
      message: `还有 ${freeRemaining} 次免费使用`
    };
  }

  // 还有付费次数
  if (paidRemaining > 0) {
    return {
      canUse: true,
      needPayment: false,
      freeRemaining: 0,
      paidRemaining,
      message: `还有 ${paidRemaining} 次付费使用`
    };
  }

  // 需要付费
  return {
    canUse: false,
    needPayment: true,
    freeRemaining: 0,
    paidRemaining: 0,
    message: `支付 ${PAYMENT_CONFIG.PAYMENT_PRICE} USDC 获得 ${PAYMENT_CONFIG.PAYMENT_CREDITS} 次使用`
  };
}

/**
 * 消耗一次使用额度(调用数据库 API)
 * Consume one usage credit
 */
export async function consumeUsage(walletAddress: string): Promise<boolean> {
  try {
    const response = await fetch('/api/usage/consume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ walletAddress })
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('消耗额度失败:', error);
    return false;
  }
}

/**
 * 验证支付并增加付费次数(调用数据库 API)
 * Verify payment and add paid credits
 */
export async function verifyPaymentAndAddCredits(
  walletAddress: string,
  txHash: string,
  network: 'base' | 'base-sepolia'
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const response = await fetch('/api/usage/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        walletAddress,
        txHash,
        network
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || '支付验证失败'
      };
    }

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('验证支付失败:', error);
    return {
      success: false,
      error: '网络错误'
    };
  }
}

/**
 * 获取使用统计信息
 * Get usage statistics
 */
export async function getUsageStats(walletAddress: string) {
  const data = await getUsageData(walletAddress);
  const check = await canUseAPI(walletAddress);

  return {
    freeUsage: data.freeUsage,
    freeLimit: PAYMENT_CONFIG.FREE_TIER_LIMIT,
    freeRemaining: check.freeRemaining,
    paidCredits: data.paidCredits,
    totalPurchased: data.totalPurchased,
    lastResetDate: new Date(data.lastFreeReset).toISOString(),
    nextResetDate: new Date(
      data.lastFreeReset + PAYMENT_CONFIG.FREE_TIER_RESET_DAYS * 24 * 60 * 60 * 1000
    ).toISOString(),
    paymentHistory: data.paymentHistory,
    canUse: check.canUse,
    needPayment: check.needPayment
  };
}
