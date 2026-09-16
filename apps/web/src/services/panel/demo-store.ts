import { type AnimalStatus, isActiveStage } from '@acolhemais/domain'
import { demoAnimals, demoApplications } from './demo-data'
import type { ApplicationWithAnimal, ManagedAnimal, ManagedApplication } from './types'

// shortcut: o painel guarda tudo na memória do navegador até existir a API; recarregar a página
// volta aos dados de exemplo. Com a API, este arquivo some e o `panelServices` chama
// `api.organizations.{slug}`.
let store: { animals: ManagedAnimal[]; applications: ManagedApplication[] } | null = null

export function db() {
  store ??= { animals: demoAnimals(), applications: demoApplications() }
  return store
}

/** Cópia, para o cache das telas nunca ver a mudança antes de pedir de novo. */
export const copy = <T>(value: T): T => structuredClone(value)

export const now = () => new Date().toISOString()

export function findApplication(id: string) {
  const found = db().applications.find((application) => application.id === id)
  if (!found) throw new Error(`Candidatura ${id} não existe.`)
  return found
}

export function findAnimal(id: string) {
  const found = db().animals.find((animal) => animal.id === id)
  if (!found) throw new Error(`Animal ${id} não existe.`)
  return found
}

export function setStatus(animal: ManagedAnimal, to: AnimalStatus, by: string, reason?: string) {
  if (animal.status === to) return
  animal.history.push({ at: now(), from: animal.status, to, by, ...(reason && { reason }) })
  animal.status = to
  animal.updatedAt = now()
}

/** Em processo enquanto houver candidatura aprovada; volta a disponível sem ela (BR-064). */
export function syncAnimal(animalId: string, by: string) {
  const animal = findAnimal(animalId)
  if (animal.status !== 'available' && animal.status !== 'in-process') return
  const approved = db().applications.some(
    (application) => application.animalId === animalId && application.stage === 'approved',
  )
  setStatus(animal, approved ? 'in-process' : 'available', by)
}

/** As candidaturas ativas do animal viram `Cancelada`, com mensagem automática (BR-078). */
export function cancelActive(animalId: string, except?: string) {
  for (const application of db().applications) {
    if (application.animalId !== animalId || application.id === except) continue
    if (!isActiveStage(application.stage)) continue
    application.stage = 'cancelled'
    application.awaitingAdopter = false
    application.history.push({ kind: 'cancelled', at: now() })
  }
}

export function withAnimal(application: ManagedApplication): ApplicationWithAnimal {
  const { id, name, status, species, sex, photos } = findAnimal(application.animalId)
  return { ...application, animal: { id, name, status, species, sex, cover: photos[0] ?? null } }
}
