# ✅ CoinGecko 社交情绪分析 - 实施完成

## 📋 实施概要

已成功将社交情绪分析从 LunarCrush（需付费订阅）迁移到 **CoinGecko 免费社区数据**。

---

## 🔄 变更内容

### 数据源替换

**之前 (LunarCrush v4)**:
- ❌ 需要 $99/月订阅
- ❌ 402 Payment Required 错误
- 端点: `https://lunarcrush.com/api4/public/coins/{symbol}/v1`

**现在 (CoinGecko)**:
- ✅ 完全免费
- ✅ 无需付费订阅
- ✅ 丰富的社区和开发者数据
- 端点: `https://api.coingecko.com/api/v3/coins/{id}?community_data=true&developer_data=true`

---

## 🎯 情绪评分算法

### 多因子综合评分模型 (0-100 分)

#### 基准分数: 50

#### 因子权重:

1. **社区投票 (40% 权重)**
   - 数据来源: CoinGecko 社区投票
   - 计算: `(看涨投票百分比 - 50) × 0.4`
   - 示例: 70% 看涨 → +8 分

2. **价格动能 (30% 权重)**
   - 24小时价格变化:
     - > +5%: +15 分
     - 0% ~ +5%: +7.5 分
     - -5% ~ 0%: -7.5 分
     - < -5%: -15 分

3. **开发活跃度 (15% 权重)**
   - GitHub 近 4 周提交数:
     - > 100 次: +7.5 分
     - 50-100 次: +3.75 分
     - < 50 次: 0 分

4. **社交媒体影响力 (15% 权重)**
   - 综合社交强度 = (Twitter粉丝/100万) + (Reddit订阅/10万) + (Telegram用户/10万)
   - > 10: +7.5 分
   - 5-10: +3.75 分
   - < 5: 0 分

#### 最终分数:
```
最终得分 = Math.max(0, Math.min(100, 基准分 + 所有因子得分))
```

#### 情绪分类:
- **75-100**: 强烈看涨 (Strongly Bullish)
- **60-74**: 看涨 (Bullish)
- **40-59**: 中性 (Neutral)
- **25-39**: 看跌 (Bearish)
- **0-24**: 强烈看跌 (Strongly Bearish)

---

## 📊 返回数据结构

```typescript
{
  symbol: "BTC",
  timeframe: "24h",
  dataSource: "CoinGecko Community Data (Free)",

  // 核心情绪指标
  overallSentiment: "Bullish",
  sentimentScore: "72.50",
  bullishPercentage: "68.5",
  bearishPercentage: "31.5",

  // 社区指标
  communityMetrics: {
    twitterFollowers: "5,234,567",
    redditSubscribers: "4,123,456",
    telegramUsers: "98,765",
    facebookLikes: "123,456",
    communityUpvotes: 72.3,
    communityDownvotes: 27.7,
    socialStrength: "High"
  },

  // 市场动能
  marketMomentum: {
    priceChange24h: "+3.25%",
    priceChange7d: "+8.50%",
    priceChange30d: "+15.20%",
    volumeChange24h: "+12.5%",
    marketCapChange24h: "+3.1%"
  },

  // 开发活动
  developmentActivity: {
    commits4Weeks: 234,
    contributors: 89,
    stars: 45678,
    forks: 12345,
    activityLevel: "Very Active"
  },

  // 关键话题
  keyTopics: [
    "社区投票显示 72.3% 看涨情绪",
    "Twitter 粉丝数: 523万+",
    "近期价格上涨 +3.25% (24h)",
    "开发团队活跃: 234次提交 (4周)"
  ],

  // 元数据
  methodology: "Multi-factor: CoinGecko community votes (40%) + price momentum (30%) + dev activity (15%) + social metrics (15%)",
  timestamp: "2025-10-23T...",
  apiVersion: "CoinGecko v3"
}
```

---

## 🧪 测试步骤

### 步骤 1: 确认服务器运行

```bash
# 如果服务器未运行,启动它
cd /Users/wming/Documents/workBox/OliverSmith/AiAgent/surf-ai-clone
pnpm dev
```

应该看到:
```
▲ Next.js 15.5.6 (Turbopack)
- Local:        http://localhost:3001
✓ Starting...
✓ Ready in 2.3s
```

### 步骤 2: 打开浏览器

访问: http://localhost:3001

### 步骤 3: 测试查询

在聊天界面输入以下任一问题:

```
What's the sentiment for Bitcoin?
```

或

```
分析一下以太坊的社交情绪
```

或

```
BNB的社区讨论怎么样？
```

### 步骤 4: 验证结果

#### ✅ 成功标志 (真实 CoinGecko 数据):

响应中应该包含:
- ✅ `数据来源: CoinGecko Community Data (Free)`
- ✅ 真实的 Twitter 粉丝数 (如: 5,234,567)
- ✅ 真实的 Reddit 订阅数 (如: 4,123,456)
- ✅ 真实的价格变化百分比
- ✅ 真实的 GitHub 提交数据
- ✅ 时间戳为当前时间

#### ❌ 失败标志 (模拟数据):

