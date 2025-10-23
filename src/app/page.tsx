"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import ChatInterface from "@/components/ChatInterface";
import { useChatSessions } from "@/hooks/useChatSessions";

export default function Home() {
  // 默认为 false,避免 hydration 不匹配
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    // 创建新会话
    createSession(title, mode, message);
  };

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
