"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWatchlist } from "@/contexts/WatchlistContext";

// Trending 项目数据
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
    airdrop: {
      title: "Bitcoin Community Rewards",
      description: "Bitcoin community is launching educational campaigns and rewards programs for long-term holders and active network participants."
    },
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
    airdrop: {
      title: "Ethereum Ecosystem Grants",
      description: "Ethereum Foundation is running grant programs for developers building on Ethereum. Active community members and contributors may be eligible for rewards."
    },
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
    airdrop: {
      title: "Solana Developer Incentives",
      description: "Solana Foundation is offering incentives for developers and early adopters. Active users and builders in the ecosystem may qualify for rewards."
    },
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
      description: "Monad launched 'The Great Gas Reckoning' campaign, registering 200,000 users and tallying 195,171 ETH in historical gas spend for airdrop-style rewards."
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
    name: "ETHGAS",
    logo: "https://ext.same-assets.com/501684899/702983955.png",
    ticker: "$ETHGAS",
    price: "TBA",
    change24h: "-",
    volume24h: "-",
    marketCap: "-",
    trending: false,
    description: "ETHGas is a marketplace for Ethereum blockspace commitments, offering whole-block sales, inclusion and execution preconfirmations, and base-fee futures. It provides low-latency, real-time settlements and tooling for validators, traders, and dApps to abstract gas into tradable instruments and enable a gasless, realtime Ethereum.",
    airdrop: {
      title: "The Great Gas Reckoning",
      description: "ETHGas launched 'The Great Gas Reckoning' campaign, registering 200,000 users and tallying 195,171 ETH in historical gas spend for airdrop-style rewards."
    },
    socialAccounts: {
      twitter: {
        handle: "@ETHGasOfficial",
        followers: "125.93K",
        smartFollowers: "1.03K",
        isInfluential: true
      }
    }
  },
  {
    id: 6,
    name: "Cardano",
    logo: "https://cryptologos.cc/logos/cardano-ada-logo.png",
    ticker: "$ADA",
    price: "$0.85",
    change24h: "+2.1%",
    volume24h: "$1.2B",
    marketCap: "$30B",
    trending: false,
    description: "Cardano is a proof-of-stake blockchain platform that aims to allow changemakers, innovators and visionaries to bring about positive global change. It is designed to be a more sustainable and scalable alternative to proof-of-work networks.",
    airdrop: {
      title: "Cardano Catalyst Fund",
      description: "Project Catalyst is Cardano's innovation fund, providing funding and rewards to community projects and contributors building on the Cardano ecosystem."
    },
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

interface TrendingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TrendingDetailPage({ params }: TrendingDetailPageProps) {
  const { id } = use(params);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const project = trendingProjects.find((p) => p.id === Number(id));

  if (!project) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold dark:text-white mb-4">Project Not Found</h1>
          <Link href="/hub" className="text-[#de5586] hover:underline">
            Back to Hub
          </Link>
        </div>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(project.id);

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeFromWatchlist(project.id);
    } else {
      addToWatchlist({
        id: project.id,
        name: project.name,
        logo: project.logo,
        ticker: project.ticker,
        fdv: project.marketCap,
        notes: "Trending crypto project",
        status: "Trending",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-gray-900">
      {/* Back Arrow - Top Left */}
      <Link
        href="/hub"
        className="fixed top-5 left-5 md:top-7 md:left-[336px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl z-50 transition-colors"
      >
        ←
      </Link>

      {/* Top Right Actions */}
      <div className="fixed top-5 right-5 md:top-7 md:right-7 flex items-center gap-3 md:gap-4 text-sm z-20">
        <Link
          href="#"
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hidden md:inline-flex items-center gap-1"
        >
          Report Problems
          <span className="text-base">ⓘ</span>
        </Link>
        <button
          onClick={handleWatchlistToggle}
          className="text-[#de5586] hover:text-[#c94976] flex items-center gap-1 transition-colors"
        >
          <span className="hidden md:inline">Add to watchlist</span>
          <span>⭐</span>
        </button>
        <Link
          href={`https://twitter.com/${project.socialAccounts.twitter.handle.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#de5586] hover:text-[#c94976] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-8 pt-20 md:pt-24 pb-32">
        {/* Project Info Section - No Background */}
        <div className="flex items-start gap-4 mb-6">
          <Image
            src={project.logo}
            alt={project.name}
            width={64}
            height={64}
            className="rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-sm text-cyan-500 dark:text-cyan-400 flex items-center gap-1">
                💎 Project
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>

        {/* Airdrop Card */}
        {project.airdrop && (
          <div className="mb-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🪂</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2">
                  Airdrop
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {project.airdrop.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* X Accounts Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            X Accounts
          </h2>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Image
                src={project.logo}
                alt={project.name}
                width={48}
                height={48}
                className="rounded-full flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {project.socialAccounts.twitter.handle}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{project.socialAccounts.twitter.followers} followers</span>
                  <span>•</span>
                  <span>{project.socialAccounts.twitter.smartFollowers} smart followers</span>
                </div>
              </div>
            </div>
            {project.socialAccounts.twitter.isInfluential && (
              <span className="text-xs bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 text-white px-3 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0">
                Influential
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Input - Only in main content area */}
      <div className="fixed bottom-0 left-0 md:left-60 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
        <div className="w-full max-w-4xl mx-auto px-6 md:px-8 py-4">
          <div className="w-full flex items-center gap-3 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-3 border border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Challenge Surf AI with your crypto curiosity"
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-500 outline-none"
            />
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
