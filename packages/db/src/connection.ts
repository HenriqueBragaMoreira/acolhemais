/** Banco local do docker compose: nenhuma credencial real é necessária para desenvolver. */
export const localDatabaseUrl = 'postgres://acolhemais:acolhemais@localhost:5432/acolhemais'

export function databaseUrl(): string {
  return process.env.DATABASE_URL ?? localDatabaseUrl
}
