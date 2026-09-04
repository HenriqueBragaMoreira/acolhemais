import { cloudflareTest } from '@cloudflare/vitest-plugin'
import { defineConfig } from 'vitest/config'

// Testes de integração: rodam no workerd contra o Postgres local (`pnpm db:up`), com um banco
// clonado do template a cada execução (ver src/test/global-setup.ts).
export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: { bindings: { WEB_ORIGIN: 'https://web.test' } },
    }),
  ],
  test: {
    include: ['src/**/*.integration.test.ts'],
    globalSetup: ['src/test/global-setup.ts'],
  },
})
