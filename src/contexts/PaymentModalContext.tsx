/**
 * PaymentModalContext
 *
 * 全局支付弹窗管理 Context
 * Global payment modal management context
 */

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface PaymentModalContextValue {
  isPaymentModalOpen: boolean;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
}

const PaymentModalContext = createContext<PaymentModalContextValue | undefined>(undefined);

export function PaymentModalProvider({ children }: { children: ReactNode }) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const openPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  return (
    <PaymentModalContext.Provider
      value={{
        isPaymentModalOpen,
        openPaymentModal,
        closePaymentModal
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
