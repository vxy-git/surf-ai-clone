"use client";

import { useChat } from 'ai/react';
import { useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import ReactMarkdown from 'react-markdown';
import ChatInput from '@/components/ChatInput';
import { useUsage } from '@/hooks/useUsage';
import { usePaymentModal } from '@/contexts/PaymentModalContext';
import type { Message } from 'ai/react';

interface ChatInterfaceProps {
  mode: 'ask' | 'research';
  sessionId: string;
  initialMessages: Message[];
  initialMessage?: string;
  onUpdateMessages: (sessionId: string, messages: Message[]) => void;
}

export default function ChatInterface({
  mode,
  sessionId,
  initialMessages,
  initialMessage,
  onUpdateMessages
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoSent = useRef(false);
  const lastSyncedLength = useRef(0);
  const currentSessionIdRef = useRef(sessionId);
  const { address } = useAccount();
  const { recordUsage, checkCanUse } = useUsage();
  const { openPaymentModal } = usePaymentModal();

  const { messages, setMessages, isLoading, error, append } = useChat({
    api: mode === 'research' ? '/api/research' : '/api/chat',
    id: sessionId, // 使用sessionId作为会话标识
    initialMessages: initialMessages,
    streamProtocol: 'data',
    headers: {
      'x-wallet-address': address || ''
    },
    onFinish: () => {
      // AI 响应成功后，扣除一次使用次数
      const success = recordUsage();
      if (success) {
        console.log('[ChatInterface] Usage recorded successfully');
      } else {
        console.warn('[ChatInterface] Failed to record usage - quota exceeded');
      }
    }
  });

  // 会话切换时手动更新消息 - 避免组件重新挂载
  useEffect(() => {
    if (sessionId !== currentSessionIdRef.current) {
      currentSessionIdRef.current = sessionId;
      // 手动设置消息,避免组件卸载
      setMessages(initialMessages);
      lastSyncedLength.current = initialMessages.length;
      hasAutoSent.current = false;
    }
  }, [sessionId, setMessages, initialMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 合并消息同步逻辑 - 避免重复保存
  useEffect(() => {
    const shouldSync =
      messages.length > 0 &&
      (messages.length > lastSyncedLength.current || !isLoading);

    if (shouldSync) {
      // 只在实际需要时更新
      if (messages.length > lastSyncedLength.current || !isLoading) {
        lastSyncedLength.current = messages.length;
        onUpdateMessages(sessionId, messages);
      }
    }
  }, [messages, isLoading, sessionId, onUpdateMessages]);

  // 如果是新会话且有初始消息,自动发送一次
  useEffect(() => {
    if (initialMessage && messages.length === 0 && !hasAutoSent.current) {
      hasAutoSent.current = true;

      // 发送前检查次数
      if (!checkCanUse()) {
        console.log('[ChatInterface] Usage quota exceeded when auto-sending, opening payment modal');
        openPaymentModal();
        return;
      }

      append({ role: 'user', content: initialMessage });
    }
  }, [initialMessage, messages.length, append, checkCanUse, openPaymentModal]);

  const handleSendMessage = (message: string, newMode: 'ask' | 'research') => {
    // 发送前检查次数
    if (!checkCanUse()) {
      console.log('[ChatInterface] Usage quota exceeded, opening payment modal');
      openPaymentModal();
      return;
    }

    append({ role: 'user', content: message });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f7f7f7] dark:bg-gray-900 h-full overflow-hidden relative">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">
                  {mode === 'research' ? 'Ready to Research' : 'How can I help you?'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {mode === 'research'
                    ? 'Ask me to research any cryptocurrency project and I\'ll provide a comprehensive analysis with market data, technical indicators, on-chain metrics, and more.'
                    : 'Ask me anything about cryptocurrency markets, projects, or trading. I can analyze sentiment, technical indicators, and on-chain data.'}
                </p>
                <div className="mt-6 space-y-2">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Try asking:</p>
                  <div className="space-y-2">
                    {mode === 'research' ? (
                      <>
                        <button className="w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          Research Bitcoin's current market position
                        </button>
                        <button className="w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          Analyze Ethereum's on-chain metrics
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          What's the current sentiment for BTC?
                        </button>
                        <button className="w-full text-left px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          Show me technical analysis for ETH
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id || `${sessionId}-${index}-${message.role}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-[#A78BFA] text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-800 dark:text-white rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className="prose dark:prose-invert prose-sm">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 dark:text-white rounded-2xl rounded-bl-none p-3 text-sm shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#A78BFA] animate-pulse" />
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {mode === 'research' ? 'Researching...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">
                ⚠️ Error: {error.message}
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Spacer for floating input */}
        <div className="h-32" />

        {/* Floating Input - 相对聊天容器定位 */}
        <ChatInput
          onSubmit={handleSendMessage}
          disabled={isLoading}
          variant="floating"
          currentMode={mode}
        />
      </div>
  );
}
