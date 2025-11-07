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

              {/* Footer */}
              <footer className="pt-12 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
                <p className="mb-4">
                  {about.footerText}
                </p>
                <div className="flex justify-center gap-6 text-sm">
                  <a href="#" className="hover:text-[#A78BFA] transition-colors">{about.documentation}</a>
                  <a href="#" className="hover:text-[#A78BFA] transition-colors">{about.careers}</a>
                  <a href="#" className="hover:text-[#A78BFA] transition-colors">{about.terms}</a>
                  <a href="#" className="hover:text-[#A78BFA] transition-colors">{about.privacy}</a>
                </div>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </PaymentModalProvider>
  );
}
