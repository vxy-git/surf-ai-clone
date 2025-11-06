import { useLanguage } from "@/contexts/LanguageContext";
import { translations, type TranslationKey } from "@/i18n/translations";

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || translations["en"][key] || key;

    // 替换变量 {varName}
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
      });
    }

    return text;
  };

  return { t, language };
}
