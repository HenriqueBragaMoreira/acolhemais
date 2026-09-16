'use client'

import { usePathname } from 'next/navigation'
import { PanelNavLinks } from './panel-nav-links'

export function CurrentPanelNavLinks() {
  return <PanelNavLinks pathname={usePathname()} />
}
