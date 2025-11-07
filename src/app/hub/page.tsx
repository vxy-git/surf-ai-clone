"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { useWatchlist } from "@/contexts/WatchlistContext";

const preTgeProjects = [
  {
    id: 1,
    name: "OpenMind",
    logo: "https://ext.same-assets.com/501684899/2799240920.png",
    featured: true,
    ticker: "",
    fdv: "1B",
    launchMcap: "150M",
    binanceListing: 40,
    grade: "A",
    status: "Pre-TGE",
  },
  {
    id: 2,
    name: "Recall",
    logo: "https://ext.same-assets.com/501684899/602384394.png",
    featured: false,
    ticker: "$RECALL",
    fdv: "1B",
    launchMcap: "140M",
    binanceListing: 58,
    grade: "A",
    status: "Pre-TGE",
  },
  {
    id: 3,
    name: "Monad",
    logo: "https://ext.same-assets.com/501684899/702983955.png",
    featured: false,
    ticker: "$MON",
    fdv: "15B",
    launchMcap: "1.95B",
    binanceListing: 85,
    grade: "A+",
    status: "Pre-TGE",
  },
  {
    id: 4,
    name: "Sentient",
    logo: "https://ext.same-assets.com/501684899/533709616.png",
    featured: false,
    ticker: "",
    fdv: "4B",
    launchMcap: "480M",
    binanceListing: 48,
    grade: "A+",
    status: "Pre-TGE",
  },
  {
    id: 5,
    name: "MegaETH",
    logo: "https://ext.same-assets.com/501684899/2207992830.png",
    featured: false,
    ticker: "$MEGA",
    fdv: "4B",
    launchMcap: "280M",
    binanceListing: 65,
    grade: "A+",
    status: "Pre-TGE",
  },
  {
    id: 6,
    name: "Infinex",
    logo: "https://ext.same-assets.com/501684899/1515045511.png",
    featured: false,
    ticker: "",
    fdv: "2.5B",
    launchMcap: "300M",
    binanceListing: 50,
    grade: "A+",
    status: "Pre-TGE",
  },
  {
    id: 7,
    name: "Allora",
    logo: "https://ext.same-assets.com/501684899/1717374049.png",
    featured: false,
    ticker: "",
    fdv: "2B",
    launchMcap: "240M",
    binanceListing: 45,
    grade: "A",
    status: "Pre-TGE",
  },
  {
    id: 8,
    name: "KITE AI",
    logo: "https://ext.same-assets.com/501684899/3810063574.png",
    featured: false,
    ticker: "",
    fdv: "1.5B",
    launchMcap: "180M",
    binanceListing: 40,
    grade: "A",
    status: "Pre-TGE",
  },
];

const trendingProjects = [
  {
    id: 1,
    name: "Bitcoin",
    logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    ticker: "$BTC",
    price: "$98,450",
    change24h: "+5.2%",
    volume24h: "$52.3B",
    marketCap: "$1.92T",
    trending: true,
    description: "Bitcoin is the first decentralized cryptocurrency. It is a digital currency that uses peer-to-peer technology to facilitate instant payments. Bitcoin is based on blockchain technology and operates without a central authority or banks.",
    airdrop: null,
    socialAccounts: {
      twitter: {
        handle: "@Bitcoin",
        followers: "5.8M",
        smartFollowers: "2.3M",
        isInfluential: true
      }
    }
  },
  {
    id: 2,
    name: "Ethereum",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    ticker: "$ETH",
    price: "$3,245",
    change24h: "+3.8%",
    volume24h: "$28.5B",
    marketCap: "$390B",
    trending: true,
    description: "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether (ETH) is the native cryptocurrency of the platform. It is the second-largest cryptocurrency by market capitalization, after Bitcoin.",
    airdrop: null,
    socialAccounts: {
      twitter: {
        handle: "@ethereum",
        followers: "3.2M",
        smartFollowers: "1.5M",
        isInfluential: true
      }
    }
  },
  {
    id: 3,
    name: "Solana",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
    ticker: "$SOL",
    price: "$185.20",
    change24h: "+8.5%",
    volume24h: "$8.2B",
    marketCap: "$85B",
    trending: false,
    description: "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale. Solana is known for its fast transaction speeds and low costs, making it a popular choice for DeFi and NFT projects.",
    airdrop: null,
    socialAccounts: {
      twitter: {
        handle: "@solana",
        followers: "2.1M",
        smartFollowers: "980K",
        isInfluential: true
      }
    }
  },
  {
    id: 4,
    name: "Monad",
    logo: "https://ext.same-assets.com/501684899/702983955.png",
    ticker: "$MON",
    price: "TBA",
    change24h: "-",
    volume24h: "-",
    marketCap: "15B (Est.)",
    trending: false,
    description: "Monad is a high-performance Layer 1 blockchain with parallel execution capabilities. It aims to provide Ethereum compatibility while delivering significantly higher throughput through innovative consensus mechanisms.",
    airdrop: {
      title: "Monad Testnet Campaign",
      description: "Monad is preparing for testnet launch. Early participants may be eligible for future rewards. Join the community and stay updated for announcements."
    },
    socialAccounts: {
      twitter: {
        handle: "@monad_xyz",
        followers: "458K",
        smartFollowers: "125K",
        isInfluential: true
      }
    }
  },
  {
    id: 5,
    name: "Cardano",
    logo: "https://cryptologos.cc/logos/cardano-ada-logo.png",
    ticker: "$ADA",
    price: "$0.85",
    change24h: "+2.1%",
    volume24h: "$1.2B",
    marketCap: "$30B",
    trending: false,
    description: "Cardano is a proof-of-stake blockchain platform that aims to allow changemakers, innovators and visionaries to bring about positive global change. It is designed to be a more sustainable and scalable alternative to proof-of-work networks.",
    airdrop: null,
    socialAccounts: {
      twitter: {
        handle: "@Cardano",
        followers: "1.5M",
        smartFollowers: "650K",
        isInfluential: true
      }
    }
  },
];

