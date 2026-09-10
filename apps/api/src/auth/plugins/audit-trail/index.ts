import type { Database } from '@acolhemais/db'
import type { AuditEntry } from '@acolhemais/domain'
import type { BetterAuthPlugin } from 'better-auth'
import { createAuthMiddleware, isAPIError } from 'better-auth/api'
import { auditOrigin, recordAudit } from '../../../audit/record'
import { pluginSession } from '../../session'
import { ACCOUNT_ROUTES } from './account'
import { ADMIN_ROUTES } from './admin'
import { auditEntry } from './define'
import type { Actor, AuditedRoute, Body } from './define'
import { ORGANIZATION_ROUTES } from './organization'

/**
 * Ações do Better Auth que vão para a auditoria, por rota. Os registros são gravados depois
 * que a ação deu certo: os plugins não abrem uma transação que inclua o nosso registro.
 *
 * Funções só do servidor, sem rota (ex.: `auth.api.addMember`), não passam por aqui: o nosso
 * código que as chama registra a auditoria, na mesma transação da regra de negócio.
 */
const AUDITED_ROUTES: Record<string, AuditedRoute> = {
  ...ADMIN_ROUTES,
  ...ORGANIZATION_ROUTES,
  ...ACCOUNT_ROUTES,
}

function isAudited(ctx: { path?: string }) {
  return ctx.path !== undefined && Object.hasOwn(AUDITED_ROUTES, ctx.path)
}

type Pending = { actor: Actor | null; snapshot: unknown }

/**
 * Plugin do Better Auth que registra na auditoria as ações sobre permissões e a segurança das
 * contas (`AUDITED_ROUTES`) e o vínculo de logins externos (ex.: Google).
 *
 * Antes da ação, guarda quem a pediu e o estado anterior; depois, se deu certo, grava. Como a
 * instância do Better Auth é criada por requisição, esse estado guardado é da requisição. A
 * gravação acontece depois que a mudança já foi salva: se ela falhar, a mudança fica sem
 * registro e o erro vai para o log da API (não adianta falhar a resposta).
 */
export function auditTrail({ db }: { db: Database }) {
  const pending = new Map<string, Pending[]>()

  async function record(path: string, build: () => AuditEntry[], headers: Headers | undefined) {
    try {
      await recordAudit(db, build(), auditOrigin(headers))
    } catch (error) {
      console.error(`Falha ao gravar a auditoria de ${path}:`, error)
    }
  }

  return {
    id: 'acolhemais-audit-trail',
    init: () => ({
      options: {
        databaseHooks: {
          account: {
            create: {
              after: async (account, ctx) => {
                if (account.providerId === 'credential') return
                await record(
                  'vínculo de conta',
                  () => [
                    auditEntry(
                      'account.provider_linked',
                      { userId: account.userId },
                      { targetId: account.userId, metadata: { provider: account.providerId } },
                    ),
                  ],
                  ctx?.headers,
                )
              },
            },
          },
        },
      },
    }),
    hooks: {
      before: [
        {
          matcher: isAudited,
          handler: createAuthMiddleware(async (ctx) => {
            const route = AUDITED_ROUTES[ctx.path] as AuditedRoute
            const session = await pluginSession(ctx)
            const actor: Actor | null = session
              ? {
                  userId: session.user.id,
                  activeOrganizationId: session.session.activeOrganizationId ?? null,
                  twoFactorEnabled: session.user.twoFactorEnabled === true,
                }
              : null
            const body = (ctx.body ?? {}) as Body
            const snapshot = await route.snapshot?.({ db, body, actor })
            pending.set(ctx.path, [...(pending.get(ctx.path) ?? []), { actor, snapshot }])
          }),
        },
      ],
      after: [
        {
          matcher: isAudited,
          handler: createAuthMiddleware(async (ctx) => {
            const stack = pending.get(ctx.path)
            const state = stack?.pop()
            const returned = ctx.context.returned
            if (!state || isAPIError(returned) || returned instanceof Response) return

            const route = AUDITED_ROUTES[ctx.path] as AuditedRoute
            const body = (ctx.body ?? {}) as Body
            await record(
              ctx.path,
              () => route.entries({ db, body, returned, ...state }),
              ctx.headers,
            )
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin
}
