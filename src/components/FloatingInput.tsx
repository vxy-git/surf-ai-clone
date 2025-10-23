"use client";

import { useState } from 'react';

interface FloatingInputProps {
  onSubmit: (message: string, mode: 'ask' | 'research') => void;
  disabled?: boolean;
  relative?: boolean; // 是否使用相对定位
}

export default function FloatingInput({ onSubmit, disabled = false, relative = false }: FloatingInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (mode: 'ask' | 'research') => {
    if (inputValue.trim() && !disabled) {
      onSubmit(inputValue.trim(), mode);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && !disabled) {
      handleSubmit('ask');
    }
  };

  const positionClass = relative
    ? "absolute bottom-6 left-1/2 -translate-x-1/2"
    : "fixed bottom-6 left-1/2 -translate-x-1/2";

  return (
    <div className={`${positionClass} z-30 w-full max-w-3xl px-4`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl hover:shadow-3xl transition-shadow">
        <div className="p-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Challenge Surf AI with your crypto curiosity..."
            disabled={disabled}
            className="w-full text-base outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent dark:text-white disabled:opacity-50"
          />
        </div>
        <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSubmit('ask')}
            disabled={disabled || !inputValue.trim()}
            className="px-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ask
          </button>
          <button
            onClick={() => handleSubmit('research')}
            disabled={disabled || !inputValue.trim()}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#de5586] to-[#de99a7] text-white text-sm hover:shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
