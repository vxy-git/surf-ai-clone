export const SUPPORTED_LANGUAGES = ["en", "ja", "zh-CN"] as const;

export type Language = typeof SUPPORTED_LANGUAGES[number];

export function isSupportedLanguage(value: string | null): value is Language {
  return Boolean(value && SUPPORTED_LANGUAGES.includes(value as Language));
}
