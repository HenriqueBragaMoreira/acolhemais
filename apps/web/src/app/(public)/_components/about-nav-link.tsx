'use client'

import { usePathname } from 'next/navigation'
import { StaticAboutNavLink } from './static-about-nav-link'

/** "Sobre" no cabeçalho, marcado como página atual quando é ela. */
export function AboutNavLink({ label }: { label: string }) {
  return <StaticAboutNavLink label={label} current={usePathname() === '/sobre'} />
}
