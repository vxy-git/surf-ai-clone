import { useState, useEffect, useCallback, useRef } from 'react';
import type { Message } from 'ai/react';
import { ChatSession, ChatMode } from '@/types/chat';

const STORAGE_KEY = 'surf-ai-chat-sessions';

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const sessionsRef = useRef<ChatSession[]>(sessions);

  // 保持 ref 同步
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // 从 localStorage 加载会话
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // 验证数据格式
        if (Array.isArray(parsed)) {
          setSessions(parsed);
        } else {
          console.error('Invalid sessions data format');
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to parse sessions:', error);
        // 清除损坏的数据
        localStorage.removeItem(STORAGE_KEY);
        // 可选: 显示用户提示
        if (typeof window !== 'undefined') {
          console.warn('聊天历史数据已损坏,已清除。这不会影响新的会话。');
        }
      }
    }
  }, []);

  // 保存到 localStorage
  const saveSessions = useCallback((newSessions: ChatSession[]) => {
    setSessions(newSessions);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
    } catch (error) {
      console.error('Failed to save sessions to localStorage:', error);
      // localStorage 可能已满或被禁用
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage 存储空间已满,请删除一些旧会话');
      }
    }
  }, []);

  // 创建新会话
  const createSession = useCallback((title: string, mode: ChatMode, initialMessage: string): { sessionId: string; initialMessage: string } => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title,
      mode,
      messages: [], // 空消息数组,等待第一次发送
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newSessions = [newSession, ...sessions];
    saveSessions(newSessions);
    setCurrentSessionId(newSession.id);
    return { sessionId: newSession.id, initialMessage };
  }, [sessions, saveSessions]);

  // 更新会话消息 - 使用 ref 避免依赖 sessions
  const updateSessionMessages = useCallback((sessionId: string, messages: Message[]) => {
    const currentSessions = sessionsRef.current;
    const newSessions = currentSessions.map(session =>
      session.id === sessionId
        ? { ...session, messages, updatedAt: new Date().toISOString() }
        : session
    );
    saveSessions(newSessions);
  }, [saveSessions]);

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
