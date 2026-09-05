import { ORGANIZATION_STATEMENTS, SYSTEM_ROLES, toStatements } from '@acolhemais/domain'
import { createAccessControl } from 'better-auth/plugins/access'

/** Controle de acesso dentro das organizações, a partir do catálogo em `@acolhemais/domain`. */
export const organizationAc = createAccessControl(ORGANIZATION_STATEMENTS)

/** Papéis padrão de toda organização: Responsável, Coordenador e Voluntário. */
export const organizationRoles = {
  owner: organizationAc.newRole(toStatements(SYSTEM_ROLES.owner)),
  coordinator: organizationAc.newRole(toStatements(SYSTEM_ROLES.coordinator)),
  volunteer: organizationAc.newRole(toStatements(SYSTEM_ROLES.volunteer)),
}
