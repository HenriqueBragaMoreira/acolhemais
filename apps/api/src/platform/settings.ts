import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import {
  DomainError,
  isPlatformSettingKey,
  parsePlatformSetting,
  PLATFORM_SETTING_KEYS,
  PLATFORM_SETTINGS,
  resolvePlatformSettings,
} from '@acolhemais/domain'
import type { AuditEntry, PlatformSettingKey, PlatformSettings } from '@acolhemais/domain'
import { sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { auditOrigin, recordAudit } from '../audit/record'
import { apiError } from './errors'
import { requirePlatformPermission } from './middleware'
import type { PlatformEnv } from './middleware'

const { platformSetting } = schema

type Reader = Pick<Database, 'select'>

async function storedSettings(db: Reader) {
  const rows = await db.select().from(platformSetting)
  const stored = new Map(rows.map((row) => [row.key, row]))
  const values = resolvePlatformSettings(
    Object.fromEntries(rows.map((row) => [row.key, row.value])),
  )
  return { stored, values }
}

/** Parâmetros em vigor: os alterados no banco sobre os padrões do domínio. */
export async function readPlatformSettings(db: Reader): Promise<PlatformSettings> {
  return (await storedSettings(db)).values
}

async function settingsView(db: Reader) {
  const { stored, values } = await storedSettings(db)
  return PLATFORM_SETTING_KEYS.map((key) => {
    const definition = PLATFORM_SETTINGS[key]
    const row = stored.get(key)
    return {
      key,
      value: values[key],
      default: definition.default,
      unit: definition.unit,
      description: definition.description,
      updatedAt: row?.updatedAt ?? null,
      updatedBy: row?.updatedBy ?? null,
    }
  })
}

const updateSchema = z.object({ values: z.record(z.string(), z.unknown()) })

/** Valida o corpo inteiro antes de gravar: ou todos os valores entram, ou nenhum. */
function parseUpdate(values: Record<string, unknown>) {
  const parsed = new Map<PlatformSettingKey, unknown>()
  for (const [key, value] of Object.entries(values)) {
    if (!isPlatformSettingKey(key)) return { error: 'UNKNOWN_PLATFORM_SETTING', key } as const
    parsed.set(key, parsePlatformSetting(key, value))
  }
  return { parsed } as const
}

/**
 * Parâmetros da plataforma (PLANO §3.10). A equipe com `platform_setting.view` consulta e
 * quem tem `platform_setting.update` altera; cada valor alterado vai para a auditoria na
 * mesma transação.
 */
export const platformSettings = new Hono<PlatformEnv>()
  .get('/', requirePlatformPermission({ platform_setting: ['view'] }), async (c) =>
    c.json({ settings: await settingsView(c.var.db()) }),
  )
  .patch('/', requirePlatformPermission({ platform_setting: ['update'] }), async (c) => {
    const body = updateSchema.safeParse(await c.req.json().catch(() => null))
    if (!body.success) return apiError(c, 400, 'INVALID_REQUEST')

    let update: ReturnType<typeof parseUpdate>
    try {
      update = parseUpdate(body.data.values)
    } catch (error) {
      if (!(error instanceof DomainError)) throw error
      return apiError(c, 400, 'INVALID_PLATFORM_SETTING', error.message)
    }
    if ('error' in update) return apiError(c, 400, update.error, update.key)

    const db = c.var.db()
    const actorUserId = c.var.platformUser.id
    await db.transaction(async (tx) => {
      // Uma alteração de parâmetros por vez: o "antes" da auditoria é sempre o valor real.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('platform_setting'))`)
      const current = await readPlatformSettings(tx)
      const entries: AuditEntry[] = []
      for (const [key, value] of update.parsed) {
        if (JSON.stringify(value) === JSON.stringify(current[key])) continue
        await tx
          .insert(platformSetting)
          .values({ key, value, updatedBy: actorUserId })
          .onConflictDoUpdate({
            target: platformSetting.key,
            set: { value, updatedBy: actorUserId, updatedAt: new Date() },
          })
        entries.push({
          action: 'platform_setting.updated',
          actorUserId,
          targetId: key,
          metadata: { from: current[key], to: value },
        })
      }
      await recordAudit(tx, entries, auditOrigin(c.req.raw.headers))
    })

    return c.json({ settings: await settingsView(db) })
  })
