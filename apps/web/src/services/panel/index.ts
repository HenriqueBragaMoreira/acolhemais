import {
  ANIMAL_STATUSES,
  type AdopterBadge,
  type AnimalStatus,
  type ApplicationStage,
  byPriority,
  isActiveStage,
  type PipelineStage,
  PIPELINE_STAGES,
} from '@acolhemais/domain'
import type { Animal, AnimalPhoto } from '../animals'
import type { AdopterProfile } from '../applications'
import { demoAnimals, demoApplications, PANEL_ORGANIZATION } from './demo-data'

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

export const INCIDENT_CATEGORIES = ['return-without-notice', 'neglect', 'abandonment'] as const

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

/**
 * Teto da taxa de adoção (`adoptionFeeCapCents`, BR-063) nesta demonstração; na plataforma, a
 * equipe define e ele vai no máximo a R$ 500.
 */
export const DEMO_FEE_CAP_CENTS = 15000

/** Cartões por coluna antes do "Ver mais". */
export const APPLICATIONS_PAGE_SIZE = 10
/** Animais por página na lista do painel. */
export const ANIMALS_PAGE_SIZE = 20

/** Sem acento e sem caixa: "algodao" acha "Algodão". */
function searchable(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

// shortcut: o painel guarda tudo na memória do navegador até existir a API; recarregar a página
// volta aos dados de exemplo. Com a API, estas funções chamam `api.organizations.{slug}`.
let store: { animals: ManagedAnimal[]; applications: ManagedApplication[] } | null = null

function db() {
  store ??= { animals: demoAnimals(), applications: demoApplications() }
  return store
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Cópia, para o cache das telas nunca ver a mudança antes de pedir de novo. */
const copy = <T>(value: T): T => structuredClone(value)

const now = () => new Date().toISOString()

function findApplication(id: string) {
  const found = db().applications.find((application) => application.id === id)
  if (!found) throw new Error(`Candidatura ${id} não existe.`)
  return found
}

function findAnimal(id: string) {
  const found = db().animals.find((animal) => animal.id === id)
  if (!found) throw new Error(`Animal ${id} não existe.`)
  return found
}

function setStatus(animal: ManagedAnimal, to: AnimalStatus, by: string, reason?: string) {
  if (animal.status === to) return
  animal.history.push({ at: now(), from: animal.status, to, by, ...(reason && { reason }) })
  animal.status = to
  animal.updatedAt = now()
}

/** Em processo enquanto houver candidatura aprovada; volta a disponível sem ela (BR-064). */
function syncAnimal(animalId: string, by: string) {
  const animal = findAnimal(animalId)
  if (animal.status !== 'available' && animal.status !== 'in-process') return
  const approved = db().applications.some(
    (application) => application.animalId === animalId && application.stage === 'approved',
  )
  setStatus(animal, approved ? 'in-process' : 'available', by)
}

/** As candidaturas ativas do animal viram `Cancelada`, com mensagem automática (BR-078). */
function cancelActive(animalId: string, except?: string) {
  for (const application of db().applications) {
    if (application.animalId !== animalId || application.id === except) continue
    if (!isActiveStage(application.stage)) continue
    application.stage = 'cancelled'
    application.awaitingAdopter = false
    application.history.push({ kind: 'cancelled', at: now() })
  }
}

function withAnimal(application: ManagedApplication): ApplicationWithAnimal {
  const { id, name, status, species, sex, photos } = findAnimal(application.animalId)
  return { ...application, animal: { id, name, status, species, sex, cover: photos[0] ?? null } }
}

export const panelServices = {
  /** A organização de quem entrou. */
  async organization() {
    await wait(100)
    return PANEL_ORGANIZATION
  },

  /** O resumo do Início: candidaturas por etapa, animais por situação e as que chegaram agora. */
  async summary() {
    await wait(300)
    const { animals, applications } = db()
    const pipeline = Object.fromEntries(
      PIPELINE_STAGES.map((stage) => [
        stage,
        applications.filter((application) => application.stage === stage).length,
      ]),
    ) as Record<PipelineStage, number>
    const byStatus = (status: AnimalStatus) =>
      animals.filter((animal) => animal.status === status).length

    return copy({
      pipeline,
      awaitingAdopter: applications.filter((application) => application.awaitingAdopter).length,
      animals: {
        available: byStatus('available'),
        inProcess: byStatus('in-process'),
        draft: byStatus('draft'),
        unavailable: byStatus('unavailable'),
      },
      recent: applications
        .filter((application) => application.stage === 'received')
        .toSorted((a, b) => b.sentAt.localeCompare(a.sentAt))
        .slice(0, 4)
        .map(withAnimal),
    })
  },

  /** Todos os animais da organização, o mais mexido primeiro, com as candidaturas ativas. */
  async animals({
    status = null,
    search = '',
    page = 1,
  }: { status?: AnimalStatus | null; search?: string; page?: number } = {}) {
    await wait(300)
    const { animals, applications } = db()
    const named = animals.filter((animal) => searchable(animal.name).includes(searchable(search)))
    const found = named
      .filter((animal) => !status || animal.status === status)
      .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    const pages = Math.max(1, Math.ceil(found.length / ANIMALS_PAGE_SIZE))
    const current = Math.min(Math.max(1, page), pages)

    return copy({
      animals: found
        .slice((current - 1) * ANIMALS_PAGE_SIZE, current * ANIMALS_PAGE_SIZE)
        .map((animal) => ({
          ...animal,
          activeApplications: applications.filter(
            (application) => application.animalId === animal.id && isActiveStage(application.stage),
          ).length,
        })),
      page: current,
      pages,
      // As contagens dos filtros respeitam a busca, para o número bater com o que aparece.
      counts: Object.fromEntries(
        ANIMAL_STATUSES.map((value) => [
          value,
          named.filter((animal) => animal.status === value).length,
        ]),
      ) as Record<AnimalStatus, number>,
      total: named.length,
    })
  },

  /** Nome de cada animal, para o filtro com busca das candidaturas. */
  async animalNames() {
    await wait(150)
    return db()
      .animals.map(({ id, name }) => ({ id, name }))
      .toSorted((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  },

  async animal(id: string) {
    await wait(200)
    const found = db().animals.find((animal) => animal.id === id)
    return found ? copy(found) : null
  },

  /**
   * Cria ou atualiza um animal (FR-030). Com `publish`, um rascunho passa a disponível; o
   * formulário só oferece publicar com os obrigatórios preenchidos (BR-060).
   */
  async saveAnimal(
    input: AnimalInput,
    { id, publish, by }: { id?: string; publish: boolean; by: string },
  ) {
    await wait(500)
    const { videoUrl, ...fields } = input
    const video = videoUrl ? { videoUrl } : {}
    let animal = id ? findAnimal(id) : undefined

    if (animal) {
      Object.assign(animal, fields, { updatedAt: now() })
      if (videoUrl) animal.videoUrl = videoUrl
      else delete animal.videoUrl
    } else {
      const created: ManagedAnimal = {
        ...fields,
        ...video,
        id: crypto.randomUUID(),
        status: 'draft',
        organization: {
          slug: PANEL_ORGANIZATION.slug,
          name: PANEL_ORGANIZATION.name,
          city: PANEL_ORGANIZATION.city,
        },
        publishedAt: null,
        updatedAt: now(),
        history: [{ at: now(), from: null, to: 'draft', by }],
      }
      db().animals.push(created)
      animal = created
    }

    if (publish && animal.status === 'draft') {
      setStatus(animal, 'available', by)
      animal.publishedAt = now().slice(0, 10)
    }
    return copy(animal)
  },

  /** Publicar, pausar, voltar ou arquivar à mão (BR-064); arquivar cancela as ativas (BR-078). */
  async changeAnimalStatus(id: string, to: AnimalStatus, by: string, reason?: string) {
    await wait(400)
    const animal = findAnimal(id)
    setStatus(animal, to, by, reason)
    if (to === 'archived') cancelActive(id)
  },

  /** As candidaturas da organização na ordem de BR-082; com `animalId`, só as dele. */
  async applications({
    stage,
    animalId = null,
    page = 1,
  }: {
    /** Uma etapa do caminho, ou `closed` para as encerradas. */
    stage: PipelineStage | 'closed'
    animalId?: string | null
    page?: number
  }) {
    await wait(300)
    const found = db()
      .applications.filter(
        (application) =>
          (!animalId || application.animalId === animalId) &&
          (stage === 'closed' ? !isActiveStage(application.stage) : application.stage === stage),
      )
      .toSorted(byPriority)
    const end = page * APPLICATIONS_PAGE_SIZE

    return copy({
      applications: found.slice((page - 1) * APPLICATIONS_PAGE_SIZE, end).map(withAnimal),
      total: found.length,
      nextPage: end < found.length ? page + 1 : null,
    })
  },

  async application(id: string) {
    await wait(200)
    const found = db().applications.find((application) => application.id === id)
    return found ? copy(withAnimal(found)) : null
  },

  /** Muda de etapa (BR-076) e acerta o animal (BR-064). */
  async moveApplication(id: string, to: PipelineStage, by: string) {
    await wait(400)
    const application = findApplication(id)
    if (!isActiveStage(application.stage)) throw new Error('Candidatura encerrada não volta.')
    application.stage = to
    application.movedAt = now()
    application.history.push({ kind: 'moved', at: now(), to, by })
    syncAnimal(application.animalId, by)
  },

  /** Pede uma informação: marca "aguardando o adotante" sem mudar a etapa (BR-076). */
  async requestInfo(id: string, message: string, by: string) {
    await wait(400)
    const application = findApplication(id)
    application.awaitingAdopter = true
    application.history.push({ kind: 'info-requested', at: now(), by, message })
  },

  /** Recusa com motivo interno e mensagem ao adotante (BR-077). */
  async refuse(id: string, reason: string, message: string, by: string) {
    await wait(500)
    const application = findApplication(id)
    application.stage = 'refused'
    application.awaitingAdopter = false
    application.movedAt = now()
    application.history.push({ kind: 'refused', at: now(), by, reason, message })
    syncAnimal(application.animalId, by)
  },

  /**
   * Conclui a adoção (BR-079): só a aprovada, com a data e o documento com foto conferido. O
   * animal vira `Adotado` e as outras candidaturas para ele são canceladas (BR-078).
   */
  async complete(id: string, date: string, by: string) {
    await wait(600)
    const application = findApplication(id)
    if (application.stage !== 'approved') throw new Error('Só a aprovada se conclui.')
    application.stage = 'completed'
    application.movedAt = now()
    application.history.push({ kind: 'completed', at: now(), by, date })
    setStatus(findAnimal(application.animalId), 'adopted', by)
    cancelActive(application.animalId, id)
  },

  /** O CPF inteiro, registrado no histórico (BR-085). */
  async revealCpf(id: string, by: string) {
    await wait(300)
    const application = findApplication(id)
    application.history.push({ kind: 'cpf-revealed', at: now(), by })
    return application.profile.applicant.cpf
  },
}
