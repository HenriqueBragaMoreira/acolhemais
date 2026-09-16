import type {
  AGE_GROUPS,
  COATS,
  COMPANIONS,
  SEXES,
  SIZES,
  SORTS,
  SPECIES,
} from '@/constants/animal-options'

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

/** Um animal como a galeria o mostra (BR-060): só a cidade é pública (BR-062). */
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
  /** Só os adotáveis aparecem na galeria (BR-120). */
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
