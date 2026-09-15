'use client'

import { defineStepper } from '@stepperize/react'
import { createContext, useContext } from 'react'
import type { Animal } from '@/services/animals'
import type { Applicant, Home, Pets, Reasons, Routine } from '@/services/applications'
import type { OrganizationProfile } from '@/services/organizations'

/**
 * As etapas da candidatura (FR-041, FR-042): quem é a pessoa, os dados dela, o questionário da
 * plataforma em quatro partes (BR-070), as perguntas da organização (FR-044) e a revisão.
 */
export const applicationStepper = defineStepper([
  { id: 'account' },
  { id: 'applicant' },
  { id: 'home' },
  { id: 'pets' },
  { id: 'routine' },
  { id: 'reasons' },
  { id: 'organization' },
  { id: 'review' },
])

export type ApplicationStep = (typeof applicationStepper.steps)[number]['id']

/** Como a pessoa chegou: confirmou o e-mail por código (sem conta) ou entrou na conta. */
export type AccountData = { mode: 'new' | 'account'; email: string }

/** O que cada etapa guarda. Os schemas ficam nos formulários; aqui só o formato. */
export type StepData = {
  account: AccountData
  applicant: Applicant
  home: Home
  pets: Pets
  routine: Routine
  reasons: Reasons
  organization: Record<string, string>
}

const ReturnToReviewContext = createContext<{
  returning: boolean
  setReturning: (returning: boolean) => void
}>({ returning: false, setReturning: () => {} })
export const ReturnToReviewProvider = ReturnToReviewContext.Provider

/**
 * Avança a etapa. Aberta pelo "Editar" da revisão, a etapa salva e volta direto para a revisão,
 * sem obrigar a pessoa a passar de novo pelas seguintes.
 */
export function useAdvance() {
  const stepper = applicationStepper.useStepperContext()
  const { returning, setReturning } = useContext(ReturnToReviewContext)

  async function advance(data: unknown) {
    if (!returning) return stepper.next({ data })
    stepper.data.set(stepper.id, data)
    setReturning(false)
    return stepper.goTo('review')
  }

  function backToReview() {
    setReturning(false)
    return stepper.goTo('review')
  }

  return { returning, setReturning, advance, backToReview }
}

/** Lê o que uma etapa já guardou (rascunho ao voltar, ou o perfil de quem entrou na conta). */
export function useStepData() {
  const stepper = applicationStepper.useStepperContext()
  return <K extends keyof StepData>(id: K) => stepper.data.get(id) as StepData[K] | undefined
}

export type ApplicationTarget = {
  animal: Pick<Animal, 'id' | 'name' | 'species' | 'sex' | 'ageGroup' | 'size' | 'city' | 'fee'> & {
    cover: Animal['photos'][0]
  }
  organization: Pick<OrganizationProfile, 'slug' | 'name' | 'city' | 'questions'> & {
    whatsapp: string | null
  }
}

const ApplicationTargetContext = createContext<ApplicationTarget | null>(null)
export const ApplicationTargetProvider = ApplicationTargetContext.Provider

/** O animal e a organização da candidatura, para as etapas. */
export function useApplicationTarget() {
  const target = useContext(ApplicationTargetContext)
  if (!target) throw new Error('useApplicationTarget fora da candidatura')
  return target
}
