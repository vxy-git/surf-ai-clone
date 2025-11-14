export const SUPPORTED_LANGUAGES = ["zh-CN", "en", "ja", "ko"] as const;

export type Language = typeof SUPPORTED_LANGUAGES[number];

export function isSupportedLanguage(value: string | null): value is Language {
  return Boolean(value && SUPPORTED_LANGUAGES.includes(value as Language));
}
