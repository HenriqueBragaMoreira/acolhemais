/** Selos do adotante (BR-090): transparentes, nunca uma nota. `ineligible` é exclusivo. */
export const ADOPTER_BADGES = [
  'new',
  'verified',
  'approved-adopter',
  'attention',
  'ineligible',
] as const
export type AdopterBadge = (typeof ADOPTER_BADGES)[number]

export type PrioritizedApplication = {
  badges: readonly AdopterBadge[]
  /** Conta com e-mail verificado e CPF cadastrado; o perfil sombra (sem conta) não tem. */
  verifiedAccount: boolean
  /** ISO 8601. */
  sentAt: string
}

/** O nível da candidatura na lista da organização (BR-082): 1 vem primeiro. */
export function priorityLevel(application: PrioritizedApplication) {
  if (application.badges.includes('attention')) return 4
  if (application.badges.includes('approved-adopter')) return 1
  return application.verifiedAccount ? 2 : 3
}

/** Para `sort`: por nível e, dentro dele, quem enviou antes primeiro (BR-082). */
export function byPriority(a: PrioritizedApplication, b: PrioritizedApplication) {
  return priorityLevel(a) - priorityLevel(b) || a.sentAt.localeCompare(b.sentAt)
}
