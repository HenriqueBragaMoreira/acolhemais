import { schema } from '@acolhemais/db'
import type { Database } from '@acolhemais/db'
import { and, eq } from 'drizzle-orm'
import { audited, auditEntry, fieldNames, nonEmptyString, organizationTarget } from './define'
import type { Actor, AuditedRoute, Body } from './define'

type MemberRow = { id: string; organizationId: string; userId: string; role: string }
type InvitationRow = { id: string; organizationId: string; role: string }
type RoleRow = { id: string; organizationId: string; role: string }
type PermissionMap = Record<string, string[]>

async function currentMemberRole(db: Database, memberId: string | null) {
  if (!memberId) return null
  const [row] = await db
    .select({ role: schema.member.role })
    .from(schema.member)
    .where(eq(schema.member.id, memberId))
  return row?.role ?? null
}

/** Papel criado pela ONG, pelo id ou pelo nome (na organização do corpo ou na ativa). */
async function currentOrganizationRole(
  db: Database,
  body: Body,
  actor: Actor | null,
): Promise<RoleRow | null> {
  const { organizationRole } = schema
  const roleId = nonEmptyString(body.roleId)
  const organizationId = nonEmptyString(body.organizationId) ?? actor?.activeOrganizationId ?? null
  const roleName = nonEmptyString(body.roleName)
  const where = roleId
    ? eq(organizationRole.id, roleId)
    : organizationId && roleName
      ? and(
          eq(organizationRole.organizationId, organizationId),
          eq(organizationRole.role, roleName),
        )
      : undefined
  if (!where) return null
  const [row] = await db.select().from(organizationRole).where(where)
  return row ?? null
}

/** Organizações (plugin `organization`). */
export const ORGANIZATION_ROUTES: Record<string, AuditedRoute> = {
  '/organization/update': audited<{ id: string } | null>()({
    entries: ({ actor, body, returned: organization }) => {
      if (!organization) return []
      return [
        auditEntry('organization.updated', actor, {
          organizationId: organization.id,
          targetId: organization.id,
          metadata: { fields: fieldNames(body.data) },
        }),
      ]
    },
  }),
  '/organization/remove-member': audited<{ member: MemberRow }>()({
    entries: ({ actor, returned: { member } }) => [
      auditEntry('member.removed', actor, {
        ...organizationTarget(member),
        metadata: { userId: member.userId, role: member.role },
      }),
    ],
  }),
  '/organization/leave': audited<MemberRow>()({
    entries: ({ actor, returned: member }) => [
      auditEntry('member.left', actor, {
        ...organizationTarget(member),
        metadata: { userId: member.userId, role: member.role },
      }),
    ],
  }),
  '/organization/update-member-role': audited<MemberRow>()({
    snapshot: ({ db, body }) => currentMemberRole(db, nonEmptyString(body.memberId)),
    entries: ({ actor, returned: member, snapshot: previousRole }) => [
      auditEntry('member.role_changed', actor, {
        ...organizationTarget(member),
        metadata: { userId: member.userId, from: previousRole ?? '', to: member.role },
      }),
    ],
  }),
  '/organization/invite-member': audited<InvitationRow>()({
    entries: ({ actor, returned: invitation }) => [
      auditEntry('invitation.created', actor, {
        ...organizationTarget(invitation),
        metadata: { role: invitation.role },
      }),
    ],
  }),
  '/organization/cancel-invitation': audited<InvitationRow>()({
    entries: ({ actor, returned: invitation }) => [
      auditEntry('invitation.canceled', actor, { ...organizationTarget(invitation), metadata: {} }),
    ],
  }),
  '/organization/accept-invitation': audited<{
    invitation: InvitationRow
    member: MemberRow | null
  }>()({
    entries: ({ actor, returned: { invitation, member } }) => {
      const accepted = auditEntry('invitation.accepted', actor, {
        ...organizationTarget(invitation),
        metadata: { role: invitation.role, memberId: member?.id ?? null },
      })
      if (!member) return [accepted]
      return [
        accepted,
        auditEntry('member.added', actor, {
          ...organizationTarget(member),
          metadata: { userId: member.userId, role: member.role },
        }),
      ]
    },
  }),
  '/organization/reject-invitation': audited<{ invitation: InvitationRow }>()({
    entries: ({ actor, returned: { invitation } }) => [
      auditEntry('invitation.rejected', actor, { ...organizationTarget(invitation), metadata: {} }),
    ],
  }),
  '/organization/create-role': audited<{ roleData: RoleRow }>()({
    entries: ({ actor, body, returned: { roleData: role } }) => [
      auditEntry('organization_role.created', actor, {
        ...organizationTarget(role),
        metadata: { role: role.role, permission: (body.permission ?? {}) as PermissionMap },
      }),
    ],
  }),
  '/organization/update-role': audited()({
    snapshot: ({ db, body, actor }) => currentOrganizationRole(db, body, actor),
    entries: ({ actor, body, snapshot: role }) => {
      if (!role) return []
      const data = (body.data ?? {}) as { roleName?: string; permission?: PermissionMap }
      return [
        auditEntry('organization_role.updated', actor, {
          ...organizationTarget(role),
          metadata: {
            role: role.role,
            renamedTo: nonEmptyString(data.roleName),
            permission: data.permission ?? null,
          },
        }),
      ]
    },
  }),
  '/organization/delete-role': audited()({
    snapshot: ({ db, body, actor }) => currentOrganizationRole(db, body, actor),
    entries: ({ actor, snapshot: role }) => {
      if (!role) return []
      return [
        auditEntry('organization_role.deleted', actor, {
          ...organizationTarget(role),
          metadata: { role: role.role },
        }),
      ]
    },
  }),
}
