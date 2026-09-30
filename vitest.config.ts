import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['utils/promotions.ts'],
      thresholds: {
        lines: 90,
        branches: 90,
      },
    },
  },
})
