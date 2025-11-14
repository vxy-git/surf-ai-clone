"use client";

import { useChat } from 'ai/react';
import { useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import ChatInput from '@/components/ChatInput';
import { useUsage } from '@/hooks/useUsage';
import { usePaymentModal } from '@/contexts/PaymentModalContext';
import { useTranslation } from '@/hooks/useTranslation';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';
import type { Message } from 'ai/react';
import { Bot, AlertTriangle, Loader2 } from '@/components/icons';

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
  const { refresh, checkCanUse } = useUsage();
  const { openPaymentModal, setPendingMessage, setOnPaymentSuccessCallback } = usePaymentModal();
  const { t } = useTranslation();

  const { messages, setMessages, isLoading, error, append } = useChat({
    api: mode === 'research' ? '/api/research' : '/api/chat',
    id: sessionId, // 使用sessionId作为会话标识
    initialMessages: initialMessages,
    streamProtocol: 'data',
    headers: {
      'x-wallet-address': address || ''
    },
    onFinish: async () => {
      // AI 响应成功后，刷新额度显示
      // 注意：额度扣除在服务端完成，这里只刷新 UI
      await refresh();
      console.log('[ChatInterface] Usage refreshed after AI response');
    },
    onError: (err) => {
      console.error('[ChatInterface] AI request error:', err);

      // 区分错误类型，给出友好提示
      const errorMessage = err.message || '';

      if (errorMessage.includes('user quota') || errorMessage.includes('quota is not enough')) {
        console.warn('[ChatInterface] CometAPI quota insufficient, please top up');
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
        console.warn('[ChatInterface] Server error, deducted credits will not be refunded (AI inference cost incurred)');
      } else if (errorMessage.includes('timeout') || errorMessage.includes('NetworkError')) {
        console.warn('[ChatInterface] Network connection interrupted, deducted credits will not be refunded (please check network stability)');
      } else if (errorMessage.includes('402') || errorMessage.includes('Payment required')) {
        console.log('[ChatInterface] Insufficient credits, no credits deducted');

        // 保存待发送的消息到 Context (从最后一条用户消息获取)
        const lastUserMessage = messages[messages.length - 1];
        if (lastUserMessage && lastUserMessage.role === 'user') {
          setPendingMessage({ content: lastUserMessage.content, mode: mode });

          // 设置支付成功后的自动重试回调
          setOnPaymentSuccessCallback(() => () => {
            console.log('[ChatInterface] Payment successful after 402 error, auto-retrying');
            append({ role: 'user', content: lastUserMessage.content });
          });
        }

        // 额度不足时，打开支付弹窗
        openPaymentModal();
      } else {
        console.warn('[ChatInterface] 未知错误:', errorMessage);
      }

      // 刷新额度显示（可能已被扣除）
      refresh();
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

        // 保存待发送的消息到 Context
        setPendingMessage({ content: initialMessage, mode: mode });

        // 设置支付成功后的自动重试回调
        setOnPaymentSuccessCallback(() => () => {
          console.log('[ChatInterface] Payment successful, auto-retrying initial message send');
          append({ role: 'user', content: initialMessage });
        });

        openPaymentModal();
        return;
      }

      append({ role: 'user', content: initialMessage });
    }
  }, [initialMessage, messages.length, append, checkCanUse, openPaymentModal, setPendingMessage, setOnPaymentSuccessCallback, mode]);

  const handleSendMessage = (message: string, newMode: 'ask' | 'research') => {
    // 发送前检查次数
    if (!checkCanUse()) {
      console.log('[ChatInterface] Usage quota exceeded, opening payment modal');

      // 保存待发送的消息到 Context
      setPendingMessage({ content: message, mode: newMode });

      // 设置支付成功后的自动重试回调
      // 注意: 需要包装两层箭头函数,因为 useState 会把函数参数当作函数式更新
      setOnPaymentSuccessCallback(() => () => {
        console.log('[ChatInterface] Payment successful, auto-retrying message send');
        append({ role: 'user', content: message });
      });

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
                <div className="mb-4 flex justify-center">
                  <Bot size={48} className="text-[#19c8ff]" />
                </div>
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
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[80%] md:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-[#19c8ff] text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-800 dark:text-white rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className="prose dark:prose-invert prose-sm max-w-none">
                  {message.role === 'assistant' ? (
                    <MarkdownRenderer>{message.content}</MarkdownRenderer>
                  ) : (
                    <p className="whitespace-pre-wrap my-0">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 dark:text-white rounded-2xl rounded-bl-none p-3 text-sm shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="text-[#19c8ff] animate-spin" />
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {mode === 'research' ? 'Researching...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-600 dark:text-red-400 text-sm font-semibold mb-2">
                    请求失败
                  </p>
                  <p className="text-red-600 dark:text-red-400 text-sm mb-2">
                    {error.message}
                  </p>
                  {(error.message.includes('user quota') || error.message.includes('quota is not enough') || error.message.includes('Token 配额')) && (
                    <div className="mt-2 border-t border-red-200 dark:border-red-700 pt-2">
                      <p className="text-xs text-red-500 dark:text-red-400 mb-2">
                        💡 {t('errorQuotaDescription')}
                      </p>
                      <button
                        onClick={() => {
                          // 可以在这里添加联系客服的逻辑,比如打开在线客服窗口
                          console.log('[ChatInterface] User clicked contact support for quota error');
                        }}
                        className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded text-xs hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors cursor-pointer"
                      >
                        💬 {t('errorContactSupport')}
                      </button>
                    </div>
                  )}
                  {(error.message.includes('500') ||
                    error.message.includes('timeout') ||
                    error.message.includes('NetworkError')) && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-2 border-t border-red-200 dark:border-red-700 pt-2">
                      💡 说明：AI 模型已开始处理您的请求（成本已产生），因此已扣除 1 次使用额度。这符合行业标准做法（类似 OpenAI、Claude API）。
                      <br />
                      如需重试，请重新发送消息。
                    </p>
                  )}
                  {error.message.includes('402') && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-2 border-t border-red-200 dark:border-red-700 pt-2">
                      💡 额度不足时不会扣除次数，请充值后重试。
                    </p>
                  )}
                </div>
              </div>
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
