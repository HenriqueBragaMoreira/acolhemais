import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

/** Relações entre as tabelas (Relations v2 do Drizzle), usadas pelas consultas `db.query`. */
export const relations = defineRelations(schema)
