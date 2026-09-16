'use client'

import { createContext } from 'react'
import type { Animal } from '@/services/animals/types'
import type { OrganizationProfile } from '@/services/organizations/types'

/** O animal e a organização da candidatura, com só o que as etapas usam. */
export type ApplicationTarget = {
  animal: Pick<Animal, 'id' | 'name' | 'species' | 'sex' | 'ageGroup' | 'size' | 'city' | 'fee'> & {
    cover: Animal['photos'][0]
  }
  organization: Pick<OrganizationProfile, 'slug' | 'name' | 'city' | 'questions'> & {
    whatsapp: string | null
  }
}

export const ApplicationTargetContext = createContext<ApplicationTarget | null>(null)

export const ApplicationTargetProvider = ApplicationTargetContext.Provider
