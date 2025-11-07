/**
 * PaymentModalContext
 *
 * 全局支付弹窗管理 Context
 * Global payment modal management context
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface PendingMessage {
  content: string;
  mode: 'ask' | 'research';
}

interface PaymentModalContextValue {
  isPaymentModalOpen: boolean;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  pendingMessage: PendingMessage | null;
  setPendingMessage: (message: PendingMessage | null) => void;
  onPaymentSuccessCallback: (() => void) | null;
  setOnPaymentSuccessCallback: (callback: (() => void) | null) => void;
}

const PaymentModalContext = createContext<PaymentModalContextValue | undefined>(undefined);

export function PaymentModalProvider({ children }: { children: ReactNode }) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<PendingMessage | null>(null);
  const [onPaymentSuccessCallback, setOnPaymentSuccessCallback] = useState<(() => void) | null>(null);

  const openPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    // 关闭弹窗时清除待处理消息和回调
    setPendingMessage(null);
    setOnPaymentSuccessCallback(null);
  };

  return (
    <PaymentModalContext.Provider
      value={{
        isPaymentModalOpen,
        openPaymentModal,
        closePaymentModal,
        pendingMessage,
        setPendingMessage,
        onPaymentSuccessCallback,
        setOnPaymentSuccessCallback
      }}
    >
      {children}
    </PaymentModalContext.Provider>
  );
}

export function usePaymentModal() {
  const context = useContext(PaymentModalContext);
  if (context === undefined) {
    throw new Error('usePaymentModal must be used within a PaymentModalProvider');
  }
  return context;
}
