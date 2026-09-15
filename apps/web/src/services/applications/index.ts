import { cpfDigits } from '@acolhemais/domain'
import { DEMO_ACCOUNT_PROFILE, DEMO_ACTIVE_APPLICATIONS } from './demo-data'

export type YesNo = 'yes' | 'no'
export const HOUSING_TYPES = ['house', 'apartment', 'other'] as const
export const OWNERSHIPS = ['own', 'rent'] as const
export const HOURS_ALONE = ['up-to-2', '2-to-4', '4-to-8', 'over-8'] as const

/*
 * As respostas do adotante (BR-070). As de escolha nascem `null` (sem resposta) e o formulário
 * exige cada uma; as de texto que dependem de outra resposta ficam vazias quando não se aplicam.
 */

export type Applicant = { name: string; cpf: string; phone: string }

export type Home = {
  housing: (typeof HOUSING_TYPES)[number] | null
  ownership: (typeof OWNERSHIPS)[number] | null
  landlordAllows: YesNo | null
  yard: YesNo | null
  screens: YesNo | null
  adults: string
  children: YesNo | null
  childrenAges: string
  everyoneAgrees: YesNo | null
}

export type Pets = {
  hasPets: YesNo | null
  pets: string
  petsCared: YesNo | null
  hadPets: YesNo | null
  pastPets: string
}

export type Routine = {
  hoursAlone: (typeof HOURS_ALONE)[number] | null
  whereStays: string
  travelCare: string
  awareOfCosts: YesNo | null
}

export type Reasons = { why: string; ifMoving: string; ifBehavior: string }

/** O perfil reutilizável (FR-040): preenchido uma vez e usado em toda candidatura. */
export type AdopterProfile = {
  applicant: Applicant
  home: Home
  pets: Pets
  routine: Routine
  reasons: Reasons
}

/** Por que a candidatura não pode seguir: já existe uma para o animal (BR-075) ou o limite (BR-074). */
export type ApplicationBlock = 'duplicate' | 'limit'

/** Candidaturas ativas ao mesmo tempo, em toda a plataforma (`maxActiveApplications`, BR-074). */
export const MAX_ACTIVE_APPLICATIONS = 3

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// shortcut: tudo fictício até existir a API: qualquer código de 6 dígitos vale, qualquer
// e-mail e senha entram na conta de exemplo e nada é gravado.
export const applicationsServices = {
  /** Manda o código de verificação para o e-mail (FR-042). */
  async sendCode(_email: string) {
    await wait(500)
  },

  /** Confere o código; `false` se ele está errado. */
  async verifyCode(_email: string, code: string) {
    await wait(400)
    return /^\d{6}$/.test(code)
  },

  /** Entra na conta e devolve o perfil salvo nela (FR-041). */
  async signIn(_email: string, _password: string): Promise<AdopterProfile> {
    await wait(600)
    return DEMO_ACCOUNT_PROFILE
  },

  /** Se este CPF pode se candidatar a este animal agora. */
  async check(cpf: string, animalId: string): Promise<ApplicationBlock | null> {
    await wait(300)
    const active = DEMO_ACTIVE_APPLICATIONS[cpfDigits(cpf)] ?? []
    if (active.includes(animalId)) return 'duplicate'
    if (active.length >= MAX_ACTIVE_APPLICATIONS) return 'limit'
    return null
  },

  /** Envia a candidatura: perfil, respostas da organização e o animal. */
  async submit(_application: {
    animalId: string
    email: string
    profile: AdopterProfile
    answers: Record<string, string>
  }) {
    await wait(800)
  },
}
