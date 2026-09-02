/**
 * Catálogo fixo de permissões de uma organização.
 *
 * Organizações não criam permissões novas: apenas combinam estas em papéis
 * e concessões individuais. Adicionar uma permissão aqui exige revisão de
 * 2 mantenedores (ver CODEOWNERS).
 */
export const PERMISSIONS = [
  'animal.create',
  'animal.update',
  'animal.archive',
  'application.view',
  'application.view_sensitive',
  'application.move_stage',
  'application.approve',
  'adoption.complete',
  'post_adoption.review',
  'incident.report',
  'foster.manage',
  'page.customize',
  'team.manage',
  'organization.configure',
] as const

export type Permission = (typeof PERMISSIONS)[number]

/** Permissões que dão acesso a dados pessoais sensíveis: exigem 2FA ativo. */
export const SENSITIVE_PERMISSIONS: readonly Permission[] = [
  'application.view_sensitive',
  'team.manage',
  'organization.configure',
]

const permissionSet: ReadonlySet<string> = new Set(PERMISSIONS)

export function isPermission(value: string): value is Permission {
  return permissionSet.has(value)
}
