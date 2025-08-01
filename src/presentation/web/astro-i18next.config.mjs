/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLanguage: "en",
  supportedLanguages: ["en", "tr", "es", "fr", "de", "it", "ja", "ko", "ru", "zh"],
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