import { DEMO_ANIMALS } from './demo-data'

export const SPECIES = ['dog', 'cat', 'other'] as const
export const SEXES = ['male', 'female'] as const
export const AGE_GROUPS = ['puppy', 'young', 'adult', 'senior'] as const
export const SIZES = ['small', 'medium', 'large'] as const
export const COMPANIONS = ['children', 'dogs', 'cats'] as const
export const COATS = ['short', 'medium', 'long'] as const
export const SORTS = ['longest-waiting', 'newest'] as const

export type Species = (typeof SPECIES)[number]
export type Sex = (typeof SEXES)[number]
export type AgeGroup = (typeof AGE_GROUPS)[number]
export type Size = (typeof SIZES)[number]
export type Companion = (typeof COMPANIONS)[number]
export type Sort = (typeof SORTS)[number]

export type Organization = { slug: string; name: string; city: string }

export type AnimalPhoto = {
  src: string
  /** O `object-position` que mantém o animal nos recortes (cartão vertical, miniatura). */
  focus: string
  /** Ferimento ou recuperação: aparece desfocada até o clique (BR-061). */
  sensitive?: boolean | undefined
}

/** Um animal como a vitrine o mostra (BR-060): só a cidade é pública (BR-062). */
export type Animal = {
  id: string
  name: string
  species: Species
  sex: Sex
  ageGroup: AgeGroup
  /** Mês aproximado de nascimento, `AAAA-MM`. */
  bornAround: string
  size: Size
  coat: (typeof COATS)[number]
  /** Só os adotáveis aparecem na vitrine (BR-120). */
  status: 'available' | 'in-process'
  city: string
  organization: Organization
  publishedAt: string
  goodWith: Record<Companion, 'yes' | 'no' | 'untested'>
  health: {
    castrated: boolean
    vaccinated: boolean
    dewormed: boolean
    /** Só para gatos. */
    fivFelv?: 'negative' | 'positive' | 'untested'
    specialNeeds?: string
  }
  /** De 1 a 10; a primeira é a capa e nunca é sensível (BR-061). */
  photos: [AnimalPhoto, ...AnimalPhoto[]]
  videoUrl?: string
  story: string
  /** Sem taxa quando `null`; com taxa, sempre com o que ela cobre (BR-063). */
  fee: { cents: number; covers: string } | null
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
    (!filters.castrated || animal.health.castrated)
  )
}

/** Quanto um animal lembra outro: mesmo porte pesa mais que a mesma faixa de idade. */
function likeness(animal: Animal, other: Animal) {
  return Number(animal.size === other.size) * 2 + Number(animal.ageGroup === other.ageGroup)
}

/** Uma fileira de cartões na tela larga. */
const ROW = 5

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// shortcut: a vitrine lê dados fictícios (demo-data.ts) até existir a rota da API; com ela,
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

  /** Um animal adotável, ou `null` se não existe ou saiu da vitrine. */
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
