'use client'

import { Button } from '@acolhemais/ui/components/button'
import { CheckIcon, LinkIcon, MessageCircleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useClipboard } from '@/lib/use-clipboard'

const COPY_ICON = { idle: LinkIcon, copied: CheckIcon, failed: LinkIcon }

/** Compartilhar o animal pelo WhatsApp ou copiando o link: adoção se espalha assim. */
export function ShareAnimal({ name }: { name: string }) {
  const t = useTranslations('AnimalProfile.share')
  const clipboard = useClipboard()
  const CopyIcon = COPY_ICON[clipboard.state]

  // O endereço da página só existe no navegador: os dois lêem na hora do clique.
  function sendByWhatsapp() {
    const text = t('message', { name, url: window.location.href })
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold">{t('label')}</span>
      <Button variant="outline" size="sm" onClick={sendByWhatsapp}>
        <MessageCircleIcon aria-hidden />
        {t('whatsapp')}
      </Button>
      <Button variant="outline" size="sm" onClick={() => void clipboard.copy(window.location.href)}>
        <CopyIcon aria-hidden />
        <span aria-live="polite">{t(`copy.${clipboard.state}`)}</span>
      </Button>
    </div>
  )
}
