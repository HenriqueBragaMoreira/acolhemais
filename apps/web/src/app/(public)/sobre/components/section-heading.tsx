import { cn } from '@acolhemais/ui/lib/utils'
import { LinkIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Título de seção que é link para ela mesma: o clique põe `/sobre#id` na barra, para mandar a
 * alguém já rolado na seção. O ícone aparece no hover e no foco.
 */
export function SectionHeading({
  id,
  children,
  className,
}: {
  id: string
  children: ReactNode
  className?: string
}) {
  return (
    <h2 id={id} className={cn('group scroll-mt-8 text-xl font-bold tracking-tight', className)}>
      <a
        href={`#${id}`}
        className="inline-flex items-center gap-2 rounded-sm decoration-1 underline-offset-4 hover:underline"
      >
        {children}
        <LinkIcon
          aria-hidden
          className="size-4 shrink-0 text-ring opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
        />
      </a>
    </h2>
  )
}
