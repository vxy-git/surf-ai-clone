# 🔌 API 集成指南

## 概述

本项目已成功集成 **CometAPI** 和多个真实数据源,实现了完整的 AskSurf.ai AI Agent 功能。

## 📊 已集成的 API

### 1. CometAPI (AI 引擎) ✅

**作用**: 提供 AI 大语言模型推理能力,替代 OpenAI

**特点**:
- ✅ 兼容 OpenAI API 格式
- ✅ 支持多种 AI 模型(GPT、Claude等)
- ✅ 成本比 OpenAI 低 20%
- ✅ 统一的 API 接口

**配置方法**:
```bash
# 在 .env 文件中设置
OPENAI_API_KEY=your-cometapi-key-here
OPENAI_BASE_URL=https://api.cometapi.com/v1  # 取消注释此行
```

**获取 API Key**:
1. 访问 https://api.cometapi.com
2. 注册账号并充值
3. 复制 API Key 到 .env 文件

---

### 2. CoinGecko API (市场数据) ✅

**作用**: 提供加密货币实时市场数据

**已实现功能**:
- ✅ 实时价格查询
- ✅ 24小时价格变化
- ✅ 交易量和市值
- ✅ 历史价格数据(30天)
- ✅ 技术指标计算(RSI, MACD, MA, Bollinger Bands)
- ✅ 深度项目研究数据

**免费版限制**: 50次/分钟

**配置方法**:
```bash
# 免费版无需配置,留空即可
COINGECKO_API_KEY=

# 专业版 (如需更高速率)
COINGECKO_API_KEY=your-coingecko-pro-key
```

**获取专业版 API Key**:
- 访问 https://www.coingecko.com/en/api/pricing

---

### 3. Etherscan API (链上数据) ⏳ 待集成

**作用**: 以太坊链上数据追踪

**计划功能**:
- 钱包余额查询
- 交易历史
- 巨鲸活动监控
- Gas 费用追踪

**配置方法**:
```bash
ETHERSCAN_API_KEY=your-etherscan-api-key
```

**获取 API Key**:
- 访问 https://etherscan.io/myapikey

---

### 4. 社交情绪分析 ⏳ 待集成

**可选方案**:

#### 方案 A: LunarCrush API
- 专业的加密社交数据分析平台
- 提供情绪得分、KOL追踪、趋势分析
- 配置: `LUNARCRUSH_API_KEY=your-key`
- 获取: https://lunarcrush.com/developers/api

#### 方案 B: Twitter API v2
- 直接分析 Twitter 数据
- 需要开发者账号
- 配置: `TWITTER_BEARER_TOKEN=your-token`
- 获取: https://developer.twitter.com

---

## 🎯 AI Agent 工具功能说明

### 工具 1: getMarketData (市场数据) ✅ 已集成真实API

**调用示例**:
```typescript
symbols: ["BTC", "ETH", "SOL"]
```

**返回数据**:
- 当前价格
- 24小时涨跌幅
- 24小时交易量
- 市值

**数据源**: CoinGecko API

---

### 工具 2: technicalAnalysis (技术分析) ✅ 已集成真实API + 指标计算

**调用示例**:
```typescript
symbol: "BTC"
interval: "1d"
```

**返回数据**:
- RSI (相对强弱指数) - 自动计算
- MACD (移动平均收敛散度) - 自动计算
- MA50/MA200 (移动平均线) - 自动计算
- Bollinger Bands (布林带) - 自动计算
- 支撑位和阻力位
- 交易信号推荐

**数据源**: CoinGecko API + 本地指标计算

---

### 工具 3: deepSearch (深度研究) ✅ 已集成真实API

**调用示例**:
```typescript
projectName: "Bitcoin"
aspects: ["all"]
```

**返回数据**:
- 项目概述和描述
- 市场数据(价格、市值、排名)
- 代币经济学(总供应量、流通量)
- 社区数据(Twitter、Reddit、Telegram粉丝数)
- 开发活跃度(GitHub commits、stars、forks)
- 情绪分析(社区评分、投票)
- 风险因素分析

**数据源**: CoinGecko Detailed Coin API

---

### 工具 4: onchainTracker (链上追踪) ⏳ 使用模拟数据

**当前状态**: 模拟数据

**计划集成**: Etherscan API

**功能**:
- 活跃地址统计
- 交易量追踪
- 巨鲸钱包监控
- 交易所流入流出

---

### 工具 5: socialSentiment (社交情绪) ⏳ 使用模拟数据

**当前状态**: 模拟数据

**计划集成**: LunarCrush API 或 Twitter API

**功能**:
- 社交媒体情绪得分
- 看涨/看跌比例
- KOL 意见追踪
- 热门话题标签

---

## 🚀 快速开始

### 1. 基础配置(仅使用免费API)

```bash
# .env 文件
OPENAI_API_KEY=your-openai-or-cometapi-key
# OPENAI_BASE_URL=https://api.cometapi.com/v1  # 可选:使用CometAPI

COINGECKO_API_KEY=  # 免费版留空
```

**功能**:
- ✅ AI 对话
- ✅ 市场数据查询
- ✅ 技术分析
- ✅ 深度项目研究
- ⚠️ 链上追踪(模拟数据)
- ⚠️ 社交情绪(模拟数据)

### 2. 完整配置(所有真实API)

```bash
# AI引擎
OPENAI_API_KEY=your-cometapi-key
OPENAI_BASE_URL=https://api.cometapi.com/v1

# 市场数据
COINGECKO_API_KEY=your-coingecko-pro-key

# 链上数据
ETHERSCAN_API_KEY=your-etherscan-key

# 社交数据
LUNARCRUSH_API_KEY=your-lunarcrush-key
```

**功能**: 全部真实数据 ✅

