import { Hono } from 'hono'
import { z } from 'zod'
import { auditOrigin } from '../audit/record'
import { apiError } from '../http/errors'
import { zodValidator } from '../http/validate'
import { requirePlatformPermission } from './require-permission'
import type { PlatformEnv } from './require-permission'
import { parseSettingsChanges, settingsView, updatePlatformSettings } from './settings'

const updateSchema = z.object({ values: z.record(z.string(), z.unknown()) })

/**
 * Parâmetros da plataforma (BR-030, BR-031). A equipe com `platform_setting.view` consulta e
 * quem tem `platform_setting.update` altera; cada valor alterado vai para a auditoria na
 * mesma transação.
 */
export const platformSettingsRoutes = new Hono<PlatformEnv>()
  .get('/', requirePlatformPermission({ platform_setting: ['view'] }), async (c) =>
    c.json({ settings: await settingsView(c.var.db()) }),
  )
  .patch(
    '/',
    requirePlatformPermission({ platform_setting: ['update'] }),
    zodValidator('json', updateSchema),
    async (c) => {
      const parsed = parseSettingsChanges(c.req.valid('json').values)
      if (!parsed.ok) return apiError(c, 400, parsed.code, parsed.details)

      const db = c.var.db()
      await updatePlatformSettings(db, {
        changes: parsed.changes,
        actorUserId: c.var.platformUser.id,
        origin: auditOrigin(c.req.raw.headers),
      })
      return c.json({ settings: await settingsView(db) })
    },
  )
