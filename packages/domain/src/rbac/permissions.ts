/**
 * Catálogo fixo de permissões de uma organização, no formato do plugin `organization` do
 * Better Auth: recurso → ações. Nas regras de domínio, cada permissão é escrita como
 * `recurso.ação` (ex.: `animal.create`).
 *
 * Organizações não criam permissões novas: apenas combinam estas em papéis e concessões
 * individuais. Adicionar uma permissão aqui exige revisão de 2 mantenedores (ver CODEOWNERS).
 */
export const ORGANIZATION_STATEMENTS = {
  // Recursos do próprio plugin: dados da organização e gestão da equipe (membros, convites e
  // papéis). Apagar organizações fica desativado: ninguém recebe `organization.delete`.
  organization: ['update', 'delete'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  ac: ['create', 'read', 'update', 'delete'],
  // Recursos da plataforma
  animal: ['create', 'update', 'archive'],
  application: ['view', 'view_sensitive', 'move_stage', 'approve'],
  adoption: ['complete'],
  post_adoption: ['review'],
  incident: ['report'],
  foster: ['manage'],
  page: ['customize'],
} as const

type Statements = typeof ORGANIZATION_STATEMENTS
type Resource = keyof Statements

export type Permission = {
  [R in Resource]: `${R}.${Statements[R][number]}`
}[Resource]

/** Permissões no formato do Better Auth (recurso → ações), para montar papéis. */
export type PermissionStatements = { [R in Resource]?: Statements[R][number][] }

export const PERMISSIONS: readonly Permission[] = Object.entries(ORGANIZATION_STATEMENTS).flatMap(
  ([resource, actions]) => actions.map((action) => `${resource}.${action}` as Permission),
)

/** Gestão da equipe: membros, convites e papéis da organização. */
export const TEAM_MANAGEMENT_PERMISSIONS: readonly Permission[] = [
  'member.create',
  'member.update',
  'member.delete',
  'invitation.create',
  'invitation.cancel',
  'ac.create',
  'ac.read',
  'ac.update',
  'ac.delete',
]

/** Permissões que dão acesso a dados pessoais sensíveis ou ao controle da organização: exigem 2FA. */
export const SENSITIVE_PERMISSIONS: readonly Permission[] = [
  'application.view_sensitive',
  'organization.update',
  ...TEAM_MANAGEMENT_PERMISSIONS,
]

const permissionSet: ReadonlySet<string> = new Set(PERMISSIONS)

export function isPermission(value: string): value is Permission {
  return permissionSet.has(value)
}

/** Converte permissões `recurso.ação` para o formato do Better Auth. */
export function toStatements(permissions: readonly Permission[]): PermissionStatements {
  const statements: Record<string, string[]> = {}
  for (const permission of permissions) {
    const [resource = '', action = ''] = permission.split('.')
    ;(statements[resource] ??= []).push(action)
  }
  return statements as PermissionStatements
}
