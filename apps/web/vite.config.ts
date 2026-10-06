import { resolve } from 'node:path'

import { themePreferencePlugin } from '@adrienlcp/theme-preference/vite'
import optimizeLocales from '@react-aria/optimize-locales-plugin'
import react from '@vitejs/plugin-react'
import fontaine from 'fontaine/postcss'
import { defineConfig } from 'vite'

import { datasetsPlugin } from './scripts/datasets-plugin.ts'
import { shareCardHead } from './scripts/share-card-head.ts'
import { REGIONAL_LOCALES } from './src/presentation/i18n/regional-locales.ts'
import { themeStore } from './src/presentation/theme/theme-store.ts'

export default defineConfig({
  build: {
    manifest: true
  },
  css: {
    postcss: {
      plugins: [
        fontaine({
          fallbacks: {
            'Atkinson Hyperlegible Mono': ['Consolas', 'Courier New']
          },
          resolvePath: (path) =>
            resolve(import.meta.dirname, 'public', `.${path}`)
        })
      ]
    }
  },
  plugins: [
    datasetsPlugin(),
    shareCardHead(),
    themePreferencePlugin(themeStore),
    react({ compiler: { logDiagnostics: true } }),
    {
      ...optimizeLocales.vite({ locales: Object.values(REGIONAL_LOCALES) }),
      enforce: 'pre'
    }
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src')
    }
  },
  server: {
    port: 5480,
    strictPort: true
  }
})
