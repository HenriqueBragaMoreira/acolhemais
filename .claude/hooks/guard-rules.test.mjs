// node --test .claude/hooks/
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkCommand, checkPath } from './guard-rules.mjs'

test('bloqueia outros gerenciadores de pacote, inclusive no meio do comando', () => {
  for (const command of ['npm install', 'cd apps/web && npx shadcn add x', 'yarn', 'bunx foo']) {
    assert.ok(checkCommand(command), command)
  }
  for (const command of ['pnpm install', 'pnpm dlx shadcn@4.23.0 add x', 'pnpm exec oxlint']) {
    assert.equal(checkCommand(command), null, command)
  }
})

test('bloqueia git destrutivo e pular hooks, mas não o uso normal', () => {
  for (const command of [
    'git push --force',
    'git push origin main -f',
    'git push --force-with-lease',
    'git reset --hard HEAD~1',
    'git clean -fdx',
    'git branch -D old',
    'git checkout -- .',
    'git restore .',
    'git commit -s -m "x" --no-verify',
  ]) {
    assert.ok(checkCommand(command), command)
  }
  for (const command of ['git push origin feat/x', 'git reset HEAD file', 'git restore file.ts']) {
    assert.equal(checkCommand(command), null, command)
  }
})

test('manda usar os scripts do projeto para schema e migrations', () => {
  assert.ok(checkCommand('pnpm --filter @acolhemais/api exec auth generate --yes'))
  assert.ok(checkCommand('pnpm dlx @better-auth/cli@latest generate'))
  assert.ok(checkCommand('pnpm exec drizzle-kit push'))
  assert.equal(checkCommand('pnpm auth:generate && pnpm db:generate'), null)
})

test('protege arquivos de segredo, mas não o exemplo', () => {
  assert.ok(checkCommand('cat apps/api/.env'))
  assert.ok(checkCommand('Get-Content apps/api/.dev.vars'))
  assert.equal(checkCommand('cp apps/api/.env.example apps/api/.env'), null)
  assert.ok(checkPath('D:\\repo\\apps\\api\\.env'))
  assert.ok(checkPath('/repo/apps/api/.env.local'))
  assert.equal(checkPath('/repo/apps/api/.env.example'), null)
  assert.equal(checkPath('/repo/apps/api/src/config.ts'), null)
})

test('o schema do Better Auth só muda pelo gerador', () => {
  assert.ok(checkPath('packages/db/src/schema/auth.ts', { writing: true }))
  assert.equal(checkPath('packages/db/src/schema/auth.ts'), null)
})
