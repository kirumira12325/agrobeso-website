import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#395f4a',
          terracotta: '#a5562a',
          cream: '#f7efe2',
          charcoal: '#1b1a17',
          gold: '#d99749'
        }
      },
      boxShadow: {
        soft: '0 16px 40px -20px rgba(0, 0, 0, 0.6)'
      }
    }
  },
  plugins: []
} satisfies Config;
