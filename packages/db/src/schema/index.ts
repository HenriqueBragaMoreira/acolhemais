// Tabelas do banco: cada módulo de domínio ganha seu arquivo aqui e é reexportado.
// Tabelas novas usam `snakeCase.table` (de `drizzle-orm/pg-core`): as colunas declaradas
// sem nome, como as de `id()` e `timestamps()`, viram snake_case no banco.
// `auth.ts` é gerado a partir da configuração do Better Auth: nunca edite à mão.
export * from './auth'
export * from './login-throttle'
