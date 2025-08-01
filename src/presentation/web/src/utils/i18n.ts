// Simple i18n utility for WHPH landing page
export const defaultLanguage = "en";
export const supportedLanguages = [
  "en",
  "de",
  "es",
  "fr",
  "it",
  "ja",
  "ko",
  "pl",
  "ru",
  "tr",
  "zh",
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

// Language display names
export const languageNames: Record<SupportedLanguage, string> = {
  de: "Deutsch",
  en: "English",
  es: "Español",
  fr: "Français",
  it: "Italiano",
  ja: "日本語",
  ko: "한국어",
  pl: "Polski",
  ru: "Русский",
  tr: "Türkçe",
  zh: "中文",
};

// Language codes for HTML lang attribute
export const languageCodes: Record<SupportedLanguage, string> = {
  de: "de",
  en: "en",
  es: "es",
  fr: "fr",
  it: "it",
  ja: "ja",
  ko: "ko",
  pl: "pl",
  ru: "ru",
  tr: "tr",
  zh: "zh",
};

// Direction for RTL languages (none currently, but prepared for future)
export const textDirection: Record<SupportedLanguage, "ltr" | "rtl"> = {
  en: "ltr",
  tr: "ltr",
  es: "ltr",
  fr: "ltr",
  de: "ltr",
  pl: "ltr",
  it: "ltr",
  ja: "ltr",
  ko: "ltr",
  ru: "ltr",
  zh: "ltr",
};

// Get language from URL path
export function getLanguageFromURL(pathname: string): SupportedLanguage {
  const segments = pathname.split("/").filter(Boolean);
  const langFromURL = segments[0] as SupportedLanguage;

  if (supportedLanguages.includes(langFromURL)) {
    return langFromURL;
  }

  return defaultLanguage;
}

// Remove language prefix from pathname
export function removeLanguageFromURL(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const langFromURL = segments[0] as SupportedLanguage;

  if (supportedLanguages.includes(langFromURL)) {
    return "/" + segments.slice(1).join("/");
  }

  return pathname;
}

// Add language prefix to pathname
export function addLanguageToURL(
  pathname: string,
  lang: SupportedLanguage
): string {
  if (lang === defaultLanguage) {
    return pathname;
  }

  const cleanPath = removeLanguageFromURL(pathname);
  return `/${lang}${cleanPath}`;
}

// Get alternate language URLs for hreflang
export function getAlternateLanguageURLs(
  pathname: string,
  baseURL: string
): Array<{ lang: SupportedLanguage; url: string }> {
  const cleanPath = removeLanguageFromURL(pathname);

  return supportedLanguages.map((lang) => ({
    lang,
    url: `${baseURL}${addLanguageToURL(cleanPath, lang)}`,
  }));
}

// Detect user's preferred language from browser
export function detectUserLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return defaultLanguage;

  const browserLang = window.navigator.language.split(
    "-"
  )[0] as SupportedLanguage;

  if (supportedLanguages.includes(browserLang)) {
    return browserLang;
  }

  return defaultLanguage;
}

// Load translations for a specific language
export async function loadTranslations(lang: SupportedLanguage): Promise<any> {
  try {
    const translations = await import(`../locales/${lang}/common.json`);
    return translations.default || translations;
  } catch (error) {
    console.warn(
      `Failed to load translations for ${lang}, falling back to ${defaultLanguage}`
    );

    if (lang !== defaultLanguage) {
      return loadTranslations(defaultLanguage);
    }

    throw error;
  }
}

// Simple interpolation for variables in translations
export function interpolate(
  text: string,
  variables: Record<string, string | number> = {}
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}

// Get nested translation value
export function getTranslation(
  translations: any,
  key: string,
  variables?: Record<string, string | number>
): string {
  const keys = key.split(".");
  let value = translations;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return the key itself as fallback
    }
  }

  if (typeof value === "string") {
    return variables ? interpolate(value, variables) : value;
  }

  console.warn(`Translation value is not a string: ${key}`);
  return key;
}

// Translation function factory
export function createTranslationFunction(translations: any) {
  return (key: string, variables?: Record<string, string | number>): string => {
    return getTranslation(translations, key, variables);
  };
}

// Get current year for footer
export function getCurrentYear(): number {
  return new Date().getFullYear();
}
