/**
 * UsageContext
 *
 * 全局使用额度管理 Context
 * Global usage quota management context
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { getUsageData, consumeUsage, canUseAPI, getUsageStats } from '@/lib/usage-tracker';
import { PAYMENT_CONFIG } from '@/config/payment-config';
import type { UsageInfo } from '@/types/usage';

interface UsageContextValue {
  usage: UsageInfo | null;
  loading: boolean;
  isConnected: boolean;
  recordUsage: () => Promise<boolean>;
  checkCanUse: () => Promise<boolean>;
  getStats: () => Promise<ReturnType<typeof getUsageStats> | null>;
  refresh: () => Promise<void>;
}

const UsageContext = createContext<UsageContextValue | undefined>(undefined);

export function UsageProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载使用数据
  const loadUsage = useCallback(async () => {
    if (!isConnected || !address) {
      setUsage(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getUsageData(address);
      const check = await canUseAPI(address);

      const freeUsed = data.freeUsage;
      const freeRemaining = Math.max(0, PAYMENT_CONFIG.FREE_TIER_LIMIT - freeUsed);
      const paidCredits = data.paidCredits;

      setUsage({
        currentUsage: freeUsed,
        freeLimit: PAYMENT_CONFIG.FREE_TIER_LIMIT,
        remaining: freeRemaining + paidCredits,
        exceeded: !check.canUse,
        isPaid: paidCredits > 0,
        paidCredits: paidCredits,
        percentage: (freeUsed / PAYMENT_CONFIG.FREE_TIER_LIMIT) * 100
      });
    } catch (error) {
      console.error('Failed to load usage:', error);
    } finally {
      setLoading(false);
    }
  }, [address, isConnected]);

  // 初始化及地址变化时重新加载
  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  // 记录使用
  const recordUsage = useCallback(async () => {
    if (!address) return false;

    const success = await consumeUsage(address);
    if (success) {
      await loadUsage(); // 重新加载数据
    }
    return success;
  }, [address, loadUsage]);

  // 检查是否可以使用
  const checkCanUse = useCallback(async (): Promise<boolean> => {
    if (!address) return false;
    const result = await canUseAPI(address);
    return result.canUse;
  }, [address]);

  // 获取详细统计
  const getStats = useCallback(async () => {
    if (!address) return null;
    return await getUsageStats(address);
  }, [address]);

  // 刷新数据
  const refresh = useCallback(async () => {
    await loadUsage();
  }, [loadUsage]);

  const value: UsageContextValue = {
    usage,
    loading,
    isConnected,
    recordUsage,
    checkCanUse,
    getStats,
    refresh
  };

  return (
    <UsageContext.Provider value={value}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error('useUsage must be used within a UsageProvider');
  }
  return context;
}
