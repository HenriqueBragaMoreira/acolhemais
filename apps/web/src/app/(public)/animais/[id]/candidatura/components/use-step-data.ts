'use client'

import { applicationStepper, type StepData } from './application-stepper'

/** Lê o que uma etapa já guardou (rascunho ao voltar, ou o perfil de quem entrou na conta). */
export function useStepData() {
  const stepper = applicationStepper.useStepperContext()
  return <K extends keyof StepData>(id: K) => stepper.data.get(id) as StepData[K] | undefined
}
