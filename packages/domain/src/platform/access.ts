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
 * acesso a dados pessoais sem o titular e uma porta para sequestro de conta.
 */
export const PLATFORM_ROLES = {
  superadmin: {
    user: ['create', 'list', 'set-role', 'ban', 'delete', 'get', 'update'],
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

/** Papéis da plataforma de um usuário. O Better Auth guarda os papéis separados por vírgula. */
export function platformRolesOf(role: string | null | undefined): PlatformRole[] {
  return (role ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(isPlatformRole)
}

/** Toda a equipe da plataforma precisa de 2FA ativo. */
export function platformRequiresTwoFactor(role: string | null | undefined): boolean {
  return platformRolesOf(role).length > 0
}
