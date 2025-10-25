"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { ChatSession } from "@/types/chat";
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
}

export default function Sidebar({
  isOpen,
  onToggle,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat
}: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

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
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full md:translate-x-0 md:w-16'}
      `}>
        {/* Logo and Toggle */}
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center transition-all duration-300 ${isOpen ? 'justify-between' : 'justify-between md:justify-center'}`}>
          <div className={`flex items-center gap-2 ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
            <Image
              src="https://ext.same-assets.com/501684899/3670575781.svg"
              alt="Surf"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold whitespace-nowrap">Surf</span>
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
              className={`w-full flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all ${isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-3 py-2.5 md:justify-center md:px-0'}`}
            >
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span className={`font-medium whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>{t("newChat")}</span>
            </button>

            {/* Crypto Data Hub */}
            {/* <Link href="/hub" className={`w-full flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mt-1 transition-all ${isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-3 py-2.5 md:justify-center md:px-0'}`}>
              <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
              </svg>
              <span className={`font-medium whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>{t("cryptoDataHub")}</span>
              <span className={`ml-auto bg-gradient-to-r from-[#de5586] to-[#de99a7] text-white text-xs px-2 py-1 rounded-full whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>
                {t("preTgeReport")}
              </span>
            </Link> */}

            {/* Divider */}
            {isOpen && <div className="my-3 border-t border-gray-200 dark:border-gray-700" />}

            {/* Chat History */}
            {isOpen && sessions.length > 0 && (
              <div className="mb-2">
                {/* <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 mb-2">今天</p> */}
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                      currentSessionId === session.id
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <svg
                      className={`shrink-0 ${currentSessionId === session.id ? 'text-[#de5586]' : ''}`}
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
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Settings */}
        <div className="border-t border-gray-200 dark:border-gray-700">
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
    </>
  );
}
