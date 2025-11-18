"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Language } from "@/i18n/languages";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const persistLanguage = useCallback((value: Language) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("language", value);
    document.cookie = `language=${value}; path=/; max-age=31536000`;
    document.documentElement.lang = value;
  }, []);

  const updateLanguage = useCallback(
    (value: Language) => {
      setLanguageState(value);
      persistLanguage(value);
    },
    [persistLanguage]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLanguage = localStorage.getItem("language") as Language | null;
    if (savedLanguage) {
      updateLanguage(savedLanguage);
      return;
    }

    if (!initialLanguage) {
      const browserLang = navigator.language;
      if (browserLang.startsWith("zh")) {
        updateLanguage("zh-CN");
      } else if (browserLang.startsWith("ja")) {
        updateLanguage("ja");
      } else {
        updateLanguage("en");
      }
    }
  }, [initialLanguage, updateLanguage]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLanguage = localStorage.getItem("language");
    if (!savedLanguage) {
      persistLanguage(language);
    }
  }, [language, persistLanguage]);

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage: updateLanguage,
    }),
    [language, updateLanguage]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
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
