'use client'

import { useContext } from 'react'
import { ApplicationTargetContext } from './application-target-context'

/** O animal e a organização da candidatura, para as etapas. */
export function useApplicationTarget() {
  const target = useContext(ApplicationTargetContext)
  if (!target) throw new Error('useApplicationTarget fora da candidatura')
  return target
}
