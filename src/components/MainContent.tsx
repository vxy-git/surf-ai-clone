"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import WalletButton from "@/components/WalletButton";
import ChatInput from "@/components/ChatInput";
import { MessageCircle, TrendingUp, Activity, Search, Flame, ArrowRight, Menu } from "@/components/icons";

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

interface NewToken {
  symbol: string;
  name: string;
  priceChange24h?: number;
  network: string;
  imageUrl?: string;
}

export default function MainContent({ onToggleSidebar, onStartChat }: MainContentProps) {
  const { t } = useTranslation();
  const [newTokens, setNewTokens] = useState<NewToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  // 加载新代币列表
  useEffect(() => {
    const loadNewTokens = async () => {
      setLoadingTokens(true);
      try {
        const response = await fetch('/api/tokens/new?limit=10&source=both');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.tokens) {
            setNewTokens(data.tokens.slice(0, 8)); // 只显示前8个
          }
        }
      } catch (error) {
        console.error('[MainContent] Failed to load new tokens:', error);
      } finally {
        setLoadingTokens(false);
      }
    };

    loadNewTokens();
  }, []);

  // Click token card to start AI conversation
  const handleTokenClick = (token: NewToken) => {
    const message = `Please provide a detailed analysis of ${token.name} (${token.symbol}), including market performance, technical indicators, on-chain data, and investment value.`;
    onStartChat(message, 'research');
  };

  const agentTools = [
    {
      title: t("socialSentiment"),
      description: t("socialSentimentDesc"),
      icon: MessageCircle
    },
    {
      title: t("technicalAnalysis"),
      description: t("technicalAnalysisDesc"),
      icon: TrendingUp
    },
    {
      title: t("onchainTracker"),
      description: t("onchainTrackerDesc"),
      icon: Activity
    },
    {
      title: t("deepSearch"),
      description: t("deepSearchDesc"),
      icon: Search
    }
  ];

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl backdrop-saturate-150 bg-white/90 dark:bg-gray-900/90 border-b-2 border-white/30 dark:border-gray-700/60 shadow-lg shadow-black/10 dark:shadow-black/30 px-4 md:px-8 py-4 flex items-center transition-all duration-300">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mr-auto"
        >
          <Menu size={24} />
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
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 md:mt-20">
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

        {/* New Tokens Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Flame size={20} className="text-orange-500" />
              <span>{t("newTokensTitle")}</span>
            </h2>
            {!loadingTokens && newTokens.length > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t("realtimeData")} · GeckoTerminal
              </span>
            )}
          </div>

          {/* Loading State */}
          {loadingTokens && (
            <div className="flex items-center justify-center py-8">
              <div className="inline-flex h-2 w-2 rounded-full bg-[#19c8ff] animate-pulse" />
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-3">{t("loading")}</p>
            </div>
          )}

          {/* Tokens Grid */}
          {!loadingTokens && newTokens.length > 0 && (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:grid-cols-3">
              {newTokens.map((token, index) => (
                <button
                  key={`${token.symbol}-${index}`}
                  onClick={() => handleTokenClick(token)}
                  className="group relative backdrop-blur-lg backdrop-saturate-150 bg-white/75 dark:bg-gray-900/75 rounded-xl p-4 border-2 border-white/30 dark:border-gray-700/40 shadow-lg transition-all duration-300 hover:backdrop-blur-2xl hover:bg-white/90 dark:hover:bg-gray-900/90 hover:border-[#19c8ff]/80 hover:shadow-[0_12px_32px_rgba(25,200,255,0.4)] hover:scale-[1.05] hover:ring-2 hover:ring-[#19c8ff]/40"
                >
                  {/* Token Icon/Network Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {token.imageUrl ? (
                        <img
                          src={token.imageUrl}
                          alt={token.symbol}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#19c8ff] to-[#0aa3d8] flex items-center justify-center text-white text-xs font-bold">
                          {token.symbol.charAt(0)}
                        </div>
                      )}
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                        {token.network}
                      </span>
                    </div>
                    {token.priceChange24h !== undefined && (
                      <span
                        className={`text-xs font-semibold ${
                          token.priceChange24h >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {token.priceChange24h >= 0 ? '+' : ''}
                        {token.priceChange24h.toFixed(1)}%
                      </span>
                    )}
                  </div>

                  {/* Token Info */}
                  <div className="text-left">
                    <div className="font-bold text-sm text-gray-900 dark:text-white mb-1 truncate">
                      {token.symbol}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {token.name}
                    </div>
                  </div>

                  {/* Hover Effect Arrow */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={14} className="text-[#19c8ff]" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loadingTokens && newTokens.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              {t("noTokenData")}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
