/**
 * 使用次数追踪模块
 * Usage Tracking Module
 *
 * 管理用户的免费额度和支付状态
 * Manages user free quota and payment status
 */

import { PAYMENT_CONFIG } from '@/config/payment-config';
import type { UsageData, UsageCheckResult, Payment } from '@/types/usage';

const STORAGE_KEY_PREFIX = 'surfai_usage_';

/**
 * 获取存储键名
 * Get storage key for a wallet address
 */
function getStorageKey(walletAddress: string): string {
  return `${STORAGE_KEY_PREFIX}${walletAddress.toLowerCase()}`;
}

/**
 * 初始化使用数据
 * Initialize usage data for a new user
 */
function initializeUsageData(walletAddress: string): UsageData {
  return {
    walletAddress: walletAddress.toLowerCase(),
    freeUsage: 0,
    paidCredits: 0,
    lastFreeReset: Date.now(),
    totalPurchased: 0,
    paymentHistory: []
  };
}

/**
 * 检查是否需要重置免费额度
 * Check if free quota needs to be reset
 */
function shouldResetFreeQuota(lastReset: number): boolean {
  const now = Date.now();
  const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);
  return daysSinceReset >= PAYMENT_CONFIG.FREE_TIER_RESET_DAYS;
}

/**
 * 获取本地存储的使用数据
 * Get usage data from localStorage
 */
export function getUsageData(walletAddress: string): UsageData {
  if (typeof window === 'undefined') {
    return initializeUsageData(walletAddress);
  }

  try {
    const key = getStorageKey(walletAddress);
    const stored = localStorage.getItem(key);

    if (!stored) {
      const initial = initializeUsageData(walletAddress);
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }

    const data = JSON.parse(stored) as UsageData;

    // 检查是否需要重置免费额度
    if (shouldResetFreeQuota(data.lastFreeReset)) {
      data.freeUsage = 0;
      data.lastFreeReset = Date.now();
      localStorage.setItem(key, JSON.stringify(data));
    }

    return data;
  } catch (error) {
    console.error('Failed to parse usage data:', error);
    return initializeUsageData(walletAddress);
  }
}

/**
 * 保存使用数据
 * Save usage data to localStorage
 */
export function saveUsageData(walletAddress: string, data: UsageData): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getStorageKey(walletAddress);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save usage data:', error);
  }
}

/**
 * 检查是否可以使用 API
 * Check if user can use the API
 */
export function canUseAPI(walletAddress: string): UsageCheckResult {
  const data = getUsageData(walletAddress);

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
 * 消耗一次使用额度
 * Consume one usage credit
 */
export function consumeUsage(walletAddress: string): boolean {
  const data = getUsageData(walletAddress);

  // 优先消耗免费额度
  if (data.freeUsage < PAYMENT_CONFIG.FREE_TIER_LIMIT) {
    data.freeUsage++;
    saveUsageData(walletAddress, data);
    return true;
  }

  // 消耗付费次数
  if (data.paidCredits > 0) {
    data.paidCredits--;
    saveUsageData(walletAddress, data);
    return true;
  }

  return false;
}

/**
 * 增加付费次数
 * Add paid credits after successful payment
 */
export function addPaidCredits(
  walletAddress: string,
  txHash: string,
  creditsToAdd?: number
): UsageData {
  const data = getUsageData(walletAddress);
  const credits = creditsToAdd || PAYMENT_CONFIG.PAYMENT_CREDITS;

  // 增加付费次数
  data.paidCredits += credits;
  data.totalPurchased += credits;

  // 记录支付历史
  const payment: Payment = {
    txHash,
    amount: PAYMENT_CONFIG.PAYMENT_PRICE,
    creditsAdded: credits,
    timestamp: Date.now(),
    network: PAYMENT_CONFIG.NETWORK
  };
  data.paymentHistory.push(payment);

  saveUsageData(walletAddress, data);
  return data;
}

/**
 * 获取使用统计信息
 * Get usage statistics
 */
export function getUsageStats(walletAddress: string) {
  const data = getUsageData(walletAddress);
  const check = canUseAPI(walletAddress);

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

/**
 * 重置用户数据（仅用于测试）
 * Reset user data (for testing only)
 */
export function resetUsageData(walletAddress: string): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getStorageKey(walletAddress);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to reset usage data:', error);
  }
}
