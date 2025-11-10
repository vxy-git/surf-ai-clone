/**
 * Enhanced Markdown Renderer
 *
 * A custom Markdown renderer with syntax highlighting, copy buttons,
 * and enhanced styling for AI chat responses
 */

'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyButton } from '@/components/ui/copy-button';
import { useTheme } from '@/contexts/ThemeContext';
import type {
  HTMLAttributes,
  AnchorHTMLAttributes,
  TableHTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
} from 'react';
// 移除严格的 Components 类型以避免自定义渲染返回类型与原生元素的冲突

interface MarkdownRendererProps {
  children: string;
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const components = {
    // Code block with syntax highlighting
    code({ node, className, children, ...props }: HTMLAttributes<HTMLElement> & { node?: unknown; className?: string; children?: React.ReactNode }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');

      // 仅当存在语言并且内容包含换行时，按代码块渲染
      if (language && codeString.includes('\n')) {
        return (
          <div className="relative group my-4">
            {/* Language label */}
            <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                {language}
              </span>
              <CopyButton text={codeString} />
            </div>
            {/* Code content */}
            <div className="rounded-b-lg overflow-x-auto scrollbar-custom">
              <SyntaxHighlighter
                language={language}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: '0 0 0.5rem 0.5rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.7',
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  },
                }}
              >
                {codeString}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      }

      // Inline code
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },

    // Links with external icon
    a({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string; children?: ReactNode }) {
      const isExternal = href?.startsWith('http');
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-purple-600 dark:text-purple-400 hover:underline font-medium inline-flex items-center gap-1"
          {...props}
        >
          {children}
          {isExternal && (
            <svg
              className="w-3 h-3 inline-block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          )}
        </a>
      );
    },

    // Tables with responsive wrapper
    table({ children, ...props }: TableHTMLAttributes<HTMLTableElement> & { children?: ReactNode }) {
      return (
        <div className="overflow-x-auto -mx-4 px-4 my-4 scrollbar-custom">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props}>
            {children}
          </table>
        </div>
      );
    },

    // Blockquotes with enhanced styling
    blockquote({ children, ...props }: HTMLAttributes<HTMLElement> & { children?: ReactNode }) {
      return (
        <blockquote
          className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 pl-4 pr-4 py-3 my-4 rounded-r-lg"
          {...props}
        >
          {children}
        </blockquote>
      );
    },

    // Headings with anchor links
    h1({ children, ...props }: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
      return (
        <h1 className="text-3xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100" {...props}>
          {children}
        </h1>
      );
    },
    h2({ children, ...props }: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
      return (
        <h2 className="text-2xl font-bold mt-5 mb-3 text-gray-900 dark:text-gray-100" {...props}>
          {children}
        </h2>
      );
    },
    h3({ children, ...props }: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
      return (
        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100" {...props}>
          {children}
        </h3>
      );
    },

    // Lists with custom markers
    ul({ children, ...props }: HTMLAttributes<HTMLUListElement> & { children?: ReactNode }) {
      return (
        <ul className="list-disc list-outside ml-6 my-4 space-y-2" {...props}>
          {children}
        </ul>
      );
    },
    ol({ children, ...props }: HTMLAttributes<HTMLOListElement> & { children?: ReactNode }) {
      return (
        <ol className="list-decimal list-outside ml-6 my-4 space-y-2" {...props}>
          {children}
        </ol>
      );
    },

    // Paragraphs
    p({ children, ...props }: HTMLAttributes<HTMLParagraphElement> & { children?: ReactNode }) {
      return (
        <p className="my-4 leading-7 text-gray-700 dark:text-gray-300" {...props}>
          {children}
        </p>
      );
    },

    // Images with lazy loading
    img({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
      return (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="rounded-lg my-4 max-w-full h-auto"
          {...props}
        />
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}
