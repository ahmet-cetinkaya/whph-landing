/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLanguage: "en",
  supportedLanguages: [
    "en",
    "cs",
    "da",
    "de",
    "el",
    "es",
    "fi",
    "fr",
    "it",
    "ja",
    "ko",
    "nl",
    "no",
    "pl",
    "pt",
    "ro",
    "ru",
    "sl",
    "sv",
    "tr",
    "uk",
    "zh",
  ],
  i18next: {
    debug: false, // Enable for development debugging
    initImmediate: false,
    backend: {
      loadPath: "./src/locales/{{lng}}/{{ns}}.json",
    },
  },
  i18nextPlugins: {
    fsBackend: "i18next-fs-backend",
  },
};
