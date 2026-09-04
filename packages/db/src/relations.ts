import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

/**
 * Relações entre as tabelas (Relations v2 do Drizzle), usadas pelas consultas `db.query` e
 * pelos joins do Better Auth. As do Better Auth vêm geradas e entram por último.
 */
export const relations = { ...defineRelations(schema), ...schema.authRelations }
