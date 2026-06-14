import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  fmt: {
    ignorePatterns: [],
    printWidth: 100,
    semi: true,
    singleQuote: true,
    sortImports: {
      groups: [
        'builtin',
        'external',
        ['internal', 'subpath'],
        ['parent', 'sibling', 'index'],
        'style',
        'unknown',
      ],
    },
    sortPackageJson: false,
    sortTailwindcss: {
      functions: ['clsx', 'cn'],
      stylesheet: 'src/index.css',
    },
    tabWidth: 2,
    trailingComma: 'all',
  },
  lint: {
    env: {
      builtin: true,
    },
    ignorePatterns: ['dist'],
    options: {
      denyWarnings: true,
      typeAware: true,
      typeCheck: true,
    },
    overrides: [
      {
        env: {
          browser: true,
          es2020: true,
        },
        files: ['**/*.{ts,tsx}'],
        jsPlugins: ['eslint-plugin-sort-keys-fix'],
        rules: {
          'no-unused-vars': [
            'error',
            {
              argsIgnorePattern: '^_',
              destructuredArrayIgnorePattern: '^_',
              ignoreRestSiblings: true,
              varsIgnorePattern: '^_',
            },
          ],
          'react/only-export-components': ['off'],
          'sort-keys-fix/sort-keys-fix': 'warn',
        },
      },
      {
        files: ['**/*.test.ts', '**/*.test.tsx'],
        rules: {
          'typescript/unbound-method': 'off',
        },
      },
    ],
  },
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
    '*': ['vp run format:check', 'vp run lint --fix --no-error-on-unmatched-pattern'],
  },
  test: {
    coverage: {
      enabled: true,
      include: ['src/**/*.{js,ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
    },
    environment: 'jsdom',
    globals: false,
    mockReset: true,
    setupFiles: './src/test-setup.ts',
    ui: true,
  },
});
