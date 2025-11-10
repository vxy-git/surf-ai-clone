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
import { Clock, AlertCircle, AlertTriangle, Info, Loader2 } from '@/components/icons';

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
          <Clock size={16} />
          <span>{t("connectWalletForFree", { count: PAYMENT_CONFIG.FREE_TIER_LIMIT })}</span>
        </div>
      </div>
    );
  }

  if (loading || !usage) {
    return (
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Loader2 size={16} className="text-[#A78BFA] animate-spin" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{t("loading")}</span>
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
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("freeTier")}</span>
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
              <span className="text-sm text-gray-600 dark:text-gray-400">{t("purchasedCredits")}</span>
              <span className="text-sm font-semibold text-[#A78BFA]">
                {usage.paidCredits}
              </span>
            </div>
          </div>
        )}

        {/* 超额提示 */}
        {usage.exceeded && usage.paidCredits === 0 && (
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <div>
                <div className="font-medium mb-1">{t("limitReached")}</div>
                <div className="text-purple-600 dark:text-purple-300">
                  {t("nextUsageWillCost", { price: PAYMENT_CONFIG.PAYMENT_PRICE, symbol: "USDC" })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 接近限额提示 */}
        {!usage.exceeded && usage.currentUsage >= usage.freeLimit - 1 && usage.paidCredits === 0 && (
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} />
              <span>{t("remainingFreeUses", { count: usage.freeLimit - usage.currentUsage })}</span>
            </div>
          </div>
        )}

        {/* 点击查看详情提示 */}
        {onClick && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Info size={12} />
              <span>{t("clickForDetails")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
