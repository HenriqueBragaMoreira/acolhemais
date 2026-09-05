import { PERMISSIONS, type Permission } from './permissions'

export type SystemRoleKey = 'owner' | 'coordinator' | 'volunteer'

/** Papel "Responsável": sempre deve existir ao menos um membro com ele. */
export const OWNER_ROLE: SystemRoleKey = 'owner'

/** Papéis padrão de toda organização aprovada. A ONG pode criar outros a partir do catálogo. */
export const SYSTEM_ROLES: Readonly<Record<SystemRoleKey, readonly Permission[]>> = {
  // Tudo, menos apagar a organização (desativado na plataforma).
  owner: PERMISSIONS.filter((permission) => permission !== 'organization.delete'),
  coordinator: [
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
  ],
  volunteer: ['animal.create', 'animal.update'],
}
