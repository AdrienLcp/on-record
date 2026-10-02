import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts', '**/fixtures/**'],
      include: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.ts'],
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary']
    },
    projects: [
      'apps/ingest/vitest.config.ts',
      'apps/web/vite.config.ts',
      'packages/protocol'
    ]
  }
})
