import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Gera as tabelas do Better Auth com a CLI dele, a partir da configuração da API, e as ajusta
// ao padrão do projeto: a CLI escreve IDs UUIDv4 (gen_random_uuid) e timestamp sem fuso; aqui
// eles viram uuidv7() e timestamptz, como em `src/columns.ts`. Use sempre `pnpm auth:generate`:
// rodar a CLI direto misturaria UUIDv4 e UUIDv7 no banco.

const output = fileURLToPath(new URL('../src/schema/auth.ts', import.meta.url))

const header = `// Gerado por \`pnpm auth:generate\` a partir da configuração do Better Auth em
// apps/api/src/auth. Não edite à mão: mude a configuração e gere de novo.
// oxlint-disable

`

// Via shell porque, no Windows, o pnpm é um .cmd. Só o caminho de saída é variável e vai entre aspas.
function run(command: string) {
  execSync(command, { stdio: 'inherit' })
}

run(
  `pnpm --filter @acolhemais/api exec auth generate --config src/auth/cli.ts --output "${output}" --yes`,
)

const generated = readFileSync(output, 'utf8')
const adjusted = generated
  .replaceAll('pg_catalog.gen_random_uuid()', 'uuidv7()')
  .replaceAll(/timestamp\((['"])(\w+)\1\)/g, "timestamp('$2', { withTimezone: true })")

// Se a CLI mudar o formato, falha aqui em vez de gravar um schema fora do padrão.
const leftovers = adjusted.match(/gen_random_uuid|timestamp\(\s*(['"])\w+\1\s*\)/g)
if (leftovers) {
  throw new Error(`Schema gerado fora do padrão; ajuste este script: ${leftovers.join(', ')}`)
}

writeFileSync(output, header + adjusted)
run(`pnpm exec oxfmt "${output}"`)
