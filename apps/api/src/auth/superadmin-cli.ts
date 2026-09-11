import { createDb, databaseUrl } from '@acolhemais/db'
import { DomainError } from '@acolhemais/domain'
import { setSuperadmin } from './superadmin'

// `pnpm auth:superadmin grant|revoke <email>`: roda no Node, fora do Workers, contra o banco de
// DATABASE_URL. É o único caminho para dar ou tirar `superadmin` (BR-013).

const [action, email] = process.argv.slice(2)
if ((action !== 'grant' && action !== 'revoke') || !email) {
  console.error('Uso: pnpm auth:superadmin grant|revoke <email>')
  process.exit(1)
}

const db = createDb(databaseUrl())
try {
  const { changed } = await setSuperadmin(db, email, action === 'grant')
  const done = action === 'grant' ? 'agora é superadmin' : 'deixou de ser superadmin'
  console.info(changed ? `${email} ${done}.` : `Nada a fazer: ${email} já estava assim.`)
  if (changed && action === 'grant') {
    console.info('A conta precisa ativar o 2FA antes de usar as rotas da equipe.')
  }
} catch (error) {
  if (error instanceof DomainError && error.code === 'SUPERADMIN_REQUIRED') {
    console.error('Esta é a última conta superadmin: dê o papel a outra conta antes de tirar.')
  } else {
    console.error(error instanceof Error ? error.message : error)
  }
  process.exitCode = 1
} finally {
  await db.$client.end()
}
