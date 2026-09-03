import { cloudflareTest } from '@cloudflare/vitest-plugin'
import { defineConfig } from 'vitest/config'

// Os testes rodam dentro do workerd, o mesmo runtime de produção, com a config do wrangler.jsonc.
export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      // Bindings fixas nos testes: não dependem do .env de quem roda.
      miniflare: { bindings: { WEB_ORIGIN: 'https://web.test' } },
    }),
  ],
})
