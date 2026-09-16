'use client'

import { createContext } from 'react'

/** Se a etapa aberta veio do "Editar" da revisão, e por isso volta direto para ela ao salvar. */
export const ReturnToReviewContext = createContext<{
  returning: boolean
  setReturning: (returning: boolean) => void
}>({ returning: false, setReturning: () => {} })

export const ReturnToReviewProvider = ReturnToReviewContext.Provider
