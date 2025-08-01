/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // WHPH Primary Colors
        primary: {
          DEFAULT: '#F4D03E', // Golden Yellow
          50: '#FEFBF3',
          100: '#FDF6E1',
          200: '#FBEEC4',
          300: '#F9E5A7',
          400: '#F7DA8A',
          500: '#F4D03E', // Default
          600: '#F0C41C',
          700: '#D4A617',
          800: '#B08913',
          900: '#8C6C0F',
        },
        
        // Surface Colors (Dark Theme Only)
        surface: {
          0: '#000000', // Background - Dark
          1: '#121212', // Primary Surface - Dark
          2: '#181818', // Cards/Containers - Dark
          3: '#202020', // Elevated Surfaces - Dark
        },
        
        // Text Colors (Dark Theme Only)
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0B0B0',
        
        // Semantic Colors
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#F44336',
        info: '#2196F3',
        
        // UI Colors (Dark Theme Only)
        border: '#282828',
        divider: '#282828',
      },
      
      backgroundColor: {
        // Dark theme overrides
        'dark-surface-0': '#000000',
        'dark-surface-1': '#121212', 
        'dark-surface-2': '#181818',
        'dark-surface-3': '#202020',
      },
      
      textColor: {
        'dark-primary': '#FFFFFF',
        'dark-secondary': '#B0B0B0',
      },
      
      borderColor: {
        'dark-divider': '#282828',
      },
      
      fontSize: {
        'hero': ['3rem', { lineHeight: '1.1', fontWeight: '700' }], // 48px
        'section-title': ['1.75rem', { lineHeight: '1.2', fontWeight: '600' }], // 28px
        'card-title': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }], // 20px
        'body-lg': ['1rem', { lineHeight: '1.5', fontWeight: '400' }], // 16px
        'body': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px
      },
      
      borderRadius: {
        'whph': '12px',  // Standard WHPH radius
        'whph-lg': '15px',  // Container radius
      },
      
      maxWidth: {
        'container': '1200px',
      },
      
      spacing: {
        'section': '4rem', // 64px for section padding
        'section-sm': '3rem', // 48px for smaller sections
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}