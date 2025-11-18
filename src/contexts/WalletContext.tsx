"use client";

import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { getWalletConfig, projectId } from '@/config/wallet'
import { ReactNode, useEffect, useState, createContext, useContext } from 'react'

// 创建 QueryClient 实例
const queryClient = new QueryClient()

// 创建初始化状态上下文
const Web3ModalContext = createContext<{ initialized: boolean }>({ initialized: false })

// 导出 hook 供子组件使用
export const useWeb3ModalInitialized = () => useContext(Web3ModalContext)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [initialized, setInitialized] = useState(false)
  const config = getWalletConfig()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    // 在客户端挂载后创建配置并初始化 Web3Modal
    try {
      createWeb3Modal({
        wagmiConfig: config,
        projectId,
        enableAnalytics: false, // 禁用 Coinbase Analytics 避免 cca-lite.coinbase.com 连接错误
        enableOnramp: false,
        themeMode: 'light',
        themeVariables: {
          '--w3m-accent': '#19c8ff',
        }
      })
      setInitialized(true)
    } catch (error) {
      // 忽略重复创建的错误
      console.warn('Web3Modal initialization error:', error)
      setInitialized(true)
    }
  }, [config])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3ModalContext.Provider value={{ initialized }}>
          {children}
        </Web3ModalContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
