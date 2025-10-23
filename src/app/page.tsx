"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import ChatInterface from "@/components/ChatInterface";
import { useChatSessions } from "@/hooks/useChatSessions";

export default function Home() {
  // 默认为 false,避免 hydration 不匹配
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | undefined>(undefined);
  const lastSessionIdRef = useRef<string | null>(null);

  // 使用会话管理 hook
  const {
    sessions,
    currentSessionId,
    currentSession,
    createSession,
    updateSessionMessages,
    selectSession,
    startNewChat,
  } = useChatSessions();

  useEffect(() => {
    // 在客户端根据屏幕尺寸设置初始状态
    // PC端(>=768px)默认打开,移动端(<768px)默认关闭
    const isMobile = window.innerWidth < 768;
    setSidebarOpen(!isMobile);
  }, []);

  const handleStartChat = (message: string, mode: 'ask' | 'research') => {
    // 生成会话标题(取前30个字符)
    const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
    // 创建新会话并保存初始消息
    const { sessionId, initialMessage: msg } = createSession(title, mode, message);
    setInitialMessage(msg);
  };

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

  return (
    <div className="flex h-screen bg-[#f7f7f7] dark:bg-gray-900">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={selectSession}
        onNewChat={startNewChat}
      />

      {/* 显示欢迎页或聊天界面 */}
      {currentSession ? (
        <ChatInterface
          mode={currentSession.mode}
          sessionId={currentSession.id}
          initialMessages={currentSession.messages}
          initialMessage={initialMessage}
          onUpdateMessages={updateSessionMessages}
        />
      ) : (
        <MainContent
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
}
