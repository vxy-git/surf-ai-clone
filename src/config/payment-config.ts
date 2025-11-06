/**
 * 支付配置文件 - 所有参数可通过环境变量配置
 * Payment Configuration - All parameters configurable via environment variables
 */

export const PAYMENT_CONFIG = {
  // ========== 免费额度配置 ==========
  // Free Tier Configuration
  FREE_TIER_LIMIT: parseInt(process.env.NEXT_PUBLIC_FREE_TIER_LIMIT || '5'),
  FREE_TIER_RESET_DAYS: parseInt(process.env.NEXT_PUBLIC_FREE_TIER_RESET_DAYS || '30'),

  // ========== 付费配置 ==========
  // Payment Configuration
  PAYMENT_PRICE: process.env.NEXT_PUBLIC_PAYMENT_PRICE || '$0.01',
  PAYMENT_CREDITS: parseInt(process.env.NEXT_PUBLIC_PAYMENT_CREDITS || '5'),

  // ========== 区块链配置 ==========
  // Blockchain Configuration
  NETWORK: (process.env.NEXT_PUBLIC_NETWORK || 'base-sepolia') as 'base' | 'base-sepolia',
  RECEIVER_ADDRESS: process.env.NEXT_PUBLIC_RECEIVER_ADDRESS as `0x${string}`,

  // ========== USDC 合约地址 ==========
  // USDC Contract Addresses
  USDC_CONTRACT: {
    'base': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  } as const,

  // ========== 支付描述 ==========
  // Payment Description
  get PAYMENT_DESCRIPTION() {
    return `购买 ${this.PAYMENT_CREDITS} 次 Surf AI 使用机会`;
  },

  get PAYMENT_DESCRIPTION_EN() {
    return `Purchase ${this.PAYMENT_CREDITS} Surf AI credits`;
  }
} as const;

// 类型导出
export type PaymentConfig = typeof PAYMENT_CONFIG;
export type NetworkType = typeof PAYMENT_CONFIG.NETWORK;