const watchlistProjects = [
  {
    id: 1,
    name: "Monad",
    logo: "https://ext.same-assets.com/501684899/702983955.png",
    ticker: "$MON",
    fdv: "15B",
    status: "Pre-TGE",
    addedDate: "2025-10-15",
    notes: "High potential L1"
  },
  {
    id: 2,
    name: "MegaETH",
    logo: "https://ext.same-assets.com/501684899/2207992830.png",
    ticker: "$MEGA",
    fdv: "4B",
    status: "Pre-TGE",
    addedDate: "2025-10-18",
    notes: "Fast L2 solution"
  },
  {
    id: 3,
    name: "OpenMind",
    logo: "https://ext.same-assets.com/501684899/2799240920.png",
    ticker: "",
    fdv: "1B",
    status: "Pre-TGE",
    addedDate: "2025-10-20",
    notes: "AI project"
  },
];

export default function HubPage() {
  const { t } = useTranslation();
  const { watchlist, isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [activeTab, setActiveTab] = useState<"pre-tge" | "trending" | "watchlist">("pre-tge");
  const [searchQuery, setSearchQuery] = useState("");

  const handleWatchlistToggle = (project: typeof preTgeProjects[0]) => {
    if (isInWatchlist(project.id)) {
      removeFromWatchlist(project.id);
    } else {
      addToWatchlist({
        id: project.id,
        name: project.name,
        logo: project.logo,
        ticker: project.ticker,
        fdv: project.fdv,
        notes: "Added from Hub",
        status: project.status,
      });
    }
  };

  const filteredPreTgeProjects = preTgeProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTrendingProjects = trendingProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWatchlistProjects = watchlist.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-gray-900">
      {/* Top Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-4 flex items-center md:hidden">
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mr-auto"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <Image
            src="https://ext.same-assets.com/501684899/3670575781.svg"
            alt="Surf"
            width={24}
            height={24}
          />
          <span className="font-bold dark:text-white">Surf</span>
        </div>
        <button className="ml-auto px-4 py-2 border-2 border-[#A78BFA] text-[#A78BFA] rounded-full font-medium hover:bg-[#A78BFA] hover:text-white transition-colors text-sm">
          {String(t("login"))}
        </button>
      </header>
      {/* Header with floating icons background */}
      <div className="relative bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Floating icons background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-16 h-16 bg-blue-200 dark:bg-blue-900 rounded-full blur-xl" />
          <div className="absolute top-32 right-32 w-20 h-20 bg-purple-200 dark:bg-purple-900 rounded-full blur-xl" />
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-pink-200 dark:bg-pink-900 rounded-full blur-xl" />
          <div className="absolute top-20 right-1/4 w-16 h-16 bg-green-200 dark:bg-green-900 rounded-full blur-xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            Find the crypto projects you care about most
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The most comprehensive and professional crypto database
          </p>

          {/* Search box */}
          <div className="max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search a project, token, or CA"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-[#A78BFA] transition-colors text-lg"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("pre-tge")}
              className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                activeTab === "pre-tge"
                  ? "border-[#A78BFA] text-[#A78BFA]"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                🚀 Pre-tge Report
              </span>
            </button>
            <button
              onClick={() => setActiveTab("trending")}
              className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                activeTab === "trending"
                  ? "border-[#A78BFA] text-[#A78BFA]"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                📈 Trending
              </span>
            </button>
            <button
              onClick={() => setActiveTab("watchlist")}
              className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                activeTab === "watchlist"
                  ? "border-[#A78BFA] text-[#A78BFA]"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                ⭐ Watchlist
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {activeTab === "pre-tge" && (
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              More pre-TGE project reports are coming soon
            </p>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Table Header - Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400">
                <div className="col-span-3"></div>
                <div className="col-span-3 text-center">Predicted FDV and Launch Mcap</div>
                <div className="col-span-2 text-center">Binance listing probability</div>
                <div className="col-span-2 text-center">Surf Grade by AI</div>
                <div className="col-span-2 text-center">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPreTgeProjects.map((project) => (
                  <div
                    key={project.id}
                    className="px-4 md:px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4">
                      {/* Project Name */}
                      <Link href={`/hub/project/${project.id}`} className="col-span-3 flex items-center gap-3 cursor-pointer">
                        <Image
                          src={project.logo}
                          alt={project.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold dark:text-white hover:text-[#A78BFA] dark:hover:text-[#A78BFA] transition-colors">{project.name}</span>
                            {project.featured && (
                              <span className="text-xs bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white px-2 py-0.5 rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                          {project.ticker && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">{project.ticker}</span>
                          )}
                        </div>
                      </Link>

                      {/* FDV and Launch Mcap */}
                      <div className="col-span-3 flex items-center justify-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded text-sm font-medium">
                            {project.fdv}
                          </span>
                          <span className="bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded text-sm font-medium">
                            {project.launchMcap}
                          </span>
                        </div>
                      </div>

                      {/* Binance Listing Probability */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="text-2xl font-bold dark:text-white">{project.binanceListing}%</span>
                      </div>

                      {/* Grade */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className={`text-3xl font-bold ${
                          project.grade === "A+" ? "text-green-500" : "text-gray-400"
                        }`}>
                          {project.grade}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleWatchlistToggle(project);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isInWatchlist(project.id)
                              ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                              : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                          title={isInWatchlist(project.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill={isInWatchlist(project.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                        <Link
                          href={`/hub/project/${project.id}`}
                          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#A78BFA] transition-colors"
                          title="View Details"
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </Link>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-3">
                      {/* Project Name */}
                      <div className="flex items-center gap-3">
                        <Image
                          src={project.logo}
                          alt={project.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <Link href={`/hub/project/${project.id}`} className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold dark:text-white hover:text-[#A78BFA] dark:hover:text-[#A78BFA] transition-colors">{project.name}</span>
                            {project.featured && (
                              <span className="text-xs bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white px-2 py-0.5 rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                          {project.ticker && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">{project.ticker}</span>
                          )}
                        </Link>
                        <button
                          onClick={() => handleWatchlistToggle(project)}
                          className={`p-2 rounded-lg transition-colors ${
                            isInWatchlist(project.id)
                              ? "text-yellow-500"
                              : "text-gray-400"
                          }`}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWatchlist(project.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                        <span className={`text-2xl font-bold ${
                          project.grade === "A+" ? "text-green-500" : "text-gray-400"
                        }`}>
                          {project.grade}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">FDV / Launch Mcap</div>
                          <div className="flex gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">
                              {project.fdv}
                            </span>
                            <span className="bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded text-xs font-medium">
                              {project.launchMcap}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Binance Listing</div>
                          <span className="text-xl font-bold dark:text-white">{project.binanceListing}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "trending" && (
          <div>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Top trending crypto projects based on social media and market activity
            </p>

            {/* Trending Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Table Header - Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400">
                <div className="col-span-3"></div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">24h Change</div>
                <div className="col-span-2 text-center">24h Volume</div>
                <div className="col-span-3 text-center">Market Cap</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTrendingProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/hub/trending/${project.id}`}
                    className="block px-4 md:px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                  >
                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4">
                      {/* Project Name */}
                      <div className="col-span-3 flex items-center gap-3">
                        <Image
                          src={project.logo}
                          alt={project.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold dark:text-white">{project.name}</span>
                            {project.trending && (
                              <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full">
                                🔥 Hot
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{project.ticker}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="font-semibold dark:text-white">{project.price}</span>
                      </div>

                      {/* 24h Change */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className={`font-semibold ${
                          project.change24h.startsWith('+') ? 'text-green-500' :
                          project.change24h === '-' ? 'text-gray-400' : 'text-red-500'
                        }`}>
                          {project.change24h}
                        </span>
                      </div>

                      {/* 24h Volume */}
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="text-gray-700 dark:text-gray-300">{project.volume24h}</span>
                      </div>

                      {/* Market Cap */}
                      <div className="col-span-3 flex items-center justify-center">
                        <span className="font-semibold dark:text-white">{project.marketCap}</span>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-3">
                      {/* Project Name */}
                      <div className="flex items-center gap-3">
                        <Image
                          src={project.logo}
                          alt={project.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold dark:text-white">{project.name}</span>
                            {project.trending && (
                              <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full">
                                🔥 Hot
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{project.ticker}</span>
                        </div>
                        <span className={`font-semibold ${
                          project.change24h.startsWith('+') ? 'text-green-500' :
                          project.change24h === '-' ? 'text-gray-400' : 'text-red-500'
                        }`}>
                          {project.change24h}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</div>
                          <span className="font-semibold dark:text-white">{project.price}</span>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">24h Volume</div>
                          <span className="text-gray-700 dark:text-gray-300">{project.volume24h}</span>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Market Cap</div>
                          <span className="font-semibold dark:text-white">{project.marketCap}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "watchlist" && (
          <div>
            {filteredWatchlistProjects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 dark:text-gray-400 mb-2">Your watchlist is empty</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Add projects to keep track of them</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                  {filteredWatchlistProjects.length} project{filteredWatchlistProjects.length > 1 ? 's' : ''} in your watchlist
                </p>

                {/* Watchlist Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Table Header - Desktop */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400">
                    <div className="col-span-3"></div>
                    <div className="col-span-2 text-center">FDV</div>
                    <div className="col-span-2 text-center">Added Date</div>
                    <div className="col-span-3 text-center">Notes</div>
                    <div className="col-span-2 text-center">Actions</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredWatchlistProjects.map((project) => (
                      <div
                        key={project.id}
                        className="px-4 md:px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                      >
                        {/* Desktop Layout */}
                        <div className="hidden md:grid grid-cols-12 gap-4">
                          {/* Project Name */}
                          <div className="col-span-3 flex items-center gap-3">
                            <Image
                              src={project.logo}
                              alt={project.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            <div>
                              <span className="font-semibold dark:text-white block">{project.name}</span>
                              {project.ticker && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">{project.ticker}</span>
                              )}
                            </div>
                          </div>

                          {/* FDV */}
                          <div className="col-span-2 flex items-center justify-center">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded text-sm font-medium">
                              {project.fdv}
                            </span>
                          </div>

                          {/* Status */}
                          <div className="col-span-2 flex items-center justify-center">
                            <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded text-sm font-medium">
                              {project.status}
                            </span>
                          </div>

                          {/* Added Date */}
                          <div className="col-span-2 flex items-center justify-center">
                            <span className="text-gray-700 dark:text-gray-300 text-sm">
                              {new Date(project.addedDate).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Notes */}
                          <div className="col-span-3 flex items-center justify-center">
                            <span className="text-gray-600 dark:text-gray-400 text-sm italic">
                              {project.notes}
                            </span>
                          </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="md:hidden space-y-3">
                          {/* Project Name */}
                          <div className="flex items-center gap-3">
                            <Image
                              src={project.logo}
                              alt={project.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            <div className="flex-1">
                              <span className="font-semibold dark:text-white block">{project.name}</span>
                              {project.ticker && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">{project.ticker}</span>
                              )}
                            </div>
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">
                              {project.fdv}
                            </span>
                          </div>

                          {/* Stats */}
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                              <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-medium">
                                {project.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">Added:</span>
                              <span className="text-gray-700 dark:text-gray-300 text-xs">
                                {new Date(project.addedDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Notes: </span>
                              <span className="text-gray-600 dark:text-gray-400 text-xs italic">
                                {project.notes}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
