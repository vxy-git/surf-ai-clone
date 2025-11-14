"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { WatchlistProvider } from "@/contexts/WatchlistContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { UsageProvider } from "@/hooks/useUsage";
import type { Language } from "@/i18n/languages";

export default function ClientBody({
  children,
  initialLanguage,
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  return (
    <WalletProvider>
      <UsageProvider>
        <ThemeProvider>
          <LanguageProvider initialLanguage={initialLanguage}>
            <WatchlistProvider>
              <div className="antialiased">{children}</div>
            </WatchlistProvider>
          </LanguageProvider>
        </ThemeProvider>
      </UsageProvider>
    </WalletProvider>
  );
}
