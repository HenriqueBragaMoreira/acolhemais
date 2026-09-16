'use client'

import { defineStepper } from '@stepperize/react'
import type { Applicant, Home, Pets, Reasons, Routine } from '@/services/applications/types'

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
