import { defineConfig } from 'vitest/config'

// Testes de integração: exigem o Postgres de pé (`pnpm db:up`) e rodam com `pnpm test:integration`.
export default defineConfig({
  test: {
    include: ['src/**/*.integration.test.ts'],
    globalSetup: ['src/testing/global-setup.ts'],
  },
})
