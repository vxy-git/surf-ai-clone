"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { WatchlistProvider } from "@/contexts/WatchlistContext";
import { WalletProvider } from "@/contexts/WalletContext";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  return (
    <WalletProvider>
      <ThemeProvider>
        <LanguageProvider>
          <WatchlistProvider>
            <div className="antialiased">{children}</div>
          </WatchlistProvider>
        </LanguageProvider>
      </ThemeProvider>
    </WalletProvider>
  );
}
