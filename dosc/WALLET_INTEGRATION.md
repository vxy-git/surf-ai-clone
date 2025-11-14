# BNB钱包登录集成说明

## 🎉 集成完成!

你的项目已成功集成 Web3 钱包登录功能,支持 PC 和移动端浏览器。

## 📋 已完成的工作

### 1. 安装的依赖包
- `@web3modal/wagmi` - Web3Modal 钱包连接UI
- `wagmi` - React Hooks for Ethereum
- `viem` - TypeScript Ethereum 库
- `@tanstack/react-query` - 数据获取和缓存

### 2. 创建的文件
- ✅ `src/config/wallet.ts` - 钱包配置文件
- ✅ `src/contexts/WalletContext.tsx` - 钱包上下文Provider
- ✅ `src/components/WalletButton.tsx` - 钱包连接按钮组件
- ✅ `.env.local.example` - 环境变量示例文件

### 3. 修改的文件
- ✅ `src/app/ClientBody.tsx` - 添加 WalletProvider
- ✅ `src/components/MainContent.tsx` - 替换登录按钮为钱包按钮
- ✅ `src/i18n/translations.ts` - 添加钱包相关的多语言翻译

## 🚀 启动步骤

### 第一步: 获取 WalletConnect Project ID

1. 访问 [WalletConnect Cloud](https://cloud.walletconnect.com)
2. 使用 GitHub 或 Email 注册/登录
3. 点击 "Create New Project" 创建新项目
4. 输入项目名称 (例如: Aqora AI)
5. 复制生成的 **Project ID**

### 第二步: 配置环境变量

1. 复制示例文件:
   ```bash
   cd /Users/wming/Documents/workBox/OliverSmith/AiAgent/surf-ai-clone
   cp .env.local.example .env.local
   ```

2. 编辑 `.env.local` 文件,填入你的 Project ID:
   ```bash
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=你的项目ID
   ```

### 第三步: 启动项目

```bash
pnpm dev
```

项目将在 `http://localhost:3000` 启动

## ✨ 功能特性

### 已实现的功能
✅ **多钱包支持**
  - MetaMask (浏览器插件)
  - Trust Wallet
  - Binance Wallet
  - 以及更多通过 WalletConnect 协议的钱包

✅ **网络支持**
  - BSC 主网 (Binance Smart Chain)
  - BSC 测试网

✅ **用户界面**
  - 未连接: 显示 "连接钱包" 按钮
  - 已连接: 显示简化的钱包地址
  - 下拉菜单显示完整地址和 BNB 余额
  - 切换网络和断开连接选项

✅ **响应式设计**
  - PC 端: 完整显示地址和功能
  - 移动端: 适配小屏幕显示

✅ **多语言支持**
  - 🇨🇳 简体中文
  - 🇺🇸 English
  - 🇯🇵 日本語
  - 🇰🇷 한국어

✅ **主题支持**
  - 浅色模式
  - 深色模式
  - 跟随系统

## 🎯 使用方式

### 对于用户
1. 点击右上角 "连接钱包" 按钮
2. 选择你想使用的钱包 (MetaMask、Trust Wallet 等)
3. 在钱包中确认连接
4. 连接成功后,会显示你的钱包地址
5. 点击地址可以查看余额和更多选项

### 对于开发者

#### 在其他组件中使用钱包信息

```typescript
import { useAccount, useBalance } from 'wagmi'

function YourComponent() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })

  if (!isConnected) {
    return <div>请连接钱包</div>
  }

  return (
    <div>
      <p>地址: {address}</p>
      <p>余额: {balance?.formatted} {balance?.symbol}</p>
    </div>
  )
}
```

#### 调用智能合约

```typescript
import { useWriteContract } from 'wagmi'

function YourComponent() {
  const { writeContract } = useWriteContract()

  const handleTransaction = async () => {
    writeContract({
      address: '0x...', // 合约地址
      abi: [...], // 合约 ABI
      functionName: 'transfer',
      args: ['0x...', 1000000000000000000n], // 参数
    })
  }

  return <button onClick={handleTransaction}>发送交易</button>
}
```

## 🔧 自定义配置

### 修改支持的网络

编辑 `src/config/wallet.ts`:

```typescript
import { bsc, bscTestnet, mainnet, polygon } from 'wagmi/chains'

export const chains = [bsc, polygon, mainnet] as const
```

### 修改主题颜色

编辑 `src/contexts/WalletContext.tsx`:

```typescript
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  themeMode: 'dark', // 'light' | 'dark'
  themeVariables: {
    '--w3m-accent': '#de5586', // 你的品牌色
    '--w3m-border-radius-master': '4px',
  }
})
```

## 📱 测试建议

### PC 端测试
1. 安装 MetaMask 浏览器插件
2. 创建或导入钱包
3. 测试连接、断开、切换网络等功能

### 移动端测试
1. 使用 Trust Wallet 或 MetaMask 移动应用
2. 在应用内浏览器中打开你的网站
3. 或使用 WalletConnect 扫码连接

## ⚠️ 注意事项

1. **Project ID 必须配置**: 不配置将无法使用 WalletConnect 功能
2. **HTTPS 要求**: 生产环境必须使用 HTTPS
3. **网络配置**: 确保用户钱包切换到 BSC 网络
4. **测试网络**: 开发时建议先使用 BSC 测试网

## 📚 相关文档

- [Web3Modal 文档](https://docs.walletconnect.com/web3modal/react/about)
- [Wagmi 文档](https://wagmi.sh)
- [Viem 文档](https://viem.sh)
- [BSC 文档](https://docs.bnbchain.org)

## 🐛 常见问题

### Q: 钱包连接后刷新页面会断开吗?
A: 不会,钱包连接状态会自动保存和恢复。

### Q: 支持哪些浏览器?
A: Chrome, Firefox, Safari, Edge 等主流浏览器都支持。

### Q: 可以只支持 MetaMask 吗?
A: 可以,但建议保留多钱包支持,提供更好的用户体验。

### Q: 如何在生产环境部署?
A:
1. 配置正确的 Project ID
2. 确保使用 HTTPS
3. 在 WalletConnect Cloud 中添加你的生产域名

## 💡 下一步建议

1. **添加交易功能**: 使用 `useWriteContract` 实现代币转账等功能
2. **添加签名功能**: 使用 `useSignMessage` 实现消息签名验证
3. **集成后端验证**: 验证钱包所有权,实现基于钱包的身份认证
4. **添加交易历史**: 使用 Etherscan API 显示用户的交易记录

---

**集成完成时间**: 2025-10-22
**技术支持**: 如有问题,请参考上述文档或联系开发团队
