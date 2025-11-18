import { defaultWagmiConfig } from '@web3modal/wagmi'
import { bsc, bscTestnet, base, baseSepolia } from 'wagmi/chains'
import type { Config } from 'wagmi'

// 1. 从 WalletConnect Cloud 获取项目ID (https://cloud.walletconnect.com)
// 这是一个示例ID,您需要替换为自己的项目ID
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE'

const defaultAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aqora.ai'

// 2. 定义项目元数据
const metadata = {
  name: 'Aqora AI',
  description: 'Crypto Data Hub & AI Assistant',
  url: defaultAppUrl,
  icons: ['https://ext.same-assets.com/501684899/3670575781.svg']
}

// 3. 配置支持的区块链网络
export const chains = [base] as const

// 4. 创建 Wagmi 配置 - 懒加载,可在服务端和客户端复用
let cachedConfig: Config | null = null

export function getWalletConfig(): Config {
  if (cachedConfig) {
    return cachedConfig
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
