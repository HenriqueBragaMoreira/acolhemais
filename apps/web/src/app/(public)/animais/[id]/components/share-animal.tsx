'use client'

import { Button } from '@acolhemais/ui/components/button'
import { CheckIcon, LinkIcon, MessageCircleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

const COPY_ICON = { idle: LinkIcon, copied: CheckIcon, failed: LinkIcon }

/** Compartilhar o animal pelo WhatsApp ou copiando o link: adoção se espalha assim. */
export function ShareAnimal({ name }: { name: string }) {
  const t = useTranslations('AnimalProfile.share')
  const [copy, setCopy] = useState<keyof typeof COPY_ICON>('idle')
  const CopyIcon = COPY_ICON[copy]

  // O endereço da página só existe no navegador: os dois lêem na hora do clique.
  function sendByWhatsapp() {
    const text = t('message', { name, url: window.location.href })
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopy('copied')
    } catch {
      // Sem permissão para a área de transferência (ou fora de HTTPS): a pessoa copia da barra.
      setCopy('failed')
    }
    setTimeout(() => setCopy('idle'), 3000)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold">{t('label')}</span>
      <Button variant="outline" size="sm" onClick={sendByWhatsapp}>
        <MessageCircleIcon aria-hidden />
        {t('whatsapp')}
      </Button>
      <Button variant="outline" size="sm" onClick={() => void copyLink()}>
        <CopyIcon aria-hidden />
        <span aria-live="polite">{t(`copy.${copy}`)}</span>
      </Button>
    </div>
  )
}
