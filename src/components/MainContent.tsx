"use client";

import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import WalletButton from "@/components/WalletButton";
import ChatInput from "@/components/ChatInput";

interface MainContentProps {
  onToggleSidebar: () => void;
  onStartChat: (message: string, mode: 'ask' | 'research') => void;
}

const hotQuestions = [
  {
    title: "Hyperliquid founder responds to FUD controversy — with $1.5B net outflow in 7 days, is HYPE below $34 a buy opportunity?",
    logo: "https://ext.same-assets.com/501684899/3289352998.png",
    tag: "Hyperliquid"
  },
  {
    title: "Monad's airdrop portal is open — after Paradigm's $225M investment, when will mainnet launch?",
    logo: "https://ext.same-assets.com/501684899/954613754.jpeg",
    tag: "Monad"
  },
  {
    title: "Rumored Polymarket Pro for professional traders — can prediction markets become mainstream financial tools?",
    logo: "https://ext.same-assets.com/501684899/3004725649.png",
    tag: "Polymarket"
  },
  {
    title: "After buying back 4.75% equity and token warrants, can community-funded real-time L2 MegaETH disrupt Ethereum's ecosystem?",
    logo: "https://ext.same-assets.com/501684899/508420880.png",
    tag: "MegaETH"
  },
  {
    title: "Does OpenMind have real product-market fit and competitive advantages?",
    logo: "https://ext.same-assets.com/501684899/664375940.jpeg",
    tag: "OpenMind"
  }
];

export default function MainContent({ onToggleSidebar, onStartChat }: MainContentProps) {
  const { t } = useTranslation();

  const agentTools = [
    {
      title: t("socialSentiment"),
      description: t("socialSentimentDesc"),
      icon: "💭"
    },
    {
      title: t("technicalAnalysis"),
      description: t("technicalAnalysisDesc"),
      icon: "📊"
    },
    {
      title: t("onchainTracker"),
      description: t("onchainTrackerDesc"),
      icon: "🔗"
    },
    {
      title: t("deepSearch"),
      description: t("deepSearchDesc"),
      icon: "🔍"
    }
  ];

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 flex items-center">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mr-auto"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="md:hidden flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <Image
            src="https://ext.same-assets.com/501684899/3670575781.svg"
            alt="Surf"
            width={24}
            height={24}
          />
          <span className="font-bold">Surf</span>
        </div>
        <div className="ml-auto">
          <WalletButton />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-6 md:mb-8">
          {t("mainTitle")}
        </h1>

        {/* Product Hunt Badge - Hidden by default, controlled by env */}
        {process.env.NEXT_PUBLIC_SHOW_PRODUCT_HUNT === 'true' && (
          <div className="flex justify-center mb-12">
            <a
              href="https://www.producthunt.com/products/surf-9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-900 rounded-full hover:shadow-md transition-shadow"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                🏆
              </div>
              <div className="text-left">
                <div className="text-xs text-orange-500 font-semibold">Product Hunt</div>
                <div className="text-sm font-bold text-orange-600">#1 Product of the Day</div>
              </div>
            </a>
          </div>
        )}

        {/* Search Input */}
        <ChatInput
          onSubmit={onStartChat}
          variant="inline"
          currentMode="ask"
        />

        {/* Hot Questions */}
        <div className="mb-8 md:mb-12">
          <div className="space-y-3">
            {hotQuestions.map((question, index) => (
              <div
                key={index}
                onClick={() => onStartChat(question.title, 'ask')}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 md:p-4 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-3">
                  <span className="text-[#A78BFA] text-xs font-semibold whitespace-nowrap bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-md self-start">
                    🔥 Hottest Question
                  </span>
                  <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{question.title}</p>
                  <div className="flex items-center gap-2">
                    <Image
                      src={question.logo}
                      alt={question.tag}
                      width={24}
                      height={24}
                      className="rounded-full ring-2 ring-gray-100"
                    />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{question.tag}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Tools */}
        <div className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">
            Check out Surf&apos;s tailored agent tools for smarter crypto insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {agentTools.map((tool, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="text-3xl mb-3">{tool.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">{tool.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Report Features */}
        <div className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">
            Top-tier crypto project reports generated by Surf AI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-md transition-shadow">
              <h3 className="font-bold mb-2 dark:text-gray-200">Professional layout</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A sleek, publication-ready format designed for maximum clarity and impact.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-md transition-shadow">
              <h3 className="font-bold mb-2 dark:text-gray-200">NER highlighting</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically highlight key entities using advanced Named Entity Recognition (NER).
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-md transition-shadow">
              <h3 className="font-bold mb-2 dark:text-gray-200">Interactive charts</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dynamic, clickable charts that can make you explore data insights in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
