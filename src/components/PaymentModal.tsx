/**
 * PaymentModal Component
 *
 * 充值购买弹窗组件，展示支付功能
 * Payment modal component for displaying payment functionality
 */

'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseUnits } from 'viem';
import { baseSepolia } from 'wagmi/chains';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeb3ModalInitialized } from '@/contexts/WalletContext';
import { PAYMENT_CONFIG } from '@/config/payment-config';
import { USDC_ABI } from '@/lib/usdc-abi';
import { addPaidCredits } from '@/lib/usage-tracker';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

type PaymentStatus = 'idle' | 'pending' | 'success' | 'error';

export function PaymentModal({ isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
  const { initialized } = useWeb3ModalInitialized();

  // 只有在初始化完成且弹窗打开时才渲染内部组件
  if (!initialized || !isOpen) return null;

  return <PaymentModalInner isOpen={isOpen} onClose={onClose} onPaymentSuccess={onPaymentSuccess} />;
}

function PaymentModalInner({ isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
  const { t } = useTranslation();
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 写入合约（转账）
  const { writeContract, data: hash } = useWriteContract();

  // 等待交易确认
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // 当交易确认成功时
  if (isConfirmed && paymentStatus === 'pending') {
    // 增加付费次数
    if (address && hash) {
      addPaidCredits(address, hash, PAYMENT_CONFIG.PAYMENT_CREDITS);
      setPaymentStatus('success');

      // 通知外部组件刷新使用数据
      onPaymentSuccess?.();

      // 3秒后自动关闭弹窗
      setTimeout(() => {
        onClose();
        setPaymentStatus('idle');
      }, 3000);
    }
  }

  const handlePayment = async () => {
    try {
      // 1. 检查钱包连接
      if (!address) {
        setErrorMessage('请先连接钱包');
        setPaymentStatus('error');
        return;
      }

      // 2. 检查网络
      const targetChainId = PAYMENT_CONFIG.NETWORK === 'base-sepolia'
        ? baseSepolia.id
        : 8453; // Base 主网

      if (chain?.id !== targetChainId) {
        try {
          await switchChain({ chainId: targetChainId });
        } catch (error) {
          setErrorMessage('请切换到正确的网络');
          setPaymentStatus('error');
          return;
        }
      }

      // 3. 检查收款地址
      if (!PAYMENT_CONFIG.RECEIVER_ADDRESS) {
        setErrorMessage('收款地址未配置，请联系管理员');
        setPaymentStatus('error');
        return;
      }

      // 4. 执行转账
      setPaymentStatus('pending');
      setErrorMessage('');

      // USDC 是 6 位小数
      const amount = parseUnits('0.01', 6);
      const usdcContractAddress = PAYMENT_CONFIG.USDC_CONTRACT[PAYMENT_CONFIG.NETWORK];

      await writeContract({
        address: usdcContractAddress as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [PAYMENT_CONFIG.RECEIVER_ADDRESS, amount],
      });

    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error instanceof Error ? error.message : '支付失败，请重试');
      setPaymentStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('purchaseCredits')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
              {/* 购买卡片 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-[#A78BFA]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {t('purchasePackage')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('purchasePackageDesc')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#A78BFA]">
                      {PAYMENT_CONFIG.PAYMENT_PRICE}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      USDC
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#A78BFA] text-white flex items-center justify-center font-bold">
                      {PAYMENT_CONFIG.PAYMENT_CREDITS}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t('creditsIncluded', { count: PAYMENT_CONFIG.PAYMENT_CREDITS })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                      ✓
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t('fullAccess')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                      ✓
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t('noExpiration')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={paymentStatus === 'pending' || isConfirming}
                  className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    paymentStatus === 'pending' || isConfirming
                      ? 'bg-gray-400 cursor-not-allowed'
                      : paymentStatus === 'success'
                      ? 'bg-green-500 hover:bg-green-600'
                      : paymentStatus === 'error'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-[#A78BFA] hover:bg-[#9270F0]'
                  } text-white`}
                >
                  {paymentStatus === 'pending' || isConfirming ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isConfirming ? '确认中...' : '支付中...'}</span>
                    </>
                  ) : paymentStatus === 'success' ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <span>支付成功！</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {t('buyNow')}
                    </>
                  )}
                </button>
              </div>

            {/* 错误消息 */}
            {paymentStatus === 'error' && errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="shrink-0 mt-0.5 text-red-600 dark:text-red-400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <div className="font-medium mb-1">支付失败</div>
                    <div>{errorMessage}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 网络信息 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <div className="font-medium mb-1">{t('paymentNetwork')}</div>
                  <div>
                    {t('networkInfo', {
                      network: PAYMENT_CONFIG.NETWORK === 'base-sepolia' ? 'Base Sepolia (测试网)' : 'Base (主网)'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
