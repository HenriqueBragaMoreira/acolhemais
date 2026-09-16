'use client'

import { useContext } from 'react'
import { applicationStepper } from './application-stepper'
import { ReturnToReviewContext } from './return-to-review-context'

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
