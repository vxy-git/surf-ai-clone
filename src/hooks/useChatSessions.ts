import { useState, useEffect, useCallback } from 'react';
import { Message } from 'ai';
import { ChatSession, ChatMode } from '@/types/chat';

const STORAGE_KEY = 'surf-ai-chat-sessions';

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // 从 localStorage 加载会话
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessions(parsed);
      } catch (error) {
        console.error('Failed to parse sessions:', error);
      }
    }
  }, []);

  // 保存到 localStorage
  const saveSessions = useCallback((newSessions: ChatSession[]) => {
    setSessions(newSessions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
  }, []);

  // 创建新会话
  const createSession = useCallback((title: string, mode: ChatMode, initialMessage: string): string => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title,
      mode,
      messages: [{
        id: 'initial',
        role: 'user',
        content: initialMessage,
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newSessions = [newSession, ...sessions];
    saveSessions(newSessions);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  }, [sessions, saveSessions]);

  // 更新会话消息
  const updateSessionMessages = useCallback((sessionId: string, messages: Message[]) => {
    const newSessions = sessions.map(session =>
      session.id === sessionId
        ? { ...session, messages, updatedAt: new Date().toISOString() }
        : session
    );
    saveSessions(newSessions);
  }, [sessions, saveSessions]);

  // 删除会话
  const deleteSession = useCallback((sessionId: string) => {
    const newSessions = sessions.filter(s => s.id !== sessionId);
    saveSessions(newSessions);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  }, [sessions, currentSessionId, saveSessions]);

  // 选择会话
  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  // 获取当前会话
  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  // 创建新对话(清除当前会话)
  const startNewChat = useCallback(() => {
    setCurrentSessionId(null);
  }, []);

  return {
    sessions,
    currentSessionId,
    currentSession,
    createSession,
    updateSessionMessages,
    deleteSession,
    selectSession,
    startNewChat,
  };
}
