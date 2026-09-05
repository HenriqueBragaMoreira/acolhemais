import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import { LOGIN_FAILURE_WINDOW_MS, loginLockoutMs } from '@acolhemais/domain'
import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthMiddleware, isAPIError } from 'better-auth/api'
import { eq, sql } from 'drizzle-orm'
import { authMessages } from './messages'

const { loginThrottle } = schema
const SIGN_IN_PATH = '/sign-in/email'

type LockoutDeps = { db: Database; secret: string }

function isPasswordSignIn(ctx: { path?: string }) {
  return ctx.path === SIGN_IN_PATH
}

/** Chave da tabela: HMAC-SHA256 do e-mail normalizado, para não guardar o e-mail em si. */
async function emailKey(secret: string, email: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(email.trim().toLowerCase()))
  return [...new Uint8Array(mac)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function emailFrom(body: unknown): string | undefined {
  const email = (body as { email?: unknown } | undefined)?.email
  return typeof email === 'string' && email.length > 0 ? email : undefined
}

async function registerFailure(db: Database, emailHash: string) {
  const now = new Date()
  const windowStart = new Date(now.getTime() - LOGIN_FAILURE_WINDOW_MS)
  // Upsert atômico: tentativas simultâneas não perdem contagem.
  const [row] = await db
    .insert(loginThrottle)
    .values({ emailHash, consecutiveFailures: 1, lastFailureAt: now })
    .onConflictDoUpdate({
      target: loginThrottle.emailHash,
      set: {
        consecutiveFailures: sql`CASE WHEN ${loginThrottle.lastFailureAt} < ${windowStart}
          THEN 1 ELSE ${loginThrottle.consecutiveFailures} + 1 END`,
        lastFailureAt: now,
      },
    })
    .returning({ failures: loginThrottle.consecutiveFailures })

  const lockMs = loginLockoutMs(row?.failures ?? 0)
  if (lockMs > 0) {
    await db
      .update(loginThrottle)
      .set({ lockedUntil: new Date(now.getTime() + lockMs) })
      .where(eq(loginThrottle.emailHash, emailHash))
  }
}

/**
 * Plugin do Better Auth com o bloqueio progressivo de login por senha (regra em
 * `loginLockoutMs`): antes do login, recusa e-mails bloqueados, mesmo com a senha certa;
 * depois, conta as senhas erradas e zera a contagem quando a senha confere.
 */
export function loginLockout({ db, secret }: LockoutDeps) {
  return {
    id: 'acolhemais-login-lockout',
    hooks: {
      before: [
        {
          matcher: isPasswordSignIn,
          handler: createAuthMiddleware(async (ctx) => {
            const email = emailFrom(ctx.body)
            if (!email) return

            const [row] = await db
              .select({ lockedUntil: loginThrottle.lockedUntil })
              .from(loginThrottle)
              .where(eq(loginThrottle.emailHash, await emailKey(secret, email)))
            const remainingMs = (row?.lockedUntil?.getTime() ?? 0) - Date.now()
            if (remainingMs > 0) {
              throw new APIError(
                'TOO_MANY_REQUESTS',
                {
                  code: 'LOGIN_TEMPORARILY_LOCKED',
                  message: authMessages.LOGIN_TEMPORARILY_LOCKED,
                },
                { 'Retry-After': String(Math.ceil(remainingMs / 1000)) },
              )
            }
          }),
        },
      ],
      after: [
        {
          matcher: isPasswordSignIn,
          handler: createAuthMiddleware(async (ctx) => {
            const email = emailFrom(ctx.body)
            if (!email) return

            const emailHash = await emailKey(secret, email)
            const returned = ctx.context.returned
            if (!isAPIError(returned)) {
              // Senha conferiu (mesmo que o login ainda peça o código de 2FA).
              await db.delete(loginThrottle).where(eq(loginThrottle.emailHash, emailHash))
            } else if (returned.body?.code === 'INVALID_EMAIL_OR_PASSWORD') {
              await registerFailure(db, emailHash)
            }
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin
}
