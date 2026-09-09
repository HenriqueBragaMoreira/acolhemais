import { defineConfig, devices } from '@playwright/test'

const CI = Boolean(process.env.CI)
export const WEB_URL = 'http://localhost:3000'
export const API_URL = 'http://localhost:3001'

/**
 * E2E das telas, com a API e o banco de verdade. A web roda o build de produção
 * (`pnpm build` antes), a API roda no workerd via `wrangler dev`, e o Postgres é o do
 * docker compose (ou o serviço do CI), já migrado. Localmente, servidores já abertos
 * nas mesmas portas são reaproveitados.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  // O login conta tentativas por e-mail e o rate limit por IP: um teste por vez evita
  // que um interfira no outro.
  workers: 1,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: WEB_URL,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      // Todo login do E2E sai do mesmo IP: o rate limit por IP fica desligado (só em localhost).
      command:
        'pnpm --filter @acolhemais/api exec wrangler dev --port 3001 --var AUTH_RATE_LIMIT:off',
      url: `${API_URL}/health`,
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm --filter @acolhemais/web start',
      url: WEB_URL,
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
  ],
})
