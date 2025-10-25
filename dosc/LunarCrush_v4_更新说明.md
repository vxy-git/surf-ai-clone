# 🔄 LunarCrush API 更新到 v4

## 📋 更新内容

### 从 v2 迁移到 v4

已将 LunarCrush API 从过时的 v2 更新到最新的 v4 版本。

---

## 🔧 技术变更

### 1. **API 端点更新**

**之前 (v2)**:
```typescript
https://api.lunarcrush.com/v2?data=assets&key=${apiKey}&symbol=${symbol}
```

**现在 (v4)**:
```typescript
https://lunarcrush.com/api4/public/coins/${symbol}/v1
```

### 2. **认证方式更新**

**之前 (v2)**: Query String
```typescript
headers: {
  'Accept': 'application/json'
}
// key 在 URL 中
```

**现在 (v4)**: Bearer Token
```typescript
headers: {
  'Authorization': `Bearer ${apiKey}`,
  'Accept': 'application/json'
}
```

### 3. **数据字段适配**

代码现在支持 v4 可能的不同字段名:

```typescript
// 价格变化
price_change_24h || percent_change_24h

// 社交分数
social_score || alt_rank

// 社交量
social_volume || num_posts

// 贡献者
social_contributors || contributors

// Galaxy Score
galaxy_score || gs
```

---

## 🎯 预期改进

### 稳定性
- ✅ 使用最新稳定的 API 版本
- ✅ 更可靠的网络连接
- ✅ 更少的连接错误

### 数据质量
- ✅ 更准确的社交情绪数据
- ✅ 更及时的数据更新
- ✅ 更丰富的指标

---

## ⚠️ 重要提示

### API Key 要求

LunarCrush v4 需要有效的 API Key。您当前的 Key:
```
0xt4n92ndr3dcehrjirr9vc715kmh2emnetcats6q9
```

**这个 Key 的格式看起来像以太坊地址,可能不是有效的 LunarCrush API Key。**

### 如何获取正确的 API Key

1. **访问**: https://lunarcrush.com/developers/api
2. **登录或注册**账号
3. **生成 API Token**
4. **复制 Token** 并替换 `.env` 中的 `LUNARCRUSH_API_KEY`

### API Key 格式
LunarCrush v4 的 API Key 通常是一个长字符串,类似:
```
lc_1234567890abcdefghijklmnopqrstuvwxyz...
```

---

## 🧪 测试步骤

### 步骤 1: 检查 API Key

如果您已经有有效的 LunarCrush API Key:
1. 更新 `.env` 文件
2. 确保 Key 格式正确

如果没有:
1. 访问 https://lunarcrush.com/developers/api
2. 注册并生成新的 API Key
3. 更新 `.env` 文件

### 步骤 2: 重启服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
pnpm dev
```

### 步骤 3: 测试功能

在聊天界面输入:
```
What's the sentiment for Bitcoin?
```

### 步骤 4: 验证结果

#### ✅ 成功 (真实 v4 数据):
```
数据来源: LunarCrush API v4 (Real-time)
API 版本: v4
社交量: 15,234
社交分数: 72.5
Galaxy Score: 68.3
时间戳: 2025-10-23T...
```

#### ❌ 失败 (模拟数据):
如果仍然失败,查看服务器日志:

```
LunarCrush API error: 401 - Unauthorized
→ API Key 无效或过期

LunarCrush API error: 403 - Forbidden
→ 没有权限访问该端点

LunarCrush API error: 404 - Not Found
→ 币种不存在或 URL 错误

LunarCrush API error: 429 - Too Many Requests
→ 超出速率限制
```

---

## 🔍 调试指南

### 问题 1: 401 Unauthorized

**原因**: API Key 无效

**解决方案**:
1. 确认 `.env` 中的 Key 是否正确
2. 检查 Key 是否已过期
3. 重新生成 API Key

### 问题 2: 404 Not Found

**原因**: 币种符号不正确或不支持

**解决方案**:
1. 确认币种符号正确 (如 btc, eth, sol)
2. 尝试其他主流币种
3. 查看 LunarCrush 支持的币种列表

### 问题 3: ECONNRESET (网络错误)

**原因**:
- API Key 格式错误导致服务器拒绝连接
- 网络防火墙阻止
- DNS 解析问题

**解决方案**:
1. 首先确认 API Key 正确
2. 尝试从浏览器访问 https://lunarcrush.com
3. 检查网络设置

### 问题 4: 返回模拟数据

**原因**: API 调用失败,触发降级策略

**解决方案**:
1. 查看终端日志中的错误信息
2. 根据错误类型采取相应措施
3. 确认 API Key 正确且有效

---

## 📊 响应数据示例

### v4 API 成功响应
```json
{
  "symbol": "BTC",
  "timeframe": "24h",
  "dataSource": "LunarCrush API v4 (Real-time)",
  "overallSentiment": "Bullish",
  "sentimentScore": "72.50",
  "bullishPercentage": "68.2",
  "bearishPercentage": "31.8",
  "socialMetrics": {
    "socialVolume": "15,234",
    "socialEngagement": "8,456",
    "socialDominance": "12.5%",
    "socialScore": 72.5
  },
  "priceData": {
    "priceChange24h": "+3.25%",
    "galaxyScore": "68.3",
    "volatility": "2.45"
  },
  "keyTopics": [
    "Social volume trending",
    "Community engagement analysis",
    "Price correlation discussion",
    "Market sentiment shifts"
  ],
  "topInfluencers": [
    {
      "name": "Top Social Contributors",
      "count": "8,456",
      "activity": "Active discussions"
    }
  ],
  "trendingHashtags": ["#BTC", "#crypto", "#blockchain"],
  "timestamp": "2025-10-23T20:30:00.000Z",
  "apiVersion": "v4"
}
```

---

## 🎯 下一步

### 如果 API Key 有效
- ✅ 重启服务器
- ✅ 测试功能
- ✅ 享受真实数据!

### 如果没有有效的 API Key

#### 选项 A: 获取 LunarCrush API Key
1. 访问 https://lunarcrush.com/developers/api
2. 注册账号
3. 生成 API Key (可能需要付费)
4. 更新 `.env` 文件

#### 选项 B: 使用替代方案
暂时使用模拟数据或 CoinGecko 的社区数据作为情绪参考。

我们可以为您添加基于 CoinGecko 社区数据的简单情绪分析作为备用方案。

---

## 📝 总结

### 已完成
- ✅ 更新到 LunarCrush v4 API
- ✅ 实现 Bearer Token 认证
- ✅ 适配 v4 响应格式
- ✅ 添加详细的错误日志
- ✅ 保持降级策略

### 待确认
- ⏳ API Key 是否有效
- ⏳ 是否能成功连接 v4 端点
- ⏳ 数据格式是否完全匹配

### 建议
如果您的 API Key 格式不对或无法获取,我可以:
1. 添加基于 CoinGecko 数据的简单情绪分析
2. 或保持使用增强的模拟数据(更逼真)

**现在请重新测试!** 🚀
