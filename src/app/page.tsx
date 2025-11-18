"use client";

import { ArrowRight, Zap, Globe, GitBranch, Package } from "@/components/icons";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/i18n/languages";
import { useTranslation } from "@/hooks/useTranslation";

export default function HomePage() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const home = t("home");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const LANG_LABELS: Record<Language, string> = {
    en: "English",
    ja: "日本語",
    "zh-CN": "中文",
  };
  const agentTypes: string[] = home.agentTypes ?? [];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* 顶部横幅 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4">
        <div className="mx-auto flex items-center justify-between max-w-7xl">
          <p className="font-bold uppercase tracking-wide text-sm sm:text-base">
            {home.bannerTitle}
          </p>
          <a
            href="/chat"
            className="whitespace-nowrap bg-white hover:scale-105 transition-all text-purple-600 px-4 py-2 rounded font-semibold text-sm sm:text-base"
          >
            {home.bannerButton}
          </a>
        </div>
      </div>

      {/* 导航栏 */}
      <nav className="bg-black/90 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold text-white tracking-tight">
              {home.brand}
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/aqora-io"
                className="text-white uppercase font-semibold hover:text-purple-400 transition-colors text-sm"
              >
                {home.gitbookLabel}
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://x.com/aqora_ai"
                className="text-white uppercase font-semibold hover:text-purple-400 transition-colors text-sm"
              >
                {home.xLabel}
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://t.me/aqora_ai"
                className="text-white uppercase font-semibold hover:text-purple-400 transition-colors text-sm"
              >
                {home.telegramLabel}
              </a>
              {/* 语言选择器 */}
              <div className="relative group">
                <button
                  aria-haspopup="true"
                  aria-expanded="false"
                  className="flex items-center gap-2 text-white uppercase font-semibold hover:text-purple-400 transition-colors text-sm"
                >
                  <Globe className="w-5 h-5" />
                  <span>{LANG_LABELS[language]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 text-black dark:text-white rounded-md shadow-lg border border-purple-500/30 hidden group-hover:block">
                  <ul className="py-2">
                    {Object.entries(LANG_LABELS).map(([code, label]) => (
                      <li key={code}>
                        <button
                          type="button"
                          onClick={() => setLanguage(code as Language)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between"
                        >
                          <span>{label}</span>
                          {language === (code as Language) ? (
                            <span className="text-purple-600">•</span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* 移动端汉堡菜单按钮 */}
            <button
              type="button"
              className="md:hidden text-white p-2 rounded"
              aria-label="打开菜单"
              aria-expanded={isMobileOpen}
              onClick={() => setIsMobileOpen((v) => !v)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-7 h-7"
              >
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </svg>
            </button>
          </div>
          {/* 移动端导航列表 */}
          {isMobileOpen && (
            <div className="md:hidden mt-2 bg-black/95 border-t border-purple-500/30 rounded-b">
              <ul className="px-4 py-4 space-y-4">
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://github.com/aqora-io"
                    className="block text-white font-semibold hover:text-purple-400 transition-colors"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {home.gitbookLabel}
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://x.com/aqora_ai"
                    className="block text-white font-semibold hover:text-purple-400 transition-colors"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {home.xLabel}
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://t.me/aqora_ai"
                    className="block text-white font-semibold hover:text-purple-400 transition-colors"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {home.telegramLabel}
                  </a>
                </li>
                <li className="pt-2 border-t border-purple-500/30">
                  <div className="text-gray-300 uppercase text-sm mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>{LANG_LABELS[language]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(LANG_LABELS).map(([code, label]) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setLanguage(code as Language);
                          setIsMobileOpen(false);
                        }}
                        className={`px-3 py-2 rounded text-left border ${
                          language === (code as Language)
                            ? "bg-purple-600 border-purple-600 text-white"
                            : "bg-transparent border-purple-500/30 text-white hover:bg-white hover:text-black dark:hover:bg-gray-800 dark:hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Hero 区域 */}
      <section className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-black py-20 md:py-32 overflow-hidden">
        {/* 装饰性背景 */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {home.heroTitle?.[0]} <br className="hidden sm:block" /> {home.heroTitle?.[1]}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {home.heroSubtitle}
            </p>
            <a
              href="/chat"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:scale-105 transition-transform"
            >
              {home.heroButton}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Welcome 区域 */}
      <section className="relative bg-black text-white py-16 md:py-32">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center md:items-start justify-center gap-10 md:gap-36">
          <div className="w-full md:w-auto text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {home.welcomeTitle}
            </h2>
            <p className="text-base sm:text-lg md:text-2xl text-gray-300 mb-6 md:mb-8 max-w-3xl mx-auto md:mx-0">
              {home.welcomeLine1}
              <br />
              {home.welcomeLine2}
            </p>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://t.me/aqora_ai"
              className="inline-block w-full sm:w-auto bg-transparent border-2 border-purple-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-purple-600 hover:border-purple-600 transition-colors"
            >
              {home.welcomeButton}
            </a>
          </div>

          {/* Agent Types 右侧纵向滚动展示 */}
          <div className="py-8 md:py-16 w-full md:w-auto">
            <div className="relative ml-auto md:ml-0 mx-auto w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-96 overflow-hidden vertical-mask">
              <div className="flex flex-col animate-scroll-vertical gap-6">
                {/* 第一组 */}
                {agentTypes.map((type, index) => (
                  <div
                    key={`first-${index}`}
                    className="flex-shrink-0 text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold whitespace-nowrap bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                  >
                    {type}
                  </div>
                ))}
                {/* 第二组 - 无缝循环 */}
                {agentTypes.map((type, index) => (
                  <div
                    key={`second-${index}`}
                    className="flex-shrink-0 text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold whitespace-nowrap bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                  >
                    {type}
                  </div>
                ))}
              </div>
              {/* 中间高亮带 */}
              <div className="highlight-band" />
            </div>
          </div>
        </div>
      </section>

      {/* Architecture 区域 */}
      <section className="bg-gradient-to-br from-purple-900 to-blue-900 text-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mb-12 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{home.archTitle}</h2>
            <p className="text-2xl md:text-3xl font-semibold mb-8 text-gray-300">
              {home.archSubtitle}
            </p>
            <a
              href="/chat"
              className="inline-block bg-white text-purple-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              {home.archButton}
            </a>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{home.feature1Title}</h3>
              <p className="text-gray-200 leading-relaxed">
                {home.feature1Desc}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{home.feature2Title}</h3>
              <p className="text-gray-200 leading-relaxed">
                {home.feature2Desc}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <GitBranch className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{home.feature3Title}</h3>
              <p className="text-gray-200 leading-relaxed">
                {home.feature3Desc}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{home.feature4Title}</h3>
              <p className="text-gray-200 leading-relaxed">
                {home.feature4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Build the Future 区域 */}
      <section className="relative bg-black py-32 md:py-40 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1/3 bg-gradient-to-b from-purple-500/70 via-purple-500/20 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-16 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {home.buildTitle}
          </h2>
          <a
            href="/chat"
            className="inline-block bg-white border-2 border-white text-black px-8 py-4 rounded-lg font-semibold text-lg hover:scale-105 transition-transform"
          >
            {home.buildButton}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12 md:py-16">
        <div className="container mx-auto max-w-[1200px] w-full px-4">
          <div className="flex flex-col md:flex-row justify-between gap-8 items-center md:items-start">
            <div className="text-center md:text-left">
              <div
                className="text-4xl md:text-6xl font-bold mb-6"
                style={{ fontFamily: "monospace" }}
              >
                {home.brand}
              </div>
              <h3 className="text-xl md:text-2xl font-bold">{home.footerTagline}</h3>
            </div>
            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="space-y-2 flex flex-col items-center md:items-end">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/aqora-io"
                  className="block font-semibold hover:text-purple-200 transition-colors"
                >
                  {home.gitbookLabel}
                </a>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://x.com/aqora_ai"
                  className="block font-semibold hover:text-purple-200 transition-colors"
                >
                  {home.xLabel}
                </a>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://t.me/aqora_ai"
                  className="block font-semibold hover:text-purple-200 transition-colors"
                >
                  {home.telegramLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll-vertical {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .animate-scroll-vertical {
          animation: scroll-vertical 24s linear infinite;
        }
        .vertical-mask {
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent,
            black 50%,
            black 55%,
            transparent
          );
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 50%,
            black 55%,
            transparent
          );
        }
        .highlight-band {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          height: 56px;
          pointer-events: none;
          backdrop-filter: brightness(1.2);
          background: rgba(147, 51, 234, 0.1);
          border-top: 1px solid rgba(147, 51, 234, 0.3);
          border-bottom: 1px solid rgba(147, 51, 234, 0.3);
        }
        @media (max-width: 768px) {
          .highlight-band {
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
}
