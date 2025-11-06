"use client";

import { useState } from 'react';

interface ChatInputProps {
  onSubmit: (message: string, mode: 'ask' | 'research') => void;
  disabled?: boolean;
  variant?: 'inline' | 'floating'; // 内联或悬浮
  currentMode?: 'ask' | 'research'; // 当前会话模式
}

export default function ChatInput({
  onSubmit,
  disabled = false,
  variant = 'floating',
  currentMode = 'ask'
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (mode: 'ask' | 'research') => {
    if (inputValue.trim() && !disabled) {
      onSubmit(inputValue.trim(), mode);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && !disabled) {
      handleSubmit(currentMode || 'ask'); // 使用当前模式
    }
  };

  // 根据 variant 决定容器样式
  const containerClass = variant === 'inline'
    ? "mb-8" // 内联:底部间距
    : "absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-4"; // 悬浮:定位

  // 根据 variant 决定卡片阴影
  const shadowClass = variant === 'inline'
    ? "shadow-sm hover:shadow-md" // 内联:轻阴影
    : "shadow-2xl hover:shadow-3xl"; // 悬浮:强阴影

  // 根据 variant 决定输入框 padding
  const inputPaddingClass = variant === 'inline'
    ? "p-4 md:p-6" // 内联:更大 padding
    : "p-4"; // 悬浮:标准 padding

  return (
    <div className={containerClass}>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 ${shadowClass} transition-shadow`}>
        <div className={inputPaddingClass}>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Challenge Surf AI with your crypto curiosity"
              disabled={disabled}
              className={`flex-1 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent dark:text-white disabled:opacity-50 ${
                variant === 'inline' ? 'text-base md:text-lg' : 'text-base'
              }`}
            />
            <button
              onClick={() => handleSubmit('ask')}
              disabled={disabled || !inputValue.trim()}
              className="px-6 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white hover:shadow-md hover:scale-105 disabled:hover:scale-100 whitespace-nowrap"
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
