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

  // 根据 variant 决定按钮容器 padding
  const buttonPaddingClass = variant === 'inline'
    ? "px-4 md:px-6 pb-4" // 内联:与输入框一致
    : "px-4 pb-4"; // 悬浮:标准 padding

  return (
    <div className={containerClass}>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 ${shadowClass} transition-shadow`}>
        <div className={inputPaddingClass}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Challenge Surf AI with your crypto curiosity"
            disabled={disabled}
            className={`w-full outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent dark:text-white disabled:opacity-50 ${
              variant === 'inline' ? 'text-base md:text-lg' : 'text-base'
            }`}
          />
        </div>
        <div className={`${buttonPaddingClass} flex items-center gap-2 flex-wrap`}>
          <button
            onClick={() => handleSubmit('ask')}
            disabled={disabled || !inputValue.trim()}
            className={`px-4 py-1.5 rounded-full text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              currentMode === 'ask'
                ? 'bg-gradient-to-r from-[#de5586] to-[#de99a7] text-white hover:shadow-md hover:scale-105 disabled:hover:scale-100'
                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400'
            }`}
          >
            Ask
          </button>
          <button
            onClick={() => handleSubmit('research')}
            disabled={disabled || !inputValue.trim()}
            className={`px-4 py-1.5 rounded-full text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              currentMode === 'research'
                ? 'bg-gradient-to-r from-[#de5586] to-[#de99a7] text-white hover:shadow-md hover:scale-105 disabled:hover:scale-100'
                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400'
            }`}
          >
            Research
          </button>
          <button
            disabled
            className="px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 transition-all flex items-center gap-1 opacity-50 cursor-not-allowed"
          >
            Executor
            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">Beta</span>
          </button>
        </div>
      </div>
    </div>
  );
}
