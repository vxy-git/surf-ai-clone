"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useUsage } from "@/hooks/useUsage";
import { usePaymentModal } from "@/contexts/PaymentModalContext";
import { ChatSession } from "@/types/chat";
import { UsageIndicator } from "@/components/UsageIndicator";
import { PaymentModal } from "@/components/PaymentModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export default function Sidebar({
  isOpen,
  onToggle,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  loading = false,
  error = null
}: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const { refresh: refreshUsage } = useUsage();
  const { isPaymentModalOpen, openPaymentModal, closePaymentModal } = usePaymentModal();

  const getLanguageLabel = () => {
    switch (language) {
      case "zh-CN":
        return "简体中文";
      case "en":
        return "English";
      case "ja":
        return "日本語";
      case "ko":
        return "한국어";
      default:
        return "简体中文";
    }
  };

  const getThemeLabel = () => {
    if (theme === "light") return t("themeLight");
    if (theme === "dark") return t("themeDark");
    return t("themeSystem");
  };

  const getThemeIcon = () => {
    if (theme === "light") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      );
    }
    if (theme === "dark") {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative
        top-0 left-0 h-full
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        flex flex-col
        z-50
        md:transition-none transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full md:translate-x-0 md:w-16'}
      `}>
        {/* Logo and Toggle */}
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center ${isOpen ? 'justify-between' : 'justify-between md:justify-center'}`}>
          <div className={`flex items-center gap-2 ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
            <Image
              src="/images/logo.jpg"
              alt="FlowNet AI"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold whitespace-nowrap">FlowNet AI</span>
          </div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            {/* New Chat */}
            <button
              onClick={onNewChat}
              className={`w-full flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-3 py-2.5 md:justify-center md:px-0'}`}
            >
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span className={`font-medium whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>{t("newChat")}</span>
            </button>

            {/* About Project */}
            <a
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mt-1 transition-colors ${isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-3 py-2.5 md:justify-center md:px-0'}`}
            >
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <span className={`font-medium whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>{t("aboutProject")}</span>
            </a>

            {/* Crypto Data Hub */}
            {/* <Link href="/hub" className={`w-full flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mt-1 transition-all ${isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-3 py-2.5 md:justify-center md:px-0'}`}>
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
              </svg>
              <span className={`font-medium whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>{t("cryptoDataHub")}</span>
              <span className={`ml-auto bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white text-xs px-2 py-1 rounded-full whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>
                {t("preTgeReport")}
              </span>
            </Link> */}

            {/* Divider */}
            {isOpen && <div className="my-3 border-t border-gray-200 dark:border-gray-700" />}

            {/* Chat History */}
            {isOpen && (
              <div className="mb-2">
                {/* Loading State */}
                {loading && (
                  <div className="px-3 py-4 text-center">
                    <div className="inline-flex h-2 w-2 rounded-full bg-[#A78BFA] animate-pulse" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">加载聊天记录...</p>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="px-3 py-2 mx-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-xs text-red-600 dark:text-red-400">⚠️ {error}</p>
                  </div>
                )}

                {/* Sessions List */}
                {!loading && !error && sessions.length > 0 && sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      currentSessionId === session.id
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <button
                      onClick={() => onSelectSession(session.id)}
                      className="flex items-center gap-3 flex-1 text-left min-w-0"
                    >
                      <svg
                        className={`shrink-0 ${currentSessionId === session.id ? 'text-[#A78BFA]' : ''}`}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="text-sm font-medium truncate">{session.title}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="shrink-0 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="删除会话"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-red-600 dark:text-red-400"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Empty State */}
                {!loading && !error && sessions.length === 0 && (
                  <div className="px-3 py-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">暂无聊天记录</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Settings */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Usage Indicator - 只在展开时显示 */}
          {isOpen && (
            <div className="p-3 pb-0">
              <UsageIndicator onClick={openPaymentModal} />
            </div>
          )}

          <div className="p-3">
            {/* Appearance */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`w-full flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all outline-none border-none ${isOpen ? 'px-3 py-2.5' : 'justify-center px-3 py-2.5 md:justify-center md:px-0'}`}>
                  <div className="shrink-0">
                    {getThemeIcon()}
                  </div>
                  {isOpen && (
                    <>
                      <span className="font-medium whitespace-nowrap ml-3">{t("appearance")}</span>
                      <span className="bg-gradient-to-r from-pink-500 to-pink-400 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-3">
                        New
                      </span>
                      <div className="flex items-center gap-3 ml-auto">
                        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{getThemeLabel()}</span>
                        <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  <span className="flex-1">{t("themeSystem")}</span>
                  {theme === "system" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                  <span className="flex-1">{t("themeLight")}</span>
                  {theme === "light" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <span className="flex-1">{t("themeDark")}</span>
                  {theme === "dark" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`w-full flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all outline-none border-none ${isOpen ? 'px-3 py-2.5' : 'justify-center px-3 py-2.5 md:justify-center md:px-0'}`}>
                  <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  {isOpen && (
                    <>
                      <span className="font-medium whitespace-nowrap ml-3">{t("language")}</span>
                      <div className="flex items-center gap-3 ml-auto">
                        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{getLanguageLabel()}</span>
                        <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setLanguage("zh-CN")} className="gap-2">
                  <span className="text-lg">🇨🇳</span>
                  <span className="flex-1">简体中文</span>
                  {language === "zh-CN" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")} className="gap-2">
                  <span className="text-lg">🇺🇸</span>
                  <span className="flex-1">English</span>
                  {language === "en" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ja")} className="gap-2">
                  <span className="text-lg">🇯🇵</span>
                  <span className="flex-1">日本語</span>
                  {language === "ja" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ko")} className="gap-2">
                  <span className="text-lg">🇰🇷</span>
                  <span className="flex-1">한국어</span>
                  {language === "ko" && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        onPaymentSuccess={refreshUsage}
      />
    </>
  );
}
