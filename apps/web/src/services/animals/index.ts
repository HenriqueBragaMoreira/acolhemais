import { normalizeSearch } from '@/utils/normalize-search'
import { wait } from '@/utils/wait'
import { DEMO_ANIMALS } from './demo-data'
import type { Animal, AnimalFilters } from './types'

/** Três fileiras de cinco na tela larga. */
const PAGE_SIZE = 15

/** Uma fileira de cartões na tela larga. */
const ROW = 5

/** Nenhum marcado vale como "todos". */
function anyOf<T>(selected: T[], value: T) {
  return selected.length === 0 || selected.includes(value)
}

function matches(animal: Animal, filters: AnimalFilters) {
  return (
    normalizeSearch(animal.city).includes(normalizeSearch(filters.city)) &&
    (filters.species === null || animal.species === filters.species) &&
    anyOf(filters.sex, animal.sex) &&
    anyOf(filters.ageGroup, animal.ageGroup) &&
    anyOf(filters.size, animal.size) &&
    filters.goodWith.every((companion) => animal.goodWith[companion] === 'yes') &&
    (!filters.castrated || animal.health.castrated)
  )
}

/** Quanto um animal lembra outro: mesmo porte pesa mais que a mesma faixa de idade. */
function likeness(animal: Animal, other: Animal) {
  return Number(animal.size === other.size) * 2 + Number(animal.ageGroup === other.ageGroup)
}

// shortcut: a galeria lê dados fictícios (demo-data.ts) até existir a rota da API; com ela,
// estas funções passam a chamar `api.animals` e o filtro e a ordem vão para o servidor.
export const animalsServices = {
  /**
   * Animais adotáveis, filtrados e na ordem pedida (BR-120), uma página por vez; com
   * `organization` (slug), só os dela (FR-026).
   */
  async list(filters: AnimalFilters, page: number, organization?: string) {
    await wait(250)
    const direction = filters.sort === 'newest' ? -1 : 1
    const found = DEMO_ANIMALS.filter(
      (animal) =>
        (!organization || animal.organization.slug === organization) && matches(animal, filters),
    ).toSorted((a, b) => direction * a.publishedAt.localeCompare(b.publishedAt))
    const end = (page + 1) * PAGE_SIZE

    return {
      animals: found.slice(page * PAGE_SIZE, end),
      total: found.length,
      nextPage: end < found.length ? page + 1 : null,
    }
  },

  /** Um animal adotável, ou `null` se não existe ou saiu da galeria. */
  async get(id: string) {
    await wait(150)
    return DEMO_ANIMALS.find((animal) => animal.id === id) ?? null
  },

  /** Outros animais da mesma organização, quem espera há mais tempo primeiro. */
  async fromOrganization(animal: Animal) {
    await wait(150)
    return DEMO_ANIMALS.filter(
      (other) => other.organization.slug === animal.organization.slug && other.id !== animal.id,
    )
      .toSorted((a, b) => a.publishedAt.localeCompare(b.publishedAt))
      .slice(0, ROW)
  },

  /** Animais da mesma espécie em outras organizações, os mais parecidos primeiro. */
  async similar(animal: Animal) {
    await wait(150)
    return DEMO_ANIMALS.filter(
      (other) =>
        other.species === animal.species && other.organization.slug !== animal.organization.slug,
    )
      .toSorted((a, b) => likeness(animal, b) - likeness(animal, a))
      .slice(0, ROW)
  },

  /** Cidades com animais, para as sugestões da busca. */
  async cities() {
    await wait(100)
    return [...new Set(DEMO_ANIMALS.map((animal) => animal.city))].toSorted((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    )
  },
}
