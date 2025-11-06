/**
 * UsageIndicator Component
 *
 * 显示用户使用额度的组件
 * Component to display user usage quotas
 */

'use client';

import { useUsage } from '@/hooks/useUsage';
import { useTranslation } from '@/hooks/useTranslation';
import { PAYMENT_CONFIG } from '@/config/payment-config';

interface UsageIndicatorProps {
  onClick?: () => void;
}

export function UsageIndicator({ onClick }: UsageIndicatorProps) {
  const { usage, loading, isConnected } = useUsage();
  const { t } = useTranslation();

  if (!isConnected) {
    return (
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>连接钱包以获得 {PAYMENT_CONFIG.FREE_TIER_LIMIT} 次免费使用</span>
        </div>
      </div>
    );
  }

  if (loading || !usage) {
    return (
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600 dark:text-gray-400">加载中...</span>
        </div>
      </div>
    );
  }

  const color = usage.percentage > 80 ? 'text-red-600 dark:text-red-400' :
               usage.percentage > 50 ? 'text-yellow-600 dark:text-yellow-400' :
               'text-green-600 dark:text-green-400';

  const progressColor = usage.percentage > 80 ? 'bg-red-500' :
                        usage.percentage > 50 ? 'bg-yellow-500' :
                        'bg-green-500';

  return (
    <div
      className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className="space-y-3">
        {/* 免费额度 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">免费额度</span>
            <span className={`text-sm font-semibold ${color}`}>
              {usage.currentUsage}/{usage.freeLimit}
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${progressColor}`}
              style={{ width: `${Math.min(usage.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* 付费次数 */}
        {usage.paidCredits > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">已购买次数</span>
              <span className="text-sm font-semibold text-[#A78BFA]">
                {usage.paidCredits} 次
              </span>
            </div>
          </div>
        )}

        {/* 超额提示 */}
        {usage.exceeded && usage.paidCredits === 0 && (
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <div className="font-medium mb-1">已达到免费额度限制</div>
                <div className="text-purple-600 dark:text-purple-300">
                  下次使用时将支付 <span className="font-semibold">{PAYMENT_CONFIG.PAYMENT_PRICE} USDC</span> 获得 <span className="font-semibold">{PAYMENT_CONFIG.PAYMENT_CREDITS} 次</span>使用
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 接近限额提示 */}
        {!usage.exceeded && usage.currentUsage >= usage.freeLimit - 1 && usage.paidCredits === 0 && (
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>还剩 {usage.freeLimit - usage.currentUsage} 次免费使用</span>
            </div>
          </div>
        )}

        {/* 点击查看详情提示 */}
        {onClick && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>点击查看详情和充值</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
