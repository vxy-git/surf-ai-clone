import { useLanguage } from "@/contexts/LanguageContext";
import { translations, type TranslationKey } from "@/i18n/translations";

export function useTranslation() {
  const { language } = useLanguage();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = (key: TranslationKey, params?: Record<string, string | number>): any => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = (translations[language] as any)[key] || (translations["en"] as any)[key] || key;

    // 如果是对象,直接返回
    if (typeof text === 'object') {
      return text;
    }

    // 替换变量 {varName}
    if (params && typeof text === 'string') {
      let result = text;
      Object.entries(params).forEach(([paramKey, value]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
      });
      return result;
    }

    return text;
  };

  return { t, language };
}
