'use client'

import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import Link from 'next/link'

/** O link sem saber o endereço: é o que aparece enquanto ele não é lido. */
export function StaticAboutNavLink({ label, current }: { label: string; current?: boolean }) {
  return (
    <Link
      href="/sobre"
      aria-current={current ? 'page' : undefined}
      className={cn(buttonVariants({ variant: 'ghost' }), 'aria-[current=page]:bg-muted')}
    >
      {label}
    </Link>
  )
}
