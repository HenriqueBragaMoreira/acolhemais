/** A situação do animal (BR-064). */
export const ANIMAL_STATUSES = [
  'draft',
  'available',
  'in-process',
  'unavailable',
  'adopted',
  'archived',
] as const
export type AnimalStatus = (typeof ANIMAL_STATUSES)[number]

/** Quem aceita candidaturas novas e aparece na vitrine (BR-120). */
export function isAdoptable(status: AnimalStatus) {
  return status === 'available' || status === 'in-process'
}

/**
 * As mudanças que a organização faz à mão (BR-064). `Em processo` e `Adotado` vêm das
 * candidaturas (aprovar, concluir); arquivar cancela as candidaturas ativas (BR-078).
 */
const MANUAL: Record<AnimalStatus, readonly AnimalStatus[]> = {
  draft: ['available', 'archived'],
  available: ['unavailable', 'archived'],
  'in-process': ['archived'],
  unavailable: ['available', 'archived'],
  adopted: [],
  archived: [],
}

export function manualStatusChanges(status: AnimalStatus) {
  return MANUAL[status]
}
