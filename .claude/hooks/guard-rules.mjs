// Travas para agentes de IA, usadas pelo hook do Claude Code (guard.mjs) e pelo plugin do
// OpenCode (.opencode/plugins/guard.js). Cada função devolve o motivo do bloqueio ou `null`.

// Início de um comando: começo da linha ou depois de ; & | ( ` $(
const START = String.raw`(?:^|[;&|(\x60]|\$\()\s*`

const PACKAGE_MANAGERS = {
  npm: 'pnpm',
  npx: 'pnpm dlx (ou pnpm exec)',
  yarn: 'pnpm',
  bun: 'pnpm',
  bunx: 'pnpm dlx',
  deno: 'pnpm',
  vlt: 'pnpm',
}

const COMMAND_RULES = [
  ...Object.entries(PACKAGE_MANAGERS).map(([binary, preferred]) => ({
    pattern: new RegExp(`${START}${binary}(?:\\.cmd|\\.exe)?(?:\\s|$)`),
    reason: `use ${preferred} em vez de ${binary} (o projeto usa pnpm).`,
  })),
  {
    pattern: /\bgit\s+push\b.*\s(?:--force(?:-with-lease)?|-f)\b/,
    reason: 'force push reescreve o histórico remoto. Peça ao usuário para rodar.',
  },
  {
    pattern: /\bgit\s+reset\b.*--hard\b/,
    reason: '`git reset --hard` descarta trabalho sem volta. Peça ao usuário.',
  },
  {
    pattern: /\bgit\s+clean\b.*\s-[a-zA-Z]*f/,
    reason: '`git clean -f` apaga arquivos não versionados sem volta. Peça ao usuário.',
  },
  {
    pattern: /\bgit\s+branch\b.*\s-D\b/,
    reason: '`git branch -D` apaga a branch sem checar o merge. Peça ao usuário.',
  },
  {
    pattern: /\bgit\s+(?:checkout|restore)\s+(?:--\s+)?(?:\.|\.\/|\*)(?:\s|$)/,
    reason: 'descartar todas as mudanças do working tree não tem volta. Peça ao usuário.',
  },
  {
    pattern: /\bgit\s+(?:filter-branch|filter-repo)\b/,
    reason: 'reescrever o histórico não tem volta. Peça ao usuário.',
  },
  {
    pattern: /\bgit\s+(?:commit|push|merge|rebase)\b.*\s--no-verify\b/,
    reason: 'não pule os hooks (Lefthook); corrija o que eles apontam.',
  },
  {
    pattern:
      /(?:^|[\s;&|(])(?:@better-auth\/cli|better-auth|auth)(?:@\S+)?\s+(?:generate|migrate)\b/,
    reason:
      'não rode a CLI do Better Auth direto: use `pnpm auth:generate` (ajusta o schema para UUIDv7 e timestamptz) e depois `pnpm db:generate`.',
  },
  {
    pattern: /\bdrizzle-kit\s+push\b/,
    reason: 'o banco só muda por migration: `pnpm db:generate` e `pnpm db:migrate`.',
  },
]

// .env, .env.local, .dev.vars... mas não .env.example.
const SECRET_FILE =
  /(?:^|[\\/\s'"=])(?:\.env(?!\.example\b)(?:\.[\w.-]+)?|\.dev\.vars|[\w.-]+\.pem)(?=$|[\s'"])/
const READS_FILE =
  /(?:^|[\s;&|(])(?:cat|bat|less|more|head|tail|type|gc|Get-Content|grep|rg|sed|awk|source|strings|xxd|od)\b/

/** Motivo para bloquear um comando de shell, ou `null`. */
export function checkCommand(command) {
  if (!command) return null
  const rule = COMMAND_RULES.find(({ pattern }) => pattern.test(command))
  if (rule) return rule.reason
  if (SECRET_FILE.test(command) && READS_FILE.test(command)) {
    return 'não leia arquivos de segredo (.env, .dev.vars, *.pem). Use `apps/api/.env.example` como referência.'
  }
  return null
}

const GENERATED_AUTH_SCHEMA = /packages[\\/]db[\\/]src[\\/]schema[\\/]auth\.ts$/

/** Motivo para bloquear ler ou alterar um arquivo, ou `null`. */
export function checkPath(filePath, { writing = false } = {}) {
  if (!filePath) return null
  if (SECRET_FILE.test(filePath)) {
    return 'arquivos de segredo (.env, .dev.vars, *.pem) ficam com o usuário. Use `.env.example` como referência.'
  }
  if (writing && GENERATED_AUTH_SCHEMA.test(filePath)) {
    return 'o schema do Better Auth é gerado: mude a configuração em apps/api/src/auth e rode `pnpm auth:generate`.'
  }
  return null
}
