'use client'

import { type ReactNode, useState } from 'react'
import { ReturnToReviewProvider } from './application-stepper'

/** Guarda se a etapa aberta veio do "Editar" da revisão. */
export function ReturnToReview({ children }: { children: ReactNode }) {
  const [returning, setReturning] = useState(false)
  return (
    <ReturnToReviewProvider value={{ returning, setReturning }}>{children}</ReturnToReviewProvider>
  )
}