如果看到以下内容说明降级到模拟数据:
- ❌ `数据来源: Simulated Data`
- ❌ 虚构的 KOL 名称 (如: CryptoWhale, BlockchainAnalyst)
- ❌ 整数化的社交数据 (如: 500,000 而不是真实的不规则数字)

### 步骤 5: 检查服务器日志

**成功的日志**:
```
✓ CoinGecko API called successfully
✓ Community data received for bitcoin
✓ Sentiment score calculated: 72.50
```

**失败的日志**:
```
Social sentiment API error: [错误详情]
⚠️ Falling back to simulated data
```

---

## 🔍 数据对比示例

### 真实数据 vs 模拟数据

| 指标 | 真实数据示例 (BTC) | 模拟数据 |
|------|-------------------|---------|
| 数据来源 | CoinGecko Community Data (Free) | Simulated Data |
| Twitter 粉丝 | 5,234,567 (不规则) | 500,000 (整数) |
| Reddit 订阅 | 4,123,456 (不规则) | 350,000 (整数) |
| 情绪分数 | 72.50 (计算值) | 65.00 (随机) |
| 价格变化 | +3.25% (真实) | +2.50% (模拟) |
| GitHub 提交 | 234 (真实) | N/A |
| KOL/影响者 | 无 (基于社区数据) | CryptoWhale, BlockchainAnalyst (虚构) |
| 时间戳 | 2025-10-23T20:45:32.123Z | 2025-10-23T20:00:00.000Z |

---

## 📈 支持的币种

### 主流币种 (已映射):

代码中已配置 `SYMBOL_TO_COINGECKO_ID` 映射:

```typescript
BTC → bitcoin
ETH → ethereum
BNB → binancecoin
SOL → solana
XRP → ripple
ADA → cardano
DOGE → dogecoin
MATIC → matic-network
DOT → polkadot
SHIB → shiba-inu
AVAX → avalanche-2
LINK → chainlink
UNI → uniswap
ATOM → cosmos
... (更多)
```

### 测试其他币种:

```
What's the sentiment for Solana?
分析 Cardano 的社交情绪
Dogecoin 的社区活跃吗？
```

---

## ⚠️ 可能的问题和解决方案

### 问题 1: 仍然返回模拟数据

**原因**: CoinGecko API 调用失败

**检查**:
1. 查看服务器终端日志的错误信息
2. 检查网络连接
3. 确认币种 ID 映射正确

**解决**:
```bash
# 测试 CoinGecko API 连接
curl "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=true&developer_data=true"
```

### 问题 2: 429 Too Many Requests

**原因**: 超出 CoinGecko 免费配额 (50 calls/minute)

**解决**:
1. 等待 1 分钟后重试
2. 考虑使用 CoinGecko API Key (免费但需注册)
3. 在 `.env` 中添加:
   ```bash
   COINGECKO_API_KEY=your_api_key_here
   ```

### 问题 3: 404 Not Found

**原因**: 币种 ID 不正确或不支持

**解决**:
1. 检查币种符号是否在 `SYMBOL_TO_COINGECKO_ID` 中
2. 访问 https://api.coingecko.com/api/v3/coins/list 查找正确的 ID
3. 在代码中添加映射

### 问题 4: 数据不完整

**原因**: 某些币种的社区数据可能不完整

**预期行为**:
- 代码会优雅处理缺失字段
- 使用默认值填充
- 仍然计算有效的情绪分数

---

## 🎯 与 LunarCrush 的对比

| 特性 | LunarCrush v4 | CoinGecko (当前方案) |
|------|--------------|---------------------|
| **价格** | $99/月起 | ✅ 完全免费 |
| **社交情绪** | 专业的情绪分析 | ✅ 基于社区投票和社交指标 |
| **数据源** | 多平台聚合 | Twitter, Reddit, Telegram, Facebook |
| **开发数据** | ❌ 无 | ✅ GitHub 活动数据 |
| **API 限制** | 付费套餐限制 | 50 calls/min (免费) |
| **数据新鲜度** | 实时 | ✅ 实时 |
| **可靠性** | 高 (付费) | ✅ 高 (免费) |
| **覆盖币种** | 2000+ | ✅ 10,000+ |

### 优势:
- ✅ **零成本**: 完全免费
- ✅ **高可靠性**: CoinGecko 是行业标准数据源
- ✅ **更多币种**: 覆盖更广
- ✅ **额外数据**: 包含开发者活动数据

### 劣势:
- ⚠️ 非专业情绪分析工具
- ⚠️ 基于间接指标计算情绪
- ⚠️ 免费 API 有速率限制

---

## 📝 代码变更总结

### 修改的文件:
- `src/lib/ai-tools.ts` - `socialSentimentTool` 函数

### 关键变更:

#### 1. API 端点
```typescript
// 之前 (LunarCrush)
const url = `https://lunarcrush.com/api4/public/coins/${symbol}/v1`;

// 现在 (CoinGecko)
const url = `${baseUrl}/coins/${id}?localization=false&tickers=false&community_data=true&developer_data=true&sparkline=false`;
```

#### 2. 认证方式
```typescript
// 之前 (LunarCrush)
headers: {
  'Authorization': `Bearer ${apiKey}`,
  'Accept': 'application/json'
}

