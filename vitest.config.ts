import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['utils/promotions.ts'],
      thresholds: {
        lines: 90,
        branches: 90
      }
    }
  }
})