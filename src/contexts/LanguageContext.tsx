"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Language = "zh-CN" | "en" | "ja" | "ko";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh-CN");

  useEffect(() => {
    // 从 localStorage 读取语言设置
    const savedLanguage = localStorage.getItem("language") as Language | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // 检测浏览器语言
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
    // 保存到 localStorage
    localStorage.setItem("language", language);

    // 同步更新 HTML 标签的 lang 属性,避免 hydration 错误
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
