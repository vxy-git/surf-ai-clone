"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import ChatInterface from "@/components/ChatInterface";
import { useChatSessions } from "@/hooks/useChatSessions";
import { PaymentModalProvider } from "@/contexts/PaymentModalContext";
import { useTranslation } from "@/hooks/useTranslation";

export default function Home() {
  // 默认为 false,避免 hydration 不匹配
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | undefined>(undefined);
  const [isChatInitializing, setIsChatInitializing] = useState(false);
  const [pendingMode, setPendingMode] = useState<'ask' | 'research' | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const lastSessionIdRef = useRef<string | null>(null);

  // 使用会话管理 hook
  const {
    sessions,
    currentSessionId,
    currentSession,
    createSession,
    updateSessionMessages,
    deleteSession,
    selectSession,
    startNewChat,
    loading,
    error,
  } = useChatSessions();

  useEffect(() => {
    // 在客户端根据屏幕尺寸设置初始状态
    // PC端(>=768px)默认打开,移动端(<768px)默认关闭
    const isMobile = window.innerWidth < 768;
    setSidebarOpen(!isMobile);
  }, []);

  const handleStartChat = async (message: string, mode: 'ask' | 'research') => {
    // 生成智能会话标题
    let title = message.trim();

    // 如果消息太长,智能截断
    if (title.length > 50) {
      // 尝试在句子边界截断
      const sentenceEnd = title.substring(0, 50).match(/[。.!?]+/);
      if (sentenceEnd && sentenceEnd.index) {
        title = title.substring(0, sentenceEnd.index + 1);
      } else {
        // 否则在词边界截断
        const lastSpace = title.substring(0, 50).lastIndexOf(' ');
        title = title.substring(0, lastSpace > 30 ? lastSpace : 50) + '...';
      }
    }

    setIsChatInitializing(true);
    setPendingMode(mode);
    setPendingPrompt(message);

    try {
      // 创建新会话并保存初始消息
      const { initialMessage: msg } = await createSession(title, mode, message);
      setInitialMessage(msg);
    } catch (error) {
      console.error('[Home] Failed to create session:', error);
      setPendingMode(null);
      setPendingPrompt(null);
    } finally {
      // 即使当前会话尚未返回,也结束本地加载标记,由 currentSessionId 判定是否继续展示占位
      setIsChatInitializing(false);
    }
  };

  // 当成功拿到当前会话时,清除待显示的提示
  useEffect(() => {
    if (currentSession) {
      setPendingMode(null);
      setPendingPrompt(null);
    }
  }, [currentSession]);

  // 切换会话时清除初始消息
  useEffect(() => {
    // 只有会话ID真正变化时才处理
    if (currentSessionId !== lastSessionIdRef.current) {
      lastSessionIdRef.current = currentSessionId;

      // 如果切换到已有消息的会话,清除 initialMessage
      if (currentSessionId && currentSession && currentSession.messages.length > 0) {
        setInitialMessage(undefined);
      }
    }
  }, [currentSessionId, currentSession]);

  const handleNewChat = () => {
    setIsChatInitializing(false);
    setPendingMode(null);
    setPendingPrompt(null);
    startNewChat();
  };

  const shouldShowLoadingPane =
    !currentSession &&
    (isChatInitializing || !!currentSessionId);

  return (
    <PaymentModalProvider>
      <div className="flex h-screen bg-[#f7f7f7] dark:bg-gray-900 relative overflow-hidden">
        {/* 🌈 装饰性背景层 - 超强玻璃效果 */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* 主主题渐变圆 - 左上角 */}
          <div className="absolute -top-20 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-sky-400/70 to-cyan-400/70 dark:from-sky-500/50 dark:to-cyan-500/50 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}} />
          {/* 主蓝色渐变圆 - 右侧 */}
          <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/60 to-cyan-400/60 dark:from-blue-500/40 dark:to-cyan-500/40 rounded-full blur-3xl" />
          {/* 主青色渐变圆 - 底部 */}
          <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-cyan-400/65 to-sky-400/65 dark:from-cyan-500/45 dark:to-sky-500/45 rounded-full blur-3xl" />
          {/* 辅助橙色渐变圆 - 右下角 */}
          <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-orange-300/50 to-red-300/50 dark:from-orange-500/35 dark:to-red-500/35 rounded-full blur-3xl" />
          {/* 辅助青色渐变圆 - 左中 */}
          <div className="absolute top-1/2 left-0 w-[450px] h-[450px] bg-gradient-to-br from-cyan-300/55 to-blue-300/55 dark:from-cyan-500/38 dark:to-blue-500/38 rounded-full blur-3xl" />
        </div>
        <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onNewChat={handleNewChat}
        onDeleteSession={deleteSession}
        loading={loading}
        error={error}
      />

      {/* 显示欢迎页或聊天界面 */}
      {currentSession ? (
        <ChatInterface
          key="chat-interface-stable" // 使用固定key保持组件稳定,不再根据sessionId重新挂载
          mode={currentSession.mode}
          sessionId={currentSession.id}
          initialMessages={currentSession.messages}
          initialMessage={initialMessage}
          onUpdateMessages={updateSessionMessages}
        />
      ) : shouldShowLoadingPane ? (
        <ChatLoadingPane mode={pendingMode} prompt={pendingPrompt} />
      ) : (
        <MainContent
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onStartChat={handleStartChat}
        />
      )}
      </div>
    </PaymentModalProvider>
  );
}

function ChatLoadingPane({ mode, prompt }: { mode: 'ask' | 'research' | null; prompt: string | null }) {
  const { t } = useTranslation();
  const displayPrompt = prompt && prompt.length > 160 ? `${prompt.slice(0, 160)}...` : prompt;

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 border-4 border-[#19c8ff]/30 border-t-[#19c8ff] rounded-full animate-spin" />
      <h2 className="mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
        {t("chatPreparing")}
      </h2>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {mode === 'research'
          ? t("chatPreparingResearch")
          : t("chatPreparingAsk")}
      </p>
      {displayPrompt && (
        <div className="mt-6 max-w-xl bg-white/80 dark:bg-gray-800/80 border border-white/60 dark:border-gray-700/60 rounded-2xl px-6 py-4 shadow-inner">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("chatYourQuestion")}</p>
          <p className="text-base text-gray-900 dark:text-white break-words">{displayPrompt}</p>
        </div>
      )}
    </div>
  );
}
