import { DomainError } from '../errors'

type IntegerSetting = {
  kind: 'integer'
  min: number
  max: number
  /** Aceita "não definido" (`null`). */
  nullable?: boolean
}

type IntegerListSetting = {
  kind: 'integer_list'
  min: number
  max: number
  minItems: number
  maxItems: number
}

type SettingDefinition = (IntegerSetting | IntegerListSetting) & {
  unit: 'count' | 'days' | 'months' | 'cents'
  description: string
  default: number | readonly number[] | null
}

/**
 * Parâmetros da plataforma (PLANO §3.10), alteráveis pela equipe sem novo deploy. O banco
 * (`platform_setting`) guarda só os valores alterados; os demais valem o padrão daqui.
 * Toda alteração passa por `parsePlatformSetting` e vai para a auditoria.
 */
export const PLATFORM_SETTINGS = {
  maxActiveApplications: {
    kind: 'integer',
    unit: 'count',
    min: 1,
    max: 10,
    default: 3,
    description: 'Candidaturas ativas ao mesmo tempo por adotante (CPF)',
  },
  applicationResponseDays: {
    kind: 'integer',
    unit: 'days',
    min: 1,
    max: 60,
    default: 7,
    description: 'Prazo para o adotante responder antes de a candidatura expirar',
  },
  incidentDefenseDays: {
    kind: 'integer',
    unit: 'days',
    min: 5,
    max: 60,
    default: 15,
    description: 'Prazo de defesa do adotante numa ocorrência',
  },
  minorIncidentExpiryMonths: {
    kind: 'integer',
    unit: 'months',
    min: 1,
    max: 120,
    default: 24,
    description: 'Duração do selo "Atenção" de uma ocorrência leve procedente',
  },
  ineligibilityReviewMonths: {
    kind: 'integer',
    unit: 'months',
    min: 12,
    max: 120,
    default: 60,
    description: 'Tempo até o inelegível poder pedir revisão',
  },
  postAdoptionCheckinDays: {
    kind: 'integer_list',
    unit: 'days',
    min: 1,
    max: 730,
    minItems: 1,
    maxItems: 6,
    default: [30, 90, 180],
    description: 'Dias após a adoção em que o adotante recebe o lembrete de acompanhamento',
  },
  refusalResubmissionDays: {
    kind: 'integer',
    unit: 'days',
    min: 0,
    max: 365,
    default: 30,
    description: 'Espera para a organização recusada se inscrever de novo',
  },
  adoptionFeeCapCents: {
    kind: 'integer',
    unit: 'cents',
    min: 0,
    max: 10_000_00,
    nullable: true,
    // Valor a decidir antes da Fase 1 (PLANO §9).
    default: null,
    description: 'Teto da taxa de adoção, em centavos',
  },
} as const satisfies Record<string, SettingDefinition>

export type PlatformSettingKey = keyof typeof PLATFORM_SETTINGS

type ValueOf<D> = D extends { kind: 'integer_list' }
  ? number[]
  : D extends { nullable: true }
    ? number | null
    : number

export type PlatformSettings = {
  -readonly [K in PlatformSettingKey]: ValueOf<(typeof PLATFORM_SETTINGS)[K]>
}

export const PLATFORM_SETTING_KEYS = Object.keys(PLATFORM_SETTINGS) as PlatformSettingKey[]

export function isPlatformSettingKey(key: string): key is PlatformSettingKey {
  return Object.hasOwn(PLATFORM_SETTINGS, key)
}

function invalid(key: string, message: string): never {
  throw new DomainError('INVALID_PLATFORM_SETTING', `${key}: ${message}`)
}

function checkInteger(key: string, value: unknown, min: number, max: number): number {
  if (!Number.isSafeInteger(value)) invalid(key, 'deve ser um número inteiro')
  const number = value as number
  if (number < min || number > max) invalid(key, `deve estar entre ${min} e ${max}`)
  return number
}

/** Valida o valor de um parâmetro. Lança `DomainError('INVALID_PLATFORM_SETTING')`. */
export function parsePlatformSetting<K extends PlatformSettingKey>(
  key: K,
  value: unknown,
): PlatformSettings[K] {
  const definition: SettingDefinition = PLATFORM_SETTINGS[key]
  if (definition.kind === 'integer') {
    if (value === null && definition.nullable) return null as PlatformSettings[K]
    return checkInteger(key, value, definition.min, definition.max) as PlatformSettings[K]
  }

  if (!Array.isArray(value)) invalid(key, 'deve ser uma lista de números')
  if (value.length < definition.minItems || value.length > definition.maxItems) {
    invalid(key, `deve ter de ${definition.minItems} a ${definition.maxItems} itens`)
  }
  const list = value.map((item) => checkInteger(key, item, definition.min, definition.max))
  if (list.some((item, index) => index > 0 && item <= (list[index - 1] as number))) {
    invalid(key, 'deve estar em ordem crescente, sem repetição')
  }
  return list as PlatformSettings[K]
}

/**
 * Parâmetros em vigor: os valores alterados (guardados no banco) sobre os padrões. Um valor
 * guardado que não passa mais na validação lança erro, em vez de cair no padrão em silêncio:
 * mudar as regras de um parâmetro exige migrar os valores guardados.
 */
export function resolvePlatformSettings(stored: Record<string, unknown>): PlatformSettings {
  const settings = {} as Record<PlatformSettingKey, unknown>
  for (const key of PLATFORM_SETTING_KEYS) {
    const fallback: SettingDefinition['default'] = PLATFORM_SETTINGS[key].default
    settings[key] = Object.hasOwn(stored, key)
      ? parsePlatformSetting(key, stored[key])
      : Array.isArray(fallback)
        ? [...fallback]
        : fallback
  }
  return settings as PlatformSettings
}
