import { resolve } from 'node:path'

import { metricTwins } from '@adrienlcp/styles/metric-twins'
import { themePreferencePlugin } from '@adrienlcp/theme-preference/vite'
import optimizeLocales from '@react-aria/optimize-locales-plugin'
import react from '@vitejs/plugin-react'
import fontaine from 'fontaine/postcss'
import { defineConfig } from 'vite'

import { datasetsPlugin } from './scripts/datasets-plugin.ts'
import { shareCardHead } from './scripts/share-card-head.ts'
import { REGIONAL_LOCALES } from './src/presentation/i18n/regional-locales.ts'
import { themeStore } from './src/presentation/theme/theme-store.ts'

/** Variable faces whose weights set at different widths: `_fonts.sass` writes a fallback face per weight band. */
const FALLBACK_FACES_WRITTEN_BY_HAND = new Set([
  'Atkinson Hyperlegible Next fallback'
])

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
            resolve(import.meta.dirname, 'public', `.${path}`),
          skipFontFaceGeneration: (fallbackName) =>
            FALLBACK_FACES_WRITTEN_BY_HAND.has(fallbackName)
        }),
        metricTwins()
      ]
    }
  },
  plugins: [
    datasetsPlugin(),
    shareCardHead(resolve(import.meta.dirname, 'index.html')),
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
