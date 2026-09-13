import { cn } from 'cn'
import { ChevronDownIcon } from 'lucide-react'

/**
 * Seleção nativa do navegador, com a cara do campo de texto (44px, borda de campo, foco em
 * `ring`). Nativa de propósito: no celular abre o seletor do sistema, e leitor de tela e teclado
 * funcionam sem nada a mais.
 */
function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <div data-slot="native-select-wrapper" className={cn('relative', className)}>
      <select
        data-slot="native-select"
        className="h-11 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-input bg-background pr-10 pl-3 text-base text-foreground transition-colors focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive"
        {...props}
      />
      <ChevronDownIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

export { NativeSelect }
