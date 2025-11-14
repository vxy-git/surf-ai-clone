# FlowNet AI Clone 聊天历史功能 - 快速参考

## 核心文件位置速查表

| 功能 | 文件路径 | 行数 | 说明 |
|------|---------|------|------|
| **数据类型** | `src/types/chat.ts` | 1-12 | ChatSession 接口定义 |
| **会话管理** | `src/hooks/useChatSessions.ts` | 1-97 | CRUD 逻辑、localStorage |
| **首页入口** | `src/app/page.tsx` | 1-82 | 主应用容器 |
| **聊天界面** | `src/components/ChatInterface.tsx` | 1-182 | 消息显示、同步逻辑 |
| **侧边栏** | `src/components/Sidebar.tsx` | 1-338 | 会话列表、设置菜单 |
| **主页面** | `src/components/MainContent.tsx` | 1-205 | 欢迎页、热门问题 |
| **输入框** | `src/components/ChatInput.tsx` | 1-103 | Ask/Research 模式切换 |
| **Chat API** | `src/app/api/chat/route.ts` | 1-65 | GPT-4o-mini 后端 |
| **Research API** | `src/app/api/research/route.ts` | 1-108 | GPT-4o 后端 |

## localStorage 结构

```json
{
  "surf-ai-chat-sessions": [
    {
      "id": "1729958523456",
      "title": "What is Bitcoin?",
      "mode": "ask",
      "messages": [
        { "id": "xxx", "role": "user", "content": "..." },
        { "id": "yyy", "role": "assistant", "content": "..." }
      ],
      "createdAt": "2024-10-26T12:34:56Z",
      "updatedAt": "2024-10-26T12:34:57Z"
    }
  ]
}
```

## 关键函数/Hook 导出

```typescript
// useChatSessions Hook 返回值
{
  sessions: ChatSession[],                                    // 所有会话
  currentSessionId: string | null,                            // 当前会话 ID
  currentSession: ChatSession | null,                         // 当前会话对象
  createSession: (title, mode, initialMessage) => {...},      // 创建会话
  updateSessionMessages: (sessionId, messages) => void,       // 更新消息
  deleteSession: (sessionId) => void,                         // 删除会话 ⚠️ 未在 UI 中使用
  selectSession: (sessionId) => void,                         // 选择会话
  startNewChat: () => void,                                   // 开始新聊天
}
```

## 数据流关键节点

```
用户输入 "What is Bitcoin?"
    ↓
MainContent → onStartChat()
    ↓
page.tsx → handleStartChat()
    ↓
useChatSessions → createSession() → localStorage.setItem()
    ↓
setCurrentSessionId() + setInitialMessage()
    ↓
ChatInterface 挂载,检测 initialMessage
    ↓
append() 触发 AI API (/api/chat or /api/research)
    ↓
流式响应 → messages 更新
    ↓
useEffect 触发 onUpdateMessages()
    ↓
updateSessionMessages() → localStorage.setItem()
    ↓
session 数据持久化 ✓
```

## 已知问题速查

| 问题 | 优先级 | 文件 | 行数 | 修复难度 |
|------|--------|------|------|---------|
| 删除会话 UI 未实现 | P0 🔴 | Sidebar.tsx | 171-194 | ⭐ 简单 |
| 会话 ID 碰撞风险 | P1 🟡 | useChatSessions.ts | 39 | ⭐ 简单 |
| localStorage 错误处理 | P1 🟡 | useChatSessions.ts | 18-28 | ⭐⭐ 中等 |
| 标题重复 | P1 🟡 | page.tsx | 34-35 | ⭐⭐ 中等 |
| 同步时序 | P2 🟠 | ChatInterface.tsx | 52-65 | ⭐⭐⭐ 复杂 |
| ref 状态管理 | P2 🟠 | useChatSessions.ts | 10-15 | ⭐⭐⭐ 复杂 |
| 缺少导出功能 | P3 🔵 | 整个项目 | - | ⭐⭐⭐ 复杂 |
| 缺少搜索功能 | P3 🔵 | Sidebar.tsx | - | ⭐⭐ 中等 |

## Props 传递链路

