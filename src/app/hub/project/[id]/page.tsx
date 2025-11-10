"use client";

import { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Globe, Twitter, Send, Star } from "@/components/icons";

// 模拟项目数据
const allProjects = [
  {
    id: 1,
    name: "OpenMind",
    logo: "https://ext.same-assets.com/501684899/2799240920.png",
    ticker: "",
    fdv: "1B",
    launchMcap: "150M",
    binanceListing: 40,
    grade: "A",
    description: "OpenMind is a decentralized AI platform that enables collaborative model training and data sharing.",
    category: "AI",
    status: "Pre-TGE",
    website: "https://openmind.ai",
    twitter: "https://twitter.com/openmind",
    telegram: "https://t.me/openmind",
  },
  {
    id: 2,
    name: "Recall",
    logo: "https://ext.same-assets.com/501684899/602384394.png",
    ticker: "$RECALL",
    fdv: "1B",
    launchMcap: "140M",
    binanceListing: 58,
    grade: "A",
    description: "Recall is a privacy-focused memory protocol for Web3 applications.",
    category: "Infrastructure",
    status: "Pre-TGE",
    website: "https://recall.network",
    twitter: "https://twitter.com/recall",
    telegram: "https://t.me/recall",
  },
  {
    id: 3,
    name: "Monad",
    logo: "https://ext.same-assets.com/501684899/702983955.png",
    ticker: "$MON",
    fdv: "15B",
    launchMcap: "1.95B",
    binanceListing: 85,
    grade: "A+",
    description: "Monad is a high-performance Layer 1 blockchain with parallel execution capabilities.",
    category: "Layer 1",
    status: "Pre-TGE",
    website: "https://monad.xyz",
    twitter: "https://twitter.com/monad_xyz",
    telegram: "https://t.me/monad",
  },
];

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const { t } = useTranslation();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [notes, setNotes] = useState("");

  const project = allProjects.find((p) => p.id === Number(id));

  if (!project) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold dark:text-white mb-4">Project Not Found</h1>
          <Link href="/hub" className="text-[#A78BFA] hover:underline">
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
        fdv: project.fdv,
        notes: notes || "Interesting project",
        status: project.status,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <Link href="/hub" className="text-[#A78BFA] hover:underline mb-4 inline-block">
            ← Back to Hub
          </Link>

          <div className="flex items-start gap-6 mt-4">
            <Image
              src={project.logo}
              alt={project.name}
              width={80}
              height={80}
              className="rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold dark:text-white">{project.name}</h1>
                {project.ticker && (
                  <span className="text-xl text-gray-500 dark:text-gray-400">{project.ticker}</span>
                )}
                <span className={`text-2xl font-bold ${
                  project.grade === "A+" ? "text-green-500" : "text-gray-400"
                }`}>
                  {project.grade}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>

              {/* Social Links */}
              <div className="flex gap-4">
                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#A78BFA] hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                {project.twitter && (
                  <a
                    href={project.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#A78BFA] hover:underline flex items-center gap-1"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </a>
                )}
                {project.telegram && (
                  <a
                    href={project.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#A78BFA] hover:underline flex items-center gap-1"
                  >
                    <Send className="w-4 h-4" />
                    Telegram
                  </a>
                )}
              </div>
            </div>

            {/* Watchlist Button */}
            <button
              onClick={handleWatchlistToggle}
              className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                inWatchlist
                  ? "bg-[#A78BFA] text-white hover:bg-[#6D28D9]"
                  : "border-2 border-[#A78BFA] text-[#A78BFA] hover:bg-[#A78BFA] hover:text-white"
              }`}
            >
              {inWatchlist ? (
                <>
                  <Star className="w-4 h-4" />
                  In Watchlist
                </>
              ) : (
                "Add to Watchlist"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Category</h3>
            <p className="text-2xl font-bold dark:text-white">{project.category}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Status</h3>
            <p className="text-2xl font-bold dark:text-white">{project.status}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Predicted FDV</h3>
            <p className="text-2xl font-bold dark:text-white">{project.fdv}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Launch Mcap</h3>
            <p className="text-2xl font-bold dark:text-white">{project.launchMcap}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Binance Listing Probability</h3>
            <p className="text-2xl font-bold dark:text-white">{project.binanceListing}%</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Surf Grade</h3>
            <p className={`text-4xl font-bold ${
              project.grade === "A+" ? "text-green-500" : "text-gray-400"
            }`}>
              {project.grade}
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold dark:text-white mb-4">About {project.name}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{project.description}</p>
        </div>

        {/* Notes Section (if in watchlist) */}
        {!inWatchlist && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold dark:text-white mb-4">Add Notes (Optional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this project..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 dark:text-white outline-none focus:border-[#A78BFA] transition-colors resize-none"
              rows={4}
            />
          </div>
        )}
      </div>
    </div>
  );
}
