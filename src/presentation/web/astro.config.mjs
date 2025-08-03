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
    locales: [
      'en',
      'tr',
      'es',
      'fr',
      'de',
      'it',
      'ja',
      'ko',
      'ru',
      'zh',
      'pl',
      'uk',
      'cs',
      'da',
      'el',
      'fi',
      'nl',
      'ro',
      'sl',
      'sv',
    ],
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
    // Enhanced image optimization configuration
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
        // Optimize image quality vs size
        jpeg: { quality: 80, progressive: true },
        png: { quality: 80, progressive: true },
        webp: { quality: 80, effort: 6 },
        avif: { quality: 80, effort: 6 },
      },
    },
    // Optimize remote images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
  build: {
    // Inline small stylesheets to reduce render blocking
    inlineStylesheets: 'always',
    // Generate optimized assets
    assets: '_astro',
  },
});
