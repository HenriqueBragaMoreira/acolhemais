import { FieldError } from '@acolhemais/ui/components/field'
import { cn } from '@acolhemais/ui/lib/utils'
import { CircleAlertIcon } from 'lucide-react'

/**
 * Mensagem de erro abaixo de um campo, numa área reservada (o layout não pula quando ela
 * aparece). O último campo do formulário reserva duas linhas e mostra também o erro do envio
 * (senha errada, código inválido…): os dois nunca aparecem juntos.
 */
export function FieldMessage({
  id,
  message,
  lines = 1,
}: {
  id: string
  message: string | undefined
  lines?: 1 | 2
}) {
  return (
    <div className={cn(lines === 2 ? 'min-h-10' : 'min-h-5')}>
      {message && (
        <FieldError id={id}>
          <CircleAlertIcon aria-hidden />
          {message}
        </FieldError>
      )}
    </div>
  )
}
