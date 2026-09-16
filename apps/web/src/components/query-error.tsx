'use client'

import { Button } from '@acolhemais/ui/components/button'

type QueryErrorProps = {
  message: string
  retryLabel: string
  onRetry: () => void
  /** `sm` nas colunas estreitas (candidaturas); o resto usa o tamanho padrão. */
  size?: 'default' | 'sm'
  className?: string
}

/** Falha ao carregar uma lista ou resumo: o aviso e o botão de tentar de novo. */
export function QueryError({
  message,
  retryLabel,
  onRetry,
  size = 'default',
  className,
}: QueryErrorProps) {
  return (
    <div role="alert" className={className}>
      <p className="font-semibold">{message}</p>
      <Button
        variant="outline"
        size={size}
        className={size === 'sm' ? 'mt-2' : 'mt-4'}
        onClick={onRetry}
      >
        {retryLabel}
      </Button>
    </div>
  )
}
