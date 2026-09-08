import type { useTranslations } from 'next-intl'

type Translator = ReturnType<typeof useTranslations>

/**
 * Erro de uma chamada do Better Auth (`{ status, code }`), ou a falha de rede, que chega sem
 * `status`. `retryAfter` vem do cabeçalho Retry-After, quando a API informa.
 */
export type AuthError = { status?: number; code?: string; retryAfter?: number | null }

function asAuthError(failure: unknown): AuthError {
  return failure && typeof failure === 'object' ? (failure as AuthError) : {}
}

/** Sem conexão, excesso de tentativas e falha inesperada: iguais nas telas de acesso. */
function commonMessage(error: AuthError, t: Translator) {
  if (!error.status) return t('AuthErrors.network')
  if (error.status === 429) return t('AuthErrors.tooManyRequests')
  return t('AuthErrors.unexpected')
}

export function signInMessageFor(failure: unknown, t: Translator) {
  const error = asAuthError(failure)
  switch (error.code) {
    case 'INVALID_EMAIL_OR_PASSWORD':
      return t('SignIn.invalidCredentials')
    case 'LOGIN_TEMPORARILY_LOCKED':
      return t('SignIn.locked', { minutes: Math.max(1, Math.ceil((error.retryAfter ?? 60) / 60)) })
    case 'BANNED_USER':
      return t('SignIn.banned')
    default:
      return commonMessage(error, t)
  }
}

export function twoFactorMessageFor(failure: unknown, t: Translator) {
  const error = asAuthError(failure)
  switch (error.code) {
    case 'INVALID_CODE':
      return t('TwoFactor.invalidCode')
    case 'INVALID_BACKUP_CODE':
      return t('TwoFactor.invalidBackupCode')
    case 'ACCOUNT_TEMPORARILY_LOCKED':
      return t('TwoFactor.locked')
    case 'INVALID_TWO_FACTOR_COOKIE':
      return t('TwoFactor.expired')
    default:
      return commonMessage(error, t)
  }
}

export function isInvalidCredentials(failure: unknown) {
  return asAuthError(failure).code === 'INVALID_EMAIL_OR_PASSWORD'
}
