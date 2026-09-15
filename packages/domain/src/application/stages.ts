/** As etapas de uma candidatura (BR-076), na ordem do caminho. */
export const APPLICATION_STAGES = [
  'received',
  'reviewing',
  'interview',
  'approved',
  'awaiting-confirmation',
  'completed',
  'refused',
  'withdrawn',
  'expired',
  'cancelled',
] as const
export type ApplicationStage = (typeof APPLICATION_STAGES)[number]

/** O caminho que a organização percorre, da chegada à aprovação. */
export const PIPELINE_STAGES = ['received', 'reviewing', 'interview', 'approved'] as const
export type PipelineStage = (typeof PIPELINE_STAGES)[number]

/** Ativas contam para o limite do adotante (BR-074); as demais são terminais e não voltam. */
const ACTIVE: readonly ApplicationStage[] = [...PIPELINE_STAGES, 'awaiting-confirmation']

export function isActiveStage(stage: ApplicationStage) {
  return ACTIVE.includes(stage)
}

/**
 * Para onde a organização pode mover a candidatura (BR-076): qualquer outra etapa do caminho,
 * para frente ou para trás, enquanto ela estiver ativa. `Aguardando confirmação` é do sistema
 * (BR-080), `Concluída` só pela conclusão da adoção (BR-079) e `Recusada` só pela recusa (BR-077).
 */
export function stageMoves(stage: ApplicationStage): PipelineStage[] {
  if (!isActiveStage(stage)) return []
  return PIPELINE_STAGES.filter((target) => target !== stage)
}

/** A etapa seguinte do caminho, ou `null` na aprovada (dali, só concluindo) e nas terminais. */
export function nextStage(stage: ApplicationStage): PipelineStage | null {
  const index = PIPELINE_STAGES.indexOf(stage as PipelineStage)
  return index === -1 ? null : (PIPELINE_STAGES[index + 1] ?? null)
}
