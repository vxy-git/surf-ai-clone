"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useChatSessions } from "@/hooks/useChatSessions";
import { PaymentModalProvider } from "@/contexts/PaymentModalContext";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

export default function AboutPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();
  const about = t('about') as unknown as Record<string, string>; // 获取 about 对象

  const {
    sessions,
    currentSessionId,
    deleteSession,
    selectSession,
    startNewChat,
  } = useChatSessions();

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setSidebarOpen(!isMobile);
  }, []);

  // 包装回调函数，在导航到主页后再执行操作
  const handleNewChat = () => {
    router.push('/');
    startNewChat();
  };

  const handleSelectSession = (sessionId: string) => {
    router.push('/');
    selectSession(sessionId);
  };

  return (
    <PaymentModalProvider>
      <div className="flex h-screen bg-[#f7f7f7] dark:bg-gray-900">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={deleteSession}
        />

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部导航栏 */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] bg-clip-text text-transparent">
                {about.title}
              </h1>
            </div>
            <Link
              href="/"
              className="px-6 py-2 bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white rounded-full font-medium hover:shadow-lg hover:scale-105 transition-all"
            >
              {about.launchApp} →
            </Link>
          </header>

          {/* 内容区域 */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-12">
              {/* Hero Section */}
              <section className="mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] bg-clip-text text-transparent">
                  {about.heroTitle}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {about.heroSubtitle}
                </p>
              </section>

              {/* Vision Section */}
              <section className="mb-16">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  {about.visionTitle}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {about.visionText}
                </p>
              </section>

              {/* Core Architecture Section */}
              <section className="mb-16">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {about.architectureTitle}
                </h3>
                <div className="space-y-6">
                  {/* Agent Layer */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-xl font-semibold mb-3 text-[#A78BFA]">
                      {about.agentLayer}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {about.agentLayerDesc}
                    </p>
                  </div>

                  {/* Flow Layer */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-xl font-semibold mb-3 text-[#A78BFA]">
                      {about.flowLayer}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {about.flowLayerDesc}
                    </p>
                  </div>

                  {/* Incentive Layer */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-xl font-semibold mb-3 text-[#A78BFA]">
                      {about.incentiveLayer}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {about.incentiveLayerDesc}
                    </p>
                  </div>
                </div>
              </section>

              {/* Key Capabilities Section */}
              <section className="mb-16">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {about.capabilitiesTitle}
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-[#A78BFA] text-xl mt-1">•</span>
                    <div>
                      <strong className="text-gray-900 dark:text-white">{about.capability1}</strong>
                      <p className="text-gray-600 dark:text-gray-300">{about.capability1Desc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#A78BFA] text-xl mt-1">•</span>
                    <div>
                      <strong className="text-gray-900 dark:text-white">{about.capability2}</strong>
                      <p className="text-gray-600 dark:text-gray-300">{about.capability2Desc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#A78BFA] text-xl mt-1">•</span>
                    <div>
                      <strong className="text-gray-900 dark:text-white">{about.capability3}</strong>
                      <p className="text-gray-600 dark:text-gray-300">{about.capability3Desc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#A78BFA] text-xl mt-1">•</span>
                    <div>
                      <strong className="text-gray-900 dark:text-white">{about.capability4}</strong>
                      <p className="text-gray-600 dark:text-gray-300">{about.capability4Desc}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#A78BFA] text-xl mt-1">•</span>
                    <div>
                      <strong className="text-gray-900 dark:text-white">{about.capability5}</strong>
                      <p className="text-gray-600 dark:text-gray-300">{about.capability5Desc}</p>
                    </div>
                  </li>
                </ul>
              </section>

              {/* What You Can Do Section */}
              <section className="mb-16">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {about.useCasesTitle}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold mb-2 text-[#A78BFA]">{about.useCase1}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{about.useCase1Desc}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold mb-2 text-[#A78BFA]">{about.useCase2}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{about.useCase2Desc}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold mb-2 text-[#A78BFA]">{about.useCase3}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{about.useCase3Desc}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold mb-2 text-[#A78BFA]">{about.useCase4}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{about.useCase4Desc}</p>
                  </div>
                </div>
              </section>

              {/* For Builders & Power Users Section */}
              <section className="mb-16">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {about.buildersTitle}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                    <h4 className="text-xl font-semibold mb-4 text-[#7C3AED]">{about.forDevelopers}</h4>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {about.developersDesc}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                    <h4 className="text-xl font-semibold mb-4 text-[#7C3AED]">{about.forPowerUsers}</h4>
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {about.powerUsersDesc}
                    </p>
                  </div>
                </div>
              </section>

              {/* Roadmap Section */}
              <section className="mb-16">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {about.roadmapTitle}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-[#A78BFA]">✓</span>
                    <span>{about.roadmap1}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-[#A78BFA]">✓</span>
                    <span>{about.roadmap2}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-[#A78BFA]">✓</span>
                    <span>{about.roadmap3}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-[#A78BFA]">✓</span>
                    <span>{about.roadmap4}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-[#A78BFA]">✓</span>
                    <span>{about.roadmap5}</span>
                  </div>
                </div>
              </section>

              {/* Partners & Backers Section */}
              <section className="mb-16">
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">
                  {about.partnersTitle}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
                  {about.partnersSubtitle}
                </p>
                <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                  <div className="w-12 h-10 relative group cursor-pointer">
                    <img
                      src="/images/b1v.png"
                      alt="B1V"
                      className="w-full h-full object-contain opacity-40 group-hover:opacity-100 transition-all duration-300"
                      style={{ filter: 'brightness(0) saturate(100%) invert(58%) sepia(28%) saturate(1449%) hue-rotate(215deg) brightness(98%) contrast(96%)' }}
                    />
                  </div>
                  <div className="w-20 h-10 relative group cursor-pointer">
                    <img
                      src="/images/fenbushi.png"
                      alt="Fenbushi Capital"
                      className="w-full h-full object-contain opacity-40 group-hover:opacity-100 transition-all duration-300"
                      style={{ filter: 'brightness(0) saturate(100%) invert(58%) sepia(28%) saturate(1449%) hue-rotate(215deg) brightness(98%) contrast(96%)' }}
                    />
                  </div>
                  <div className="w-20 h-10 relative group cursor-pointer">
                    <img
                      src="/images/ledger.png"
                      alt="Ledger"
                      className="w-full h-full object-contain opacity-40 group-hover:opacity-100 transition-all duration-300"
                      style={{ filter: 'brightness(0) saturate(100%) invert(58%) sepia(28%) saturate(1449%) hue-rotate(215deg) brightness(98%) contrast(96%)' }}
                    />
                  </div>
                  <div className="w-20 h-10 relative group cursor-pointer">
                    <img
                      src="/images/mask.png"
                      alt="Mask Network"
                      className="w-full h-full object-contain opacity-40 group-hover:opacity-100 transition-all duration-300"
                      style={{ filter: 'brightness(0) saturate(100%) invert(58%) sepia(28%) saturate(1449%) hue-rotate(215deg) brightness(98%) contrast(96%)' }}
                    />
                  </div>
                  <div className="w-20 h-10 relative group cursor-pointer">
                    <img
                      src="/images/republic.png"
                      alt="Republic"
                      className="w-full h-full object-contain opacity-40 group-hover:opacity-100 transition-all duration-300"
                      style={{ filter: 'brightness(0) saturate(100%) invert(58%) sepia(28%) saturate(1449%) hue-rotate(215deg) brightness(98%) contrast(96%)' }}
                    />
                  </div>
                  <div className="w-24 h-10 relative group cursor-pointer">
                    <img
                      src="/images/skyland.png"
                      alt="Skyland Ventures"
                      className="w-full h-full object-contain opacity-40 group-hover:opacity-100 transition-all duration-300"
                      style={{ filter: 'brightness(0) saturate(100%) invert(58%) sepia(28%) saturate(1449%) hue-rotate(215deg) brightness(98%) contrast(96%)' }}
                    />
                  </div>
                  <div className="w-24 h-10 relative group cursor-pointer">
                    <img
                      src="/images/uphonest.png"
                      alt="Uphonest Capital"
                      className="w-full h-full object-contain opacity-40 group-hover:opacity-100 transition-all duration-300"
                      style={{ filter: 'brightness(0) saturate(100%) invert(58%) sepia(28%) saturate(1449%) hue-rotate(215deg) brightness(98%) contrast(96%)' }}
                    />
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer className="pt-12 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                <p className="mb-4">
                  {about.footerText}
                </p>
                <div className="flex justify-center gap-6 text-sm mb-6">
                  <a href="#" className="hover:text-[#A78BFA] transition-colors">{about.documentation}</a>
                  <a href="#" className="hover:text-[#A78BFA] transition-colors">{about.careers}</a>
                  <a href="#" className="hover:text-[#A78BFA] transition-colors">{about.terms}</a>
                  <a href="#" className="hover:text-[#A78BFA] transition-colors">{about.privacy}</a>
                </div>
                <div className="flex justify-center items-center gap-6 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{about.social}</span>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#A78BFA] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    {about.twitter}
                  </a>
                  <a
                    href="https://discord.gg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#A78BFA] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    {about.discord}
                  </a>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#A78BFA] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                    </svg>
                    {about.github}
                  </a>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </PaymentModalProvider>
  );
}
