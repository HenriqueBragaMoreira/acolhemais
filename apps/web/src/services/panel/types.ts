import type { AdopterBadge, AnimalStatus, ApplicationStage } from '@acolhemais/domain'
import type { INCIDENT_CATEGORIES } from '@/constants/panel'
import type { Animal, AnimalPhoto } from '../animals/types'
import type { AdopterProfile } from '../applications/types'

/** Um animal como a organização o gerencia (FR-030, FR-032): qualquer situação, com histórico. */
export type ManagedAnimal = Omit<Animal, 'status' | 'photos' | 'publishedAt'> & {
  status: AnimalStatus
  /** O rascunho pode ficar sem foto; publicar exige de 1 a 10, a primeira é a capa (BR-061). */
  photos: AnimalPhoto[]
  publishedAt: string | null
  updatedAt: string
  history: AnimalHistoryEntry[]
}

/** Toda mudança de situação: quem, quando, de/para e o motivo (FR-032). */
export type AnimalHistoryEntry = {
  at: string
  from: AnimalStatus | null
  to: AnimalStatus
  by: string
  reason?: string
}

/** O que o formulário de cadastro edita. */
export type AnimalInput = Pick<
  ManagedAnimal,
  | 'name'
  | 'species'
  | 'sex'
  | 'ageGroup'
  | 'bornAround'
  | 'size'
  | 'coat'
  | 'city'
  | 'goodWith'
  | 'health'
  | 'photos'
  | 'story'
  | 'fee'
> & { videoUrl: string }

/** O histórico de uma candidatura (BR-076): etapas, pedidos de informação, recusa, conclusão. */
export type ApplicationEvent =
  | { kind: 'sent'; at: string }
  | { kind: 'moved'; at: string; to: ApplicationStage; by: string }
  | { kind: 'info-requested'; at: string; by: string; message: string }
  | { kind: 'info-answered'; at: string; message: string }
  | { kind: 'refused'; at: string; by: string; reason: string; message: string }
  | { kind: 'completed'; at: string; by: string; date: string }
  | { kind: 'cancelled'; at: string }
  | { kind: 'withdrawn'; at: string }
  | { kind: 'cpf-revealed'; at: string; by: string }

export type ManagedApplication = {
  id: string
  animalId: string
  email: string
  profile: AdopterProfile
  answers: Record<string, string>
  stage: ApplicationStage
  /** Pedido de informação sem resposta: a marcação "aguardando o adotante" (BR-076). */
  awaitingAdopter: boolean
  badges: AdopterBadge[]
  verifiedAccount: boolean
  /** Outras candidaturas ativas do adotante, sem dizer onde (BR-084). */
  otherActive: number
  sentAt: string
  /** Quando foi movida nesta visita, para a marca "Movida agora". */
  movedAt: string | null
  history: ApplicationEvent[]
  /**
   * Ocorrências procedentes que sustentam o selo `Atenção` ou `Inelegível`, só no resumo
   * estruturado de BR-100: categoria, mês e até quando vale. Sem texto livre e sem a autora.
   */
  incidents: AdopterIncident[]
}

export type AdopterIncident = {
  category: (typeof INCIDENT_CATEGORIES)[number]
  outcome: 'minor' | 'severe'
  /** Mês da decisão, `AAAA-MM`. */
  decidedIn: string
  /** Até quando o selo vale, `AAAA-MM`; `null` para o grave, que só sai na revisão. */
  validUntil: string | null
}

/** O animal resumido que acompanha cada candidatura. */
export type ApplicationAnimal = Pick<
  ManagedAnimal,
  'id' | 'name' | 'status' | 'species' | 'sex'
> & {
  cover: AnimalPhoto | null
}

export type ApplicationWithAnimal = ManagedApplication & { animal: ApplicationAnimal }
