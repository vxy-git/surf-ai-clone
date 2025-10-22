"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface WatchlistItem {
  id: number;
  name: string;
  logo: string;
  ticker: string;
  fdv: string;
  addedDate: string;
  notes: string;
  status: string;
}

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  addToWatchlist: (item: Omit<WatchlistItem, "addedDate">) => void;
  removeFromWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
  updateNotes: (id: number, notes: string) => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    // 从 localStorage 读取 watchlist
    const saved = localStorage.getItem("watchlist");
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse watchlist:", e);
      }
    }
  }, []);

  useEffect(() => {
    // 保存到 localStorage
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (item: Omit<WatchlistItem, "addedDate">) => {
    const newItem: WatchlistItem = {
      ...item,
      addedDate: new Date().toISOString(),
    };
    setWatchlist((prev) => [...prev, newItem]);
  };

  const removeFromWatchlist = (id: number) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  };

  const isInWatchlist = (id: number) => {
    return watchlist.some((item) => item.id === id);
  };

  const updateNotes = (id: number, notes: string) => {
    setWatchlist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        updateNotes,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}
