'use client'

import { Button } from '@acolhemais/ui/components/button'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useClipboard } from '@/hooks/use-clipboard'

/** Botão pequeno de copiar, que vira um visto por 3 segundos e anuncia o resultado. */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const t = useTranslations('Panel.file.contact')
  const { state, copy } = useClipboard()

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        aria-label={label}
        onClick={() => void copy(text)}
      >
        {state === 'copied' ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
      </Button>
      <span className="sr-only" aria-live="polite">
        {state === 'copied' && t('copied')}
        {state === 'failed' && t('copyFailed')}
      </span>
    </>
  )
}
