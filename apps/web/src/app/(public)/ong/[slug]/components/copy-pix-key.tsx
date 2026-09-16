'use client'

import { Button } from '@acolhemais/ui/components/button'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useClipboard } from '@/hooks/use-clipboard'

/** "Copiar chave": no celular é o caminho da doação, já que o QR não se lê na própria tela. */
export function CopyPixKey({ pixKey }: { pixKey: string }) {
  const t = useTranslations('Organization.pix.copy')
  const clipboard = useClipboard()
  const Icon = clipboard.state === 'copied' ? CheckIcon : CopyIcon

  return (
    <Button className="w-full" onClick={() => void clipboard.copy(pixKey)}>
      <Icon aria-hidden />
      <span aria-live="polite">{t(clipboard.state)}</span>
    </Button>
  )
}
