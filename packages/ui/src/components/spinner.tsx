import { LoaderCircleIcon } from 'lucide-react'
import { cn } from 'cn'
import type * as React from 'react'

/**
 * Indicador de carregamento. Dentro de um botão fica oculto do leitor de tela (o botão leva
 * `aria-busy`); sozinho, passe `label` para ele ser anunciado.
 */
function Spinner({ className, label, ...props }: React.ComponentProps<'svg'> & { label?: string }) {
  return (
    <LoaderCircleIcon
      data-slot="spinner"
      {...(label ? { role: 'status', 'aria-label': label } : { 'aria-hidden': true })}
      className={cn('size-4 animate-spin motion-reduce:animate-none', className)}
      {...props}
    />
  )
}

export { Spinner }
