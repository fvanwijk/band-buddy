import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        background_color: '#0f172b',
        description: 'Musician companion app for managing songs and setlists',
        display: 'standalone',
        icons: [
          {
            sizes: '192x192',
            src: 'pwa-192x192.png',
            type: 'image/png',
          },
          {
            sizes: '512x512',
            src: 'pwa-512x512.png',
            type: 'image/png',
          },
          {
            purpose: 'any maskable',
            sizes: '512x512',
            src: 'pwa-512x512.png',
            type: 'image/png',
          },
        ],
        name: 'BandBuddy',
        short_name: 'BandBuddy',
        theme_color: '#009966',
      },
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
    }),
  ],
  server: {
    host: '127.0.0.1',
  },
  staged: {
    '*': 'vp check',
  },
  test: {
    coverage: {
      enabled: true,
      include: ['src/**/*.{js,ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
    },
    environment: 'jsdom',
    globals: true,
    mockReset: true,
    setupFiles: './src/test-setup.ts',
    ui: true,
  },
});
