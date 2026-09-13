import { DEMO_ANIMALS } from './demo-data'

export const SPECIES = ['dog', 'cat', 'other'] as const
export const SEXES = ['male', 'female'] as const
export const AGE_GROUPS = ['puppy', 'young', 'adult', 'senior'] as const
export const SIZES = ['small', 'medium', 'large'] as const
export const COMPANIONS = ['children', 'dogs', 'cats'] as const
export const SORTS = ['longest-waiting', 'newest'] as const

export type Species = (typeof SPECIES)[number]
export type Sex = (typeof SEXES)[number]
export type AgeGroup = (typeof AGE_GROUPS)[number]
export type Size = (typeof SIZES)[number]
export type Companion = (typeof COMPANIONS)[number]
export type Sort = (typeof SORTS)[number]

export type Organization = { slug: string; name: string }

/** Um animal como a vitrine o mostra (BR-060): só a cidade é pública (BR-062). */
export type Animal = {
  id: string
  name: string
  species: Species
  sex: Sex
  ageGroup: AgeGroup
  size: Size
  coat: 'short' | 'medium' | 'long'
  /** Só os adotáveis aparecem na vitrine (BR-120). */
  status: 'available' | 'in-process'
  city: string
  organization: Organization
  publishedAt: string
  castrated: boolean
  goodWith: Record<Companion, 'yes' | 'no' | 'untested'>
  /** `focus` é o `object-position` que mantém o animal no recorte vertical do cartão. */
  photo: { src: string; focus: string }
}

export type AnimalFilters = {
  city: string
  species: Species | null
  sex: Sex[]
  ageGroup: AgeGroup[]
  size: Size[]
  goodWith: Companion[]
  castrated: boolean
  sort: Sort
}

/** Três fileiras de cinco na tela larga. */
export const PAGE_SIZE = 15

/** Sem acento e sem caixa: "goiania" acha "Goiânia, GO". */
function searchable(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/** Nenhum marcado vale como "todos". */
function anyOf<T>(selected: T[], value: T) {
  return selected.length === 0 || selected.includes(value)
}

function matches(animal: Animal, filters: AnimalFilters) {
  return (
    searchable(animal.city).includes(searchable(filters.city)) &&
    (filters.species === null || animal.species === filters.species) &&
    anyOf(filters.sex, animal.sex) &&
    anyOf(filters.ageGroup, animal.ageGroup) &&
    anyOf(filters.size, animal.size) &&
    filters.goodWith.every((companion) => animal.goodWith[companion] === 'yes') &&
    (!filters.castrated || animal.castrated)
  )
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// shortcut: a vitrine lê dados fictícios (demo-data.ts) até existir a rota da API; com ela,
// estas funções passam a chamar `api.animals` e o filtro e a ordem vão para o servidor.
export const animalsServices = {
  /** Animais adotáveis, filtrados e na ordem pedida (BR-120), uma página por vez. */
  async list(filters: AnimalFilters, page: number) {
    await wait(250)
    const direction = filters.sort === 'newest' ? -1 : 1
    const found = DEMO_ANIMALS.filter((animal) => matches(animal, filters)).toSorted(
      (a, b) => direction * a.publishedAt.localeCompare(b.publishedAt),
    )
    const end = (page + 1) * PAGE_SIZE

    return {
      animals: found.slice(page * PAGE_SIZE, end),
      total: found.length,
      nextPage: end < found.length ? page + 1 : null,
    }
  },

  /** Cidades com animais, para as sugestões da busca. */
  async cities() {
    await wait(100)
    return [...new Set(DEMO_ANIMALS.map((animal) => animal.city))].toSorted((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    )
  },
}
