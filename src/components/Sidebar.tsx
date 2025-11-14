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
import { Menu, Plus, Sun, Moon, Monitor, Globe, Trash2, MessageSquare, Info, Check } from "@/components/icons";

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
      return <Sun size={20} />;
    }
    if (theme === "dark") {
      return <Moon size={20} />;
    }
    return <Monitor size={20} />;
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
        backdrop-blur-2xl backdrop-saturate-150
        bg-white/85 dark:bg-gray-900/85
        border-r-2 border-white/30 dark:border-gray-700/60
        shadow-[0_0_60px_rgba(0,0,0,0.1)] dark:shadow-[0_0_60px_rgba(0,0,0,0.4)]
        flex flex-col
        z-50
        md:transition-none transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full md:translate-x-0 md:w-16'}
      `}>
        {/* Logo and Toggle */}
        <div className={`p-4 border-b border-white/20 dark:border-gray-700/50 flex items-center ${isOpen ? 'justify-between' : 'justify-between md:justify-center'}`}>
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
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-custom scroll-smooth">
          <div className="p-3">
            {/* New Chat */}
            <button
              onClick={onNewChat}
              className={`w-full flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-3 py-2.5 md:justify-center md:px-0'}`}
            >
              <Plus size={20} className="shrink-0" />
              <span className={`font-medium whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>{t("newChat")}</span>
            </button>

            {/* About Project */}
            <a
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mt-1 transition-colors ${isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-3 py-2.5 md:justify-center md:px-0'}`}
            >
              <Info size={20} className="shrink-0" />
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
              <span className={`ml-auto bg-gradient-to-r from-[#19c8ff] to-[#0aa3d8] text-white text-xs px-2 py-1 rounded-full whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>
                {t("preTgeReport")}
              </span>
            </Link> */}

            {/* Divider */}
            {isOpen && <div className="my-3 border-t border-white/20 dark:border-gray-700/50" />}

            {/* Chat History */}
            {isOpen && (
              <div className="mb-2">
                {/* Loading State */}
                {loading && (
                  <div className="px-3 py-4 text-center">
                    <div className="inline-flex h-2 w-2 rounded-full bg-[#19c8ff] animate-pulse" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t("loadingHistory")}</p>
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
                      <MessageSquare
                        size={16}
                        className={`shrink-0 ${currentSessionId === session.id ? 'text-[#19c8ff]' : ''}`}
                      />
                      <span className="text-sm font-medium truncate">{session.title}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="shrink-0 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title={t("deleteSession")}
                    >
                      <Trash2
                        size={14}
                        className="text-red-600 dark:text-red-400"
                      />
                    </button>
                  </div>
                ))}

                {/* Empty State */}
                {!loading && !error && sessions.length === 0 && (
                  <div className="px-3 py-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("noHistory")}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Settings */}
        <div className="border-t border-white/20 dark:border-gray-700/50">
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
                  <Monitor size={20} />
                  <span className="flex-1">{t("themeSystem")}</span>
                  {theme === "system" && <Check size={16} />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
                  <Sun size={20} />
                  <span className="flex-1">{t("themeLight")}</span>
                  {theme === "light" && <Check size={16} />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
                  <Moon size={20} />
                  <span className="flex-1">{t("themeDark")}</span>
                  {theme === "dark" && <Check size={16} />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`w-full flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all outline-none border-none ${isOpen ? 'px-3 py-2.5' : 'justify-center px-3 py-2.5 md:justify-center md:px-0'}`}>
                  <Globe size={20} className="shrink-0" />
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
                  {language === "zh-CN" && <Check size={16} />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")} className="gap-2">
                  <span className="text-lg">🇺🇸</span>
                  <span className="flex-1">English</span>
                  {language === "en" && <Check size={16} />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ja")} className="gap-2">
                  <span className="text-lg">🇯🇵</span>
                  <span className="flex-1">日本語</span>
                  {language === "ja" && <Check size={16} />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ko")} className="gap-2">
                  <span className="text-lg">🇰🇷</span>
                  <span className="flex-1">한국어</span>
                  {language === "ko" && <Check size={16} />}
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
