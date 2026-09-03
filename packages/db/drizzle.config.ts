import { defineConfig } from 'drizzle-kit'
import { databaseUrl } from './src/connection'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './migrations',
  casing: 'snake_case',
  dbCredentials: { url: databaseUrl() },
})
