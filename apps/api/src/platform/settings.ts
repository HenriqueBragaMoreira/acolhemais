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
import { recordAudit } from '../audit/record'
import type { AuditOrigin } from '../audit/record'

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

/** Cada parâmetro com o valor em vigor, o padrão e quem o alterou por último. */
export async function settingsView(db: Reader) {
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

type SettingsChanges = ReadonlyMap<PlatformSettingKey, unknown>

type ParsedChanges =
  | { ok: true; changes: SettingsChanges }
  | { ok: false; code: 'UNKNOWN_PLATFORM_SETTING' | 'INVALID_PLATFORM_SETTING'; details: string }

/** Valida o corpo inteiro antes de gravar: ou todos os valores entram, ou nenhum. */
export function parseSettingsChanges(values: Record<string, unknown>): ParsedChanges {
  const changes = new Map<PlatformSettingKey, unknown>()
  for (const [key, value] of Object.entries(values)) {
    if (!isPlatformSettingKey(key)) {
      return { ok: false, code: 'UNKNOWN_PLATFORM_SETTING', details: key }
    }
    try {
      changes.set(key, parsePlatformSetting(key, value))
    } catch (error) {
      if (!(error instanceof DomainError)) throw error
      return { ok: false, code: 'INVALID_PLATFORM_SETTING', details: error.message }
    }
  }
  return { ok: true, changes }
}

type SettingsUpdate = { changes: SettingsChanges; actorUserId: string; origin: AuditOrigin }

/** Grava os valores que mudaram e registra cada mudança na auditoria, na mesma transação. */
export async function updatePlatformSettings(
  db: Database,
  { changes, actorUserId, origin }: SettingsUpdate,
): Promise<void> {
  await db.transaction(async (tx) => {
    // Uma alteração de parâmetros por vez: o "antes" da auditoria é sempre o valor real.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('platform_setting'))`)
    const current = await readPlatformSettings(tx)
    const entries: AuditEntry[] = []
    for (const [key, value] of changes) {
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
    await recordAudit(tx, entries, origin)
  })
}
