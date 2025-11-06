"use client";

import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { getWalletConfig, projectId } from '@/config/wallet'
import { ReactNode, useEffect, useState, createContext, useContext } from 'react'
import type { Config } from 'wagmi'

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
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    // 在客户端挂载后创建配置并初始化 Web3Modal
    try {
      const walletConfig = getWalletConfig()
      setConfig(walletConfig)

      createWeb3Modal({
        wagmiConfig: walletConfig,
        projectId,
        enableAnalytics: true,
        enableOnramp: false,
        themeMode: 'light',
        themeVariables: {
          '--w3m-accent': '#A78BFA',
        }
      })
      setInitialized(true)
    } catch (error) {
      // 忽略重复创建的错误
      console.warn('Web3Modal initialization error:', error)
      setInitialized(true)
    }
  }, [])

  // 在配置创建前返回 null，避免在 WagmiProvider 外渲染子组件
  if (!config) {
    return null
  }

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
