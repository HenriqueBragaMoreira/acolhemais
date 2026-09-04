import { createDb, databaseUrl } from '@acolhemais/db'
import { loadConfig } from '../env'
import { createAuth } from '.'

// Instância usada só pela CLI do Better Auth (`auth generate`, `auth create-admin`), que roda no
// Node, fora do Workers. Usa a configuração padrão de desenvolvimento e o banco de DATABASE_URL.
const db = createDb(databaseUrl())

export const auth = createAuth({
  config: loadConfig({ HYPERDRIVE: { connectionString: databaseUrl() } }),
  db,
})
