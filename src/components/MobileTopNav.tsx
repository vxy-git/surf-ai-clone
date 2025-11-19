"use client";

import { useState } from "react";
import { Globe, Sun, Moon, Monitor } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/hooks/useTranslation";
import type { Language } from "@/i18n/languages";

export default function MobileTopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const LANG_LABELS: Record<Language, string> = {
    en: "English",
    ja: "日本語",
    "zh-CN": "中文",
  };

  return (
    <nav className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* 品牌 Logo */}
        <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Aqora.ai
        </div>

        {/* 汉堡菜单按钮 */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-gray-700 dark:text-gray-300"
          >
            {isOpen ? (
              <>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </>
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* 展开菜单 */}
      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-4 py-4 space-y-4">
            {/* 主题切换 */}
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {t("appearance")}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setTheme("system");
                    setIsOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                    theme === "system"
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-xs">{t("themeSystem")}</span>
                </button>
                <button
                  onClick={() => {
                    setTheme("light");
                    setIsOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                    theme === "light"
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-xs">{t("themeLight")}</span>
                </button>
                <button
                  onClick={() => {
                    setTheme("dark");
                    setIsOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                    theme === "dark"
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span className="text-xs">{t("themeDark")}</span>
                </button>
              </div>
            </div>

            {/* 语言切换 */}
            <div>
              <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t("language")}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(LANG_LABELS).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => {
                      setLanguage(code as Language);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      language === (code as Language)
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-transparent border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 快捷链接 */}
            {/* <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <a
                href="/about"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {t("aboutProject")}
              </a>
            </div> */}
          </div>
        </div>
      )}
    </nav>
  );
}
