import type { HOURS_ALONE, HOUSING_TYPES, OWNERSHIPS } from '@/constants/application'

export type YesNo = 'yes' | 'no'

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
