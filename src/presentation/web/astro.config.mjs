// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import solidJs from '@astrojs/solid-js';

// https://astro.build/config
export default defineConfig({
  site: 'https://whph.ahmetcetinkaya.me',
  base: '/',
  outDir: './dist',
  // i18n configuration
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'ru', 'zh'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [tailwind(), solidJs()],
  vite: {
    build: {
      // Optimize chunks for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Keep vendor chunks separate for long-term caching
            vendor: ['astro/client-base'],
          },
        },
      },
      // Enable minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
        },
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['solid-js'],
    },
  },
  compressHTML: true,
  image: {
    // Image optimization configuration
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  build: {
    // Enable static file compression
    inlineStylesheets: 'auto',
    // Generate optimized assets
    assets: '_astro',
  },
});
