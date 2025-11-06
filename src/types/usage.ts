/**
 * 使用额度相关类型定义
 * Usage and Credit Type Definitions
 */

export interface UsageData {
  walletAddress: string;
  freeUsage: number;           // 已使用的免费次数 (0-5)
  paidCredits: number;         // 已购买的付费次数余额
  lastFreeReset: number;       // 免费额度最后重置时间 (timestamp)
  totalPurchased: number;      // 累计购买次数
  paymentHistory: Payment[];   // 支付历史
}

export interface Payment {
  txHash: string;              // 交易哈希
  amount: string;              // 支付金额 "$0.01"
  creditsAdded: number;        // 增加的次数 5
  timestamp: number;           // 支付时间戳
  network: string;             // 网络 "base-sepolia" | "base"
}

export interface UsageInfo {
  currentUsage: number;        // 当前使用次数
  freeLimit: number;           // 免费额度上限
  remaining: number;           // 剩余次数
  exceeded: boolean;           // 是否超额
  isPaid: boolean;             // 是否是付费用户
  paidCredits: number;         // 付费次数余额
  percentage: number;          // 使用百分比
}

export interface UsageCheckResult {
  canUse: boolean;             // 是否可以使用
  needPayment: boolean;        // 是否需要付费
  freeRemaining: number;       // 免费剩余次数
  paidRemaining: number;       // 付费剩余次数
  message?: string;            // 提示信息
}
