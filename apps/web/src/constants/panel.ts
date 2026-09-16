/** As categorias de ocorrência que sustentam um selo de reputação (BR-100). */
export const INCIDENT_CATEGORIES = ['return-without-notice', 'neglect', 'abandonment'] as const

/**
 * Teto da taxa de adoção (`adoptionFeeCapCents`, BR-063) nesta demonstração; na plataforma, a
 * equipe define e ele vai no máximo a R$ 500.
 */
export const DEMO_FEE_CAP_CENTS = 15000

/** Cartões por coluna antes do "Ver mais". */
export const APPLICATIONS_PAGE_SIZE = 10

/** Animais por página na lista do painel. */
export const ANIMALS_PAGE_SIZE = 20
