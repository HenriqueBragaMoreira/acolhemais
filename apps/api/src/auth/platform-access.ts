import { PLATFORM_ROLES, PLATFORM_STATEMENTS } from '@acolhemais/domain'
import { createAccessControl } from 'better-auth/plugins/access'

/** Controle de acesso da equipe da plataforma, a partir do catálogo em `@acolhemais/domain`. */
export const platformAc = createAccessControl(PLATFORM_STATEMENTS)

export const platformRoles = {
  // Papel de todo usuário comum: nenhuma permissão da plataforma.
  user: platformAc.newRole({}),
  superadmin: platformAc.newRole(PLATFORM_ROLES.superadmin),
  moderator: platformAc.newRole(PLATFORM_ROLES.moderator),
  support: platformAc.newRole(PLATFORM_ROLES.support),
}
