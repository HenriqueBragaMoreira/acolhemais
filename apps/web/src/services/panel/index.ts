import {
  ANIMAL_STATUSES,
  type AnimalStatus,
  byPriority,
  isActiveStage,
  type PipelineStage,
  PIPELINE_STAGES,
} from '@acolhemais/domain'
import { ANIMALS_PAGE_SIZE, APPLICATIONS_PAGE_SIZE } from '@/constants/panel'
import { normalizeSearch } from '@/utils/normalize-search'
import { wait } from '@/utils/wait'
import { PANEL_ORGANIZATION } from './demo-data'
import {
  cancelActive,
  copy,
  db,
  findAnimal,
  findApplication,
  now,
  setStatus,
  syncAnimal,
  withAnimal,
} from './demo-store'
import type { AnimalInput, ManagedAnimal } from './types'

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
    const named = animals.filter((animal) =>
      normalizeSearch(animal.name).includes(normalizeSearch(search)),
    )
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
