"use client";

import { useChat } from 'ai/react';
import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import ChatInput from '@/components/ChatInput';
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
    streamProtocol: 'text',
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

  // 在流结束时强制同步，确保助手完整内容被保存
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      onUpdateMessages(sessionId, messages);
    }
  }, [isLoading, messages, sessionId, onUpdateMessages]);

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
              key={message.id || `${message.role}-${Math.random().toString(36).slice(2)}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-[#de5586] text-white rounded-br-none'
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
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#de5586] animate-pulse" />
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
