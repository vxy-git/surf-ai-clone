import { defaultWagmiConfig } from '@web3modal/wagmi'
import { bsc, bscTestnet, base, baseSepolia } from 'wagmi/chains'
import type { Config } from 'wagmi'

// 1. 从 WalletConnect Cloud 获取项目ID (https://cloud.walletconnect.com)
// 这是一个示例ID,您需要替换为自己的项目ID
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE'

// 2. 定义项目元数据
const metadata = {
  name: 'Surf AI',
  description: 'Crypto Data Hub & AI Assistant',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://surf.ai',
  icons: ['https://ext.same-assets.com/501684899/3670575781.svg']
}

// 3. 配置支持的区块链网络
export const chains = [bsc, bscTestnet, base, baseSepolia] as const

// 4. 创建 Wagmi 配置 - 懒加载,只在客户端调用
let cachedConfig: Config | null = null

export function getWalletConfig(): Config {
  if (cachedConfig) {
    return cachedConfig
  }

  // 只在浏览器环境中创建配置
  if (typeof window === 'undefined') {
    throw new Error('Wallet config can only be created in browser environment')
  }

  cachedConfig = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
    enableWalletConnect: true,
    enableInjected: true,
    enableEIP6963: true,
    enableCoinbase: true,
  })

  return cachedConfig
}
