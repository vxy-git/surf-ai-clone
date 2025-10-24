"use client";

import { useChat } from 'ai/react';
import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import FloatingInput from '@/components/FloatingInput';
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

  const { messages, isLoading, error, append } = useChat({
    api: mode === 'research' ? '/api/research' : '/api/chat',
    initialMessages: initialMessages,
  });

  // 会话切换时重置
  useEffect(() => {
    if (sessionId !== currentSessionIdRef.current) {
      currentSessionIdRef.current = sessionId;
      lastSyncedLength.current = initialMessages.length;
      hasAutoSent.current = false;
    }
  }, [sessionId, initialMessages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 同步消息到会话 - 只在消息数量增加时同步
  useEffect(() => {
    if (messages.length > lastSyncedLength.current && messages.length > 0) {
      lastSyncedLength.current = messages.length;
      onUpdateMessages(sessionId, messages);
    }
  }, [messages, sessionId, onUpdateMessages]);

  // 如果是新会话且有初始消息,自动发送一次
  useEffect(() => {
    if (initialMessage && messages.length === 0 && !hasAutoSent.current) {
      hasAutoSent.current = true;
      append({ role: 'user', content: initialMessage });
    }
  }, [initialMessage, messages.length, append]);

  const handleSendMessage = (message: string, newMode: 'ask' | 'research') => {
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

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-[#de5586] to-[#de99a7] text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-xl font-bold mt-4 mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold mt-3 mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-bold mt-2 mb-1">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                        p: ({ children }) => <p className="my-2">{children}</p>,
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded text-sm">
                              {children}
                            </code>
                          ) : (
                            <code className="block bg-gray-200 dark:bg-gray-600 p-2 rounded text-sm overflow-x-auto">
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
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
        <FloatingInput
          onSubmit={handleSendMessage}
          disabled={isLoading}
          relative={true}
        />
      </div>
  );
}
