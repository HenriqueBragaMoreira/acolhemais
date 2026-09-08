import { cn } from '@acolhemais/ui/lib/utils'

/**
 * Marca escrita do Acolhe+; o nome não é traduzido. Sobre fundo escuro, o "+" leva a cor de
 * ação; sobre fundo claro, a variante escurecida dela (a clara some no branco).
 */
export function Wordmark({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  return (
    <span className={cn('font-extrabold tracking-tight', className)}>
      Acolhe<span className={onDark ? 'text-primary' : 'text-ring'}>+</span>
    </span>
  )
}