```
page.tsx (useChat的数据源)
  ├─ <Sidebar
  │    sessions={sessions}
  │    currentSessionId={currentSessionId}
  │    onSelectSession={selectSession}
  │    onNewChat={startNewChat}
  │    // ⚠️ 缺少 onDeleteSession
  │  />
  │
  ├─ <MainContent
  │    onStartChat={handleStartChat}
  │  />
  │
  └─ <ChatInterface
       mode={currentSession.mode}
       sessionId={currentSession.id}
       initialMessages={currentSession.messages}
       onUpdateMessages={updateSessionMessages}
     />
```

## 快速修复指南

### 问题 #1: 实现删除会话 UI (优先级: P0)

**Sidebar.tsx 需要改动:**
```typescript
// 1. 在 SidebarProps 中添加
onDeleteSession?: (sessionId: string) => void;

// 2. 在会话项添加删除按钮或右键菜单
<DropdownMenu>
  <DropdownMenuTrigger>...</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => onDeleteSession?.(session.id)}>
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

// 3. 在 page.tsx 中传入
<Sidebar
  ...
  onDeleteSession={deleteSession}
/>
```

### 问题 #2: 修复会话 ID 碰撞 (优先级: P1)

**useChatSessions.ts 第 39 行改为:**
```typescript
// 方案 1: 使用时间戳 + 随机数
id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

// 方案 2: 使用 crypto (推荐)
id: crypto.randomUUID(),
```

### 问题 #3: 改进会话标题 (优先级: P1)

**page.tsx 第 34-35 行改为:**
```typescript
const generateTitle = (message: string) => {
  // 取前 30 个字符
  let title = message.length > 30 ? message.substring(0, 30) + '...' : message;
  
  // 添加时间戳来避免重复
  const timestamp = new Date().toLocaleTimeString();
  return `${title} (${timestamp})`;
};

const title = generateTitle(message);
```

## API 速查

### 发送聊天消息
```bash
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "What is Bitcoin?" }
  ]
}

# 响应: 流式文本流 (TextStreamResponse)
```

### 发送研究请求
```bash
POST /api/research
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Research Bitcoin" }
  ]
}

# 响应: 流式文本流 (TextStreamResponse)
```

## 环境变量

```env
OPENAI_API_KEY=sk-...              # OpenAI API key
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选，支持代理
```

## 测试聊天历史的方法

### 1. 测试会话创建
```javascript
// 在浏览器控制台执行
localStorage.getItem('surf-ai-chat-sessions')
// 应该返回 null (初次) 或 JSON 数组

// 输入一条消息后再检查:
JSON.parse(localStorage.getItem('surf-ai-chat-sessions'))[0]
// 应该显示最新的会话对象
```

### 2. 测试会话删除 (当前无 UI，需手动调用)
```javascript
// 模拟删除 - 需要先手工编辑组件以添加删除按钮
const sessions = JSON.parse(localStorage.getItem('surf-ai-chat-sessions'));
const filtered = sessions.filter(s => s.id !== sessions[0].id);
localStorage.setItem('surf-ai-chat-sessions', JSON.stringify(filtered));
// 刷新页面查看效果
```

### 3. 测试 ID 碰撞
```javascript
// 创建多个会话后检查是否有重复 ID
const sessions = JSON.parse(localStorage.getItem('surf-ai-chat-sessions'));
const ids = sessions.map(s => s.id);
console.log('Unique IDs:', new Set(ids).size);
console.log('Total sessions:', ids.length);
// 应该相等，如果不相等说明有碰撞
```

## 性能优化建议

1. **加分页**: 会话数量超过 100 时考虑分页加载
2. **压缩消息**: 保存时压缩大消息内容
3. **清理过期**: 自动删除 30 天以上的会话
4. **索引建立**: 为标题建立搜索索引

## 相关文档

- 详细分析: `/CHAT_HISTORY_ANALYSIS.md`
- 问题汇总: `/ISSUES_SUMMARY.txt`
- React Hooks: https://react.dev/reference/react
- AI SDK: https://sdk.vercel.ai/docs
- TypeScript: https://www.typescriptlang.org/docs/

---
生成时间: 2024-10-26
最后更新: 当日
