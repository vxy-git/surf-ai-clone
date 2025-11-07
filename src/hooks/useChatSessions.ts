import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import type { Message } from 'ai/react';
import { ChatSession, ChatMode } from '@/types/chat';

export function useChatSessions() {
  const { address, isConnected } = useAccount();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionsRef = useRef<ChatSession[]>(sessions);

  // 保持 ref 同步
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // 从数据库加载会话
  useEffect(() => {
    if (!address || !isConnected) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const loadSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/sessions?walletAddress=${encodeURIComponent(address)}`);

        if (!response.ok) {
          throw new Error('Failed to load chat sessions');
        }

        const data = await response.json();
        setSessions(data.sessions || []);
        console.log('[useChatSessions] Loaded', data.sessions?.length || 0, 'sessions from database');
      } catch (err) {
        console.error('[useChatSessions] Error loading sessions:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [address, isConnected]);

  // 创建新会话
  const createSession = useCallback(async (title: string, mode: ChatMode, initialMessage: string): Promise<{ sessionId: string; initialMessage: string }> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          title,
          mode,
          messages: [], // 空消息数组,等待第一次发送
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      const newSession: ChatSession = data.session;

      // 更新本地状态
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      console.log('[useChatSessions] Created session:', newSession.id);

      return { sessionId: newSession.id, initialMessage };
    } catch (err) {
      console.error('[useChatSessions] Error creating session:', err);
      throw err;
    }
  }, [address]);

  // 更新会话消息
  const updateSessionMessages = useCallback(async (sessionId: string, messages: Message[]) => {
    if (!address) {
      console.warn('[useChatSessions] Cannot update session: wallet not connected');
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update session');
      }

      const data = await response.json();

      // 更新本地状态
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? { ...session, messages, updatedAt: data.session.updatedAt }
            : session
        )
      );
      console.log('[useChatSessions] Updated session:', sessionId, 'with', messages.length, 'messages');
    } catch (err) {
      console.error('[useChatSessions] Error updating session:', err);
      // 不抛出错误,允许会话继续(但数据不会保存到数据库)
    }
  }, [address]);

  // 删除会话
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      // 更新本地状态
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
      console.log('[useChatSessions] Deleted session:', sessionId);
    } catch (err) {
      console.error('[useChatSessions] Error deleting session:', err);
      throw err;
    }
  }, [address, currentSessionId]);

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
    loading,
    error,
    isConnected,
  };
}
