/**
 * 区块链交易验证工具
 * Blockchain Transaction Verifier
 *
 * 用于验证 Base 链上的 USDC 支付交易真实性
 */

import { createPublicClient, http, parseUnits } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { PAYMENT_CONFIG } from '@/config/payment-config';

// USDC 合约 ABI (仅包含 Transfer 事件)
const USDC_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' }
    ],
    name: 'Transfer',
    type: 'event'
  }
] as const;

// 网络配置
const CHAINS = {
  'base': base,
  'base-sepolia': baseSepolia
};

// RPC URLs (可通过环境变量配置)
const RPC_URLS = {
  'base': process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  'base-sepolia': process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
};

/**
 * 验证交易结果
 */
export interface VerificationResult {
  valid: boolean;
  error?: string;
  details?: {
    from: string;
    to: string;
    amount: string;
    blockNumber: bigint;
    timestamp: number;
  };
}

/**
 * 验证 USDC 支付交易
 * @param txHash 交易哈希
 * @param network 网络类型 ("base" | "base-sepolia")
 * @param expectedSender 预期发送者钱包地址
 * @returns 验证结果
 */
export async function verifyUSDCPayment(
  txHash: `0x${string}`,
  network: 'base' | 'base-sepolia',
  expectedSender: string
): Promise<VerificationResult> {
  try {
    // 创建公共客户端
    const client = createPublicClient({
      chain: CHAINS[network],
      transport: http(RPC_URLS[network])
    });

    // 获取交易收据
    const receipt = await client.getTransactionReceipt({
      hash: txHash
    });

    // Check if transaction is successful
    if (receipt.status !== 'success') {
      return {
        valid: false,
        error: 'Transaction failed or was reverted'
      };
    }

    // 获取 USDC 合约地址
    const usdcContract = PAYMENT_CONFIG.USDC_CONTRACT[network].toLowerCase();

    // 查找 Transfer 事件
    const transferLog = receipt.logs.find(log =>
      log.address.toLowerCase() === usdcContract
    );

    if (!transferLog) {
      return {
        valid: false,
        error: 'USDC transfer event not found'
      };
    }

    // 解析 Transfer 事件
    // topics[0] = event signature
    // topics[1] = from (indexed)
    // topics[2] = to (indexed)
    // data = value (not indexed)
    const from = `0x${transferLog.topics[1]?.slice(26)}`.toLowerCase(); // 移除前导零
    const to = `0x${transferLog.topics[2]?.slice(26)}`.toLowerCase();
    const value = BigInt(transferLog.data);

    // Verify sender
    if (from !== expectedSender.toLowerCase()) {
      return {
        valid: false,
        error: `Sender address mismatch: expected ${expectedSender}, got ${from}`
      };
    }

    // Verify receiver
    const receiverAddress = PAYMENT_CONFIG.RECEIVER_ADDRESS?.toLowerCase();
    if (!receiverAddress) {
      return {
        valid: false,
        error: 'Receiver address not configured (NEXT_PUBLIC_RECEIVER_ADDRESS)'
      };
    }

    if (to !== receiverAddress) {
      return {
        valid: false,
        error: `Receiver address mismatch: expected ${receiverAddress}, got ${to}`
      };
    }

    // 验证金额 (USDC 是 6 位小数)
    // $0.01 USDC = 10000 (0.01 * 10^6)
    const expectedAmount = parseUnits('0.01', 6); // 10000
    if (value < expectedAmount) {
      return {
        valid: false,
        error: `Insufficient amount: required $0.01 USDC, got ${formatUSDC(value)} USDC`
      };
    }

    // 获取区块信息以获取时间戳
    const block = await client.getBlock({
      blockNumber: receipt.blockNumber
    });

    // 验证成功
    return {
      valid: true,
      details: {
        from,
        to,
        amount: formatUSDC(value),
        blockNumber: receipt.blockNumber,
        timestamp: Number(block.timestamp)
      }
    };

  } catch (error) {
    console.error('Blockchain verification error:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during verification'
    };
  }
}

/**
 * 格式化 USDC 金额 (6 位小数)
 */
function formatUSDC(value: bigint): string {
  const amount = Number(value) / 1e6;
  return amount.toFixed(6);
}

/**
 * 快速验证交易哈希格式
 */
export function isValidTxHash(txHash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(txHash);
}

/**
 * 快速验证钱包地址格式
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