---

## 📈 API 成本估算

### CometAPI
- 按使用量计费
- 比 OpenAI 便宜约 20%
- 支持多种模型选择

### CoinGecko
- **免费版**: 50次/分钟,完全免费
- **专业版**: $129/月起,500次/分钟

### Etherscan
- **免费版**: 5次/秒,完全免费
- **标准版**: $99/月,API 限制提升

### LunarCrush
- **免费版**: 1000次/月
- **专业版**: $99/月起,无限请求

**推荐配置(成本最优)**:
- CometAPI (AI) - 按需付费
- CoinGecko 免费版
- Etherscan 免费版
- 暂不集成社交API(或使用免费版)

**月成本**: CometAPI 使用费 + $0 (其他全用免费版)

---

## 🔧 技术实现细节

### API 错误处理

所有 AI 工具都实现了降级策略:

```typescript
try {
  // 尝试调用真实API
  const data = await fetch(apiUrl);
  return realData;
} catch (error) {
  console.error('API Error:', error);
  // 降级到模拟数据
  return mockData;
}
```

**优点**:
- 即使 API 失败,系统仍可运行
- 开发时无需 API key 也能测试
- 用户体验不中断

### 技术指标计算

实现了以下技术指标的本地计算:

1. **RSI (相对强弱指数)**
   - 基于14期价格变化
   - 判断超买超卖

2. **SMA (简单移动平均)**
   - MA50, MA200
   - 判断长期趋势

3. **MACD (移动平均收敛散度)**
   - EMA12 - EMA26
   - 判断买卖信号

4. **Bollinger Bands (布林带)**
   - SMA ± 2倍标准差
   - 判断价格区间

### 符号映射

支持的加密货币:

```typescript
BTC → bitcoin
ETH → ethereum
SOL → solana
BNB → binancecoin
XRP → ripple
ADA → cardano
// ...更多
```

其他币种会自动转换为小写作为 ID

---

## 🎨 使用示例

### 示例 1: 快速问答

**用户**: "What's the current price of Bitcoin?"

**AI流程**:
1. 调用 `getMarketDataTool(symbols: ["BTC"])`
2. 从 CoinGecko 获取实时价格
3. 返回结构化回复

**回复**:
```
Bitcoin (BTC) Current Data:
💰 Price: $65,432.10
📈 24h Change: +3.25%
📊 Volume: $28,500,000,000
🏆 Market Cap: $1,280,000,000,000
```

---

### 示例 2: 技术分析

**用户**: "Analyze ETH technically"

**AI流程**:
1. 调用 `technicalAnalysisTool(symbol: "ETH")`
2. 获取30天历史价格
3. 计算 RSI, MACD, MA, Bollinger Bands
4. 生成交易信号

**回复**:
```
Ethereum Technical Analysis 📊

Current Price: $3,250.45 (+2.1% 24h)

Technical Indicators:
• RSI: 55.32 (Neutral)
• MACD: Bullish Signal
• MA50: $3,100 ✅ Above
• MA200: $2,850 ✅ Above

Bollinger Bands:
• Upper: $3,450
• Middle: $3,250
• Lower: $3,050
• Position: Within bands

Signals:
📊 Overall: Buy
💪 Strength: Moderate
📍 Support: $3,050, $2,850
🎯 Resistance: $3,450, $3,575

Recommendation: Moderate Buy
```

---

### 示例 3: 深度研究

**用户**: "Research Solana comprehensively"

**AI流程**:
1. 调用 `deepSearchTool(projectName: "Solana", aspects: ["all"])`
2. 获取完整项目数据
3. 调用其他工具补充分析
4. 生成综合报告

**回复**: (完整的研究报告,包含所有数据)

---

## 🐛 故障排除

### 问题 1: "CoinGecko API error: 429"

**原因**: 超出免费版速率限制

**解决方案**:
1. 使用专业版 API Key
2. 添加请求缓存(计划实现)
3. 降低请求频率

### 问题 2: "Using fallback data"

**原因**: API 调用失败,使用模拟数据

**解决方案**:
1. 检查 API Key 是否正确
2. 检查网络连接
3. 查看控制台错误日志

### 问题 3: Edge runtime 错误

**原因**: Edge 函数不支持某些 Node.js API

**解决方案**:
- 所有 API 调用使用 `fetch` 而非 `axios`
- 避免使用文件系统操作
- 使用 Web 标准 API

---

## 📚 下一步计划

### Phase 1: 完成数据集成 ✅ 50% 完成
- [x] CometAPI 集成
- [x] CoinGecko 市场数据
- [x] 技术指标计算
- [x] 深度研究数据
- [ ] Etherscan 链上数据
- [ ] 社交情绪 API

### Phase 2: 性能优化
- [ ] API 响应缓存
- [ ] 速率限制管理
- [ ] 错误重试机制
- [ ] 请求合并优化

### Phase 3: 功能增强
- [ ] 更多技术指标
- [ ] 多链支持(BSC, Polygon等)
- [ ] 历史数据图表
- [ ] 自定义警报

---

## 💡 最佳实践

1. **开发环境**: 使用免费 API 或模拟数据
2. **生产环境**: 配置所有真实 API
3. **成本控制**: 优先使用免费版 API
4. **安全性**: 不要将 .env 文件提交到 Git
5. **监控**: 在 API 提供商的仪表板监控使用情况

---

## 🎉 总结

✅ **CometAPI** - 降低 AI 成本 20%
✅ **CoinGecko** - 免费获取专业市场数据
✅ **技术指标** - 本地计算,无额外成本
✅ **降级策略** - 保证系统稳定性

**现在可以开始测试了!** 🚀

运行 `pnpm dev` 启动开发服务器,访问 http://localhost:3000
