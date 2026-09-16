'use client'

import { usePathname } from 'next/navigation'
import { Sections } from './sections'

export function CurrentSections() {
  return <Sections pathname={usePathname()} />
}
