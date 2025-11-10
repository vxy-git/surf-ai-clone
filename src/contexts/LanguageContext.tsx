"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Language = "zh-CN" | "en" | "ja" | "ko";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Read language setting from localStorage
    const savedLanguage = localStorage.getItem("language") as Language | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language;
      if (browserLang.startsWith("zh")) {
        setLanguage("zh-CN");
      } else if (browserLang.startsWith("ja")) {
        setLanguage("ja");
      } else if (browserLang.startsWith("ko")) {
        setLanguage("ko");
      } else {
        setLanguage("en");
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("language", language);

    // Sync HTML lang attribute to avoid hydration errors
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
