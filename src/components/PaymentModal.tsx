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
import { usePaymentModal } from '@/contexts/PaymentModalContext';
import { PAYMENT_CONFIG } from '@/config/payment-config';
import { USDC_ABI } from '@/lib/usdc-abi';
import { verifyPaymentAndAddCredits } from '@/lib/usage-tracker';
import { X, CheckCircle, Loader2, Clock, AlertCircle, Info, Check } from '@/components/icons';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void | Promise<void>;
}

type PaymentStatus = 'idle' | 'pending' | 'verifying' | 'success' | 'error';

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
  const { onPaymentSuccessCallback, setPendingMessage, setOnPaymentSuccessCallback } = usePaymentModal();

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
    // 验证支付并增加付费次数
    if (address && hash) {
      (async () => {
        try {
          // 设置为验证中状态
          setPaymentStatus('verifying');

          const result = await verifyPaymentAndAddCredits(
            address,
            hash,
            PAYMENT_CONFIG.NETWORK
          );

          if (result.success) {
            // 等待外部组件刷新使用数据
            // 这确保了在显示成功状态前,额度已经更新
            await onPaymentSuccess?.();

            // 触发自动重试回调(如果有待发送的消息)
            if (onPaymentSuccessCallback) {
              console.log('[PaymentModal] Triggering auto-retry callback');
              onPaymentSuccessCallback();
              // 清除回调和待发送消息
              setOnPaymentSuccessCallback(null);
              setPendingMessage(null);
            }

            setPaymentStatus('success');

            // 3秒后自动关闭弹窗
            setTimeout(() => {
              onClose();
              setPaymentStatus('idle');
            }, 3000);
          } else {
            setPaymentStatus('error');
            setErrorMessage(result.error || t('paymentVerifyFailed'));
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          setPaymentStatus('error');
          setErrorMessage(t('paymentVerifyError'));
        }
      })();
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

  // 禁止在验证过程中关闭弹窗
  const handleClose = () => {
    if (paymentStatus === 'verifying' || paymentStatus === 'pending' || isConfirming) {
      // 验证中不允许关闭
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xl backdrop-saturate-150"
        onClick={handleClose}
      />

      {/* 弹窗内容 */}
      <div className="relative backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-white/30 dark:border-gray-700/50 shadow-[0_24px_64px_rgba(0,0,0,0.2)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)] ring-1 ring-white/20 max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-gray-700/50">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('purchaseCredits')}
          </h2>
          <button
            onClick={handleClose}
            disabled={paymentStatus === 'verifying' || paymentStatus === 'pending' || isConfirming}
            className={`p-2 rounded-lg transition-colors ${
              paymentStatus === 'verifying' || paymentStatus === 'pending' || isConfirming
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
              {/* 购买卡片 */}
              <div className="backdrop-blur-lg bg-gradient-to-br from-sky-100/60 to-cyan-100/60 dark:from-sky-900/40 dark:to-cyan-900/40 rounded-xl p-6 border-2 border-[#19c8ff]/50 shadow-[0_8px_32px_rgba(25,200,255,0.2)]">
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
                    <div className="text-3xl font-bold text-[#19c8ff]">
                      {PAYMENT_CONFIG.PAYMENT_PRICE}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      USDC
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#19c8ff] text-white flex items-center justify-center font-bold">
                      {PAYMENT_CONFIG.PAYMENT_CREDITS}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t('creditsIncluded', { count: PAYMENT_CONFIG.PAYMENT_CREDITS })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t('fullAccess')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t('noExpiration')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={paymentStatus === 'pending' || isConfirming || paymentStatus === 'verifying'}
                  className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    paymentStatus === 'pending' || isConfirming || paymentStatus === 'verifying'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : paymentStatus === 'success'
                      ? 'bg-green-500 hover:bg-green-600'
                      : paymentStatus === 'error'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-[#19c8ff] hover:bg-[#9270F0]'
                  } text-white`}
                >
                  {paymentStatus === 'pending' || isConfirming ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>{isConfirming ? '确认中...' : '支付中...'}</span>
                    </>
                  ) : paymentStatus === 'verifying' ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>验证支付中，请稍候...</span>
                    </>
                  ) : paymentStatus === 'success' ? (
                    <>
                      <CheckCircle size={20} />
                      <span>支付成功！</span>
                    </>
                  ) : (
                    <>
                      <Clock size={20} />
                      {t('buyNow')}
                    </>
                  )}
                </button>
              </div>

            {/* 验证中提示 */}
            {paymentStatus === 'verifying' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <Loader2 size={20} className="text-yellow-600 animate-spin shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    <div className="font-medium mb-1">正在验证支付...</div>
                    <div>交易已确认,正在验证并更新您的额度,预计需要 1-3 秒。请勿关闭此窗口。</div>
                  </div>
                </div>
              </div>
            )}

            {/* 错误消息 */}
            {paymentStatus === 'error' && errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="shrink-0 mt-0.5 text-red-600 dark:text-red-400"
                  />
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
                <Info
                  size={20}
                  className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400"
                />
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
