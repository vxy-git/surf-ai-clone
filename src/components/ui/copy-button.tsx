/**
 * CopyButton Component
 *
 * A button component for copying text to clipboard with visual feedback
 */

'use client';

import { useState } from 'react';
import { Copy, CheckCheck } from '@/components/icons';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <CheckCheck size={16} className="text-green-500" />
      ) : (
        <Copy size={16} className="text-gray-500 dark:text-gray-400" />
      )}
    </button>
  );
}
