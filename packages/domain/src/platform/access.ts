import { DomainError } from '../errors'

/**
 * Permissões da equipe da plataforma (Superadmin, Moderador, Suporte), aplicadas pelo plugin
 * `admin` do Better Auth. `user` e `session` são recursos do próprio plugin (gestão de contas);
 * os demais são da plataforma. Mudanças aqui exigem revisão de 2 mantenedores (CODEOWNERS).
 */
export const PLATFORM_STATEMENTS = {
  user: [
    'create',
    'list',
    'set-role',
    'ban',
    'impersonate',
    'impersonate-admins',
    'delete',
    'set-password',
    'set-email',
    'get',
    'update',
  ],
  session: ['list', 'revoke', 'delete'],
  /** Inscrição e ciclo de vida das organizações (aprovar, recusar, suspender...). */
  organization_review: ['view', 'decide'],
  /** Ocorrências da reputação de adotantes: dados sensíveis. */
  incident: ['view', 'decide'],
  /** Denúncias públicas de conteúdo. */
  content_report: ['view', 'decide'],
  platform_setting: ['view', 'update'],
  audit_log: ['view'],
} as const

type Statements = typeof PLATFORM_STATEMENTS
export type PlatformGrants = { [R in keyof Statements]?: readonly Statements[R][number][] }

/**
 * Ninguém personifica outro usuário nem define a senha ou o e-mail de outra pessoa: seria
 * acesso a dados pessoais sem o titular e uma porta para sequestro de conta. Ninguém remove
 * contas (BR-016): para afastar alguém, a equipe bane.
 */
export const PLATFORM_ROLES = {
  superadmin: {
    user: ['create', 'list', 'set-role', 'ban', 'get', 'update'],
    session: ['list', 'revoke', 'delete'],
    organization_review: ['view', 'decide'],
    incident: ['view', 'decide'],
    content_report: ['view', 'decide'],
    platform_setting: ['view', 'update'],
    audit_log: ['view'],
  },
  moderator: {
    user: ['list', 'get'],
    organization_review: ['view', 'decide'],
    incident: ['view', 'decide'],
    content_report: ['view', 'decide'],
    platform_setting: ['view'],
  },
  /** Somente leitura, e sem acesso às ocorrências. */
  support: {
    user: ['list', 'get'],
    organization_review: ['view'],
    content_report: ['view'],
    platform_setting: ['view'],
  },
} as const satisfies Record<string, PlatformGrants>

export type PlatformRole = keyof typeof PLATFORM_ROLES

export const PLATFORM_ROLE_KEYS = Object.keys(PLATFORM_ROLES) as PlatformRole[]

export function isPlatformRole(role: string): role is PlatformRole {
  return Object.hasOwn(PLATFORM_ROLES, role)
}

export const SUPERADMIN_ROLE = 'superadmin' satisfies PlatformRole

/**
 * Papéis que o superadmin dá e tira pela API (BR-013) e informa ao criar uma conta (BR-015).
 * `superadmin` só muda pela linha de comando.
 */
export const TEAM_ROLES: readonly string[] = ['moderator', 'support'] satisfies PlatformRole[]

/** Papéis informados à API, em texto ou lista, cada um podendo vir separado por vírgula. */
export function requestedRoles(value: unknown): string[] {
  const list: unknown[] = Array.isArray(value) ? value : [value]
  return list.flatMap((role) => (typeof role === 'string' ? splitRoles(role) : []))
}

/** Se a troca de papel dá, tira ou mantém `superadmin`: pela API, sempre recusada (BR-013). */
export function touchesSuperadmin(
  currentRole: string | null | undefined,
  requested: readonly string[],
): boolean {
  return splitRoles(currentRole).includes(SUPERADMIN_ROLE) || requested.includes(SUPERADMIN_ROLE)
}

/** A plataforma nunca fica sem superadmin: só ele altera parâmetros e lê a auditoria (BR-013). */
export function assertSuperadminRemains(otherSuperadmins: number): void {
  if (otherSuperadmins < 1) {
    throw new DomainError('SUPERADMIN_REQUIRED', 'Platform must keep at least one superadmin')
  }
}

/** Papéis guardados num campo só: o Better Auth separa vários papéis por vírgula. */
export function splitRoles(value: string | null | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean)
}

/** Papéis da plataforma de um usuário. */
export function platformRolesOf(role: string | null | undefined): PlatformRole[] {
  return splitRoles(role).filter(isPlatformRole)
}

/** Toda a equipe da plataforma precisa de 2FA ativo. */
export function platformRequiresTwoFactor(role: string | null | undefined): boolean {
  return platformRolesOf(role).length > 0
}

/** Se algum dos papéis da plataforma do usuário concede todas as permissões pedidas. */
export function platformCan(role: string | null | undefined, permissions: PlatformGrants): boolean {
  const requested = Object.entries(permissions) as [keyof Statements, readonly string[]][]
  return platformRolesOf(role).some((platformRole) => {
    const grants: PlatformGrants = PLATFORM_ROLES[platformRole]
    return requested.every(([resource, actions]) =>
      actions.every((action) =>
        (grants[resource] as readonly string[] | undefined)?.includes(action),
      ),
    )
  })
}