// 现在 (CoinGecko)
const headers: HeadersInit = apiKey ? { 'x-cg-pro-api-key': apiKey } : {};
```

#### 3. 数据提取
```typescript
// 社区数据
const communityData = data.community_data || {};
const sentimentUpVotes = communityData.sentiment_votes_up_percentage || 50;
const twitterFollowers = communityData.twitter_followers || 0;
const redditSubscribers = communityData.reddit_subscribers || 0;
const telegramUsers = communityData.telegram_channel_user_count || 0;

// 开发者数据
const developerData = data.developer_data || {};
const commits4weeks = developerData.commit_count_4_weeks || 0;
const contributors = developerData.pull_request_contributors || 0;

// 市场数据
const marketData = data.market_data || {};
const priceChange24h = marketData.price_change_percentage_24h || 0;
const priceChange7d = marketData.price_change_percentage_7d || 0;
```

#### 4. 情绪分数计算
```typescript
let sentimentScore = 50; // 基准分

// 1. 社区投票权重 40%
sentimentScore += (sentimentUpVotes - 50) * 0.4;

// 2. 价格动能权重 30%
if (priceChange24h > 5) sentimentScore += 15;
else if (priceChange24h > 0) sentimentScore += 7.5;
else if (priceChange24h < -5) sentimentScore -= 15;
else if (priceChange24h < 0) sentimentScore -= 7.5;

// 3. 开发活跃度权重 15%
if (commits4weeks > 100) sentimentScore += 7.5;
else if (commits4weeks > 50) sentimentScore += 3.75;

// 4. 社交影响力权重 15%
const socialStrength = (twitterFollowers / 1000000) + (redditSubscribers / 100000) + (telegramUsers / 100000);
if (socialStrength > 10) sentimentScore += 7.5;
else if (socialStrength > 5) sentimentScore += 3.75;

// 限制在 0-100 范围
sentimentScore = Math.max(0, Math.min(100, sentimentScore));
```

---

## 🚀 下一步

### 立即测试:

1. ✅ 打开 http://localhost:3001
2. ✅ 输入: "What's the sentiment for Bitcoin?"
3. ✅ 验证返回的是真实 CoinGecko 数据
4. ✅ 检查服务器日志确认成功

### 如果测试成功:

项目的 5 个 AI 工具将全部使用真实数据:
- ✅ **市场数据工具**: CoinGecko 实时价格
- ✅ **技术分析工具**: CoinGecko 历史数据 + 本地计算指标
- ✅ **链上追踪工具**: Etherscan 以太坊数据
- ✅ **深度搜索工具**: CoinGecko 项目详情
- ✅ **社交情绪工具**: CoinGecko 社区数据 (新实现)

### 如果测试失败:

请提供:
1. 服务器终端的完整错误日志
2. 浏览器中显示的响应内容
3. 您提出的具体问题

---

## 📊 预期测试结果示例

### 成功的完整响应 (Bitcoin):

```markdown
目前 BTC 的社交情绪分析

数据来源: CoinGecko Community Data (Free)

整体情绪: 看涨 (Bullish)
情绪评分: 72.50/100

市场观点分布:
- 看涨比例: 68.5%
- 看跌比例: 31.5%

社区指标:
- Twitter 粉丝: 5,234,567
- Reddit 订阅者: 4,123,456
- Telegram 成员: 98,765
- Facebook 点赞: 123,456
- 社区看涨投票: 72.3%
- 社交影响力: High

市场动能:
- 24小时价格变化: +3.25%
- 7天价格变化: +8.50%
- 30天价格变化: +15.20%
- 24小时交易量变化: +12.5%
- 市值变化: +3.1%

开发者活动:
- 近4周提交次数: 234
- 活跃贡献者: 89
- GitHub Stars: 45,678
- Forks: 12,345
- 活跃度: Very Active

关键话题:
- 社区投票显示 72.3% 看涨情绪
- Twitter 粉丝数: 523万+
- 近期价格上涨 +3.25% (24h)
- 开发团队活跃: 234次提交 (4周)

评分方法: 多因子模型 - 社区投票(40%) + 价格动能(30%) + 开发活跃度(15%) + 社交指标(15%)

时间戳: 2025-10-23T20:45:32.123Z
API 版本: CoinGecko v3
```

---

## ✅ 总结

### 完成的工作:
- ✅ 实现基于 CoinGecko 的免费社交情绪分析
- ✅ 设计多因子情绪评分算法
- ✅ 提取社区、市场、开发数据
- ✅ 保持降级策略
- ✅ 代码已编译通过 (lint passed)
- ✅ 服务器正常运行

### 待验证:
- ⏳ 用户测试真实数据返回
- ⏳ 验证不同币种的数据质量
- ⏳ 确认情绪分数计算准确性

### 优势:
- 💰 **零成本**: 完全免费
- 🌍 **广覆盖**: 10,000+ 币种
- 📊 **多维度**: 社区+市场+开发综合分析
- 🔒 **可靠性**: CoinGecko 行业标准

**现在请测试功能!** 🚀
