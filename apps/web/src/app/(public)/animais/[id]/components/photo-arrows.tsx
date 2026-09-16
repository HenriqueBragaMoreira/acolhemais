'use client'

import { Button } from '@acolhemais/ui/components/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

/**
 * Setas de foto anterior e próxima. Centralizadas com `inset-y-0 my-auto`, não com translate: o
 * botão desce 1px ao ser pressionado (translate), o que anularia o centramento e o tiraria de
 * baixo do ponteiro no meio do clique.
 */
export function PhotoArrows({ onStep }: { onStep: (delta: number) => void }) {
  const t = useTranslations('AnimalProfile.photos')
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label={t('previous')}
        className="absolute inset-y-0 left-3 my-auto rounded-full"
        onClick={() => onStep(-1)}
      >
        <ChevronLeftIcon aria-hidden />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label={t('next')}
        className="absolute inset-y-0 right-3 my-auto rounded-full"
        onClick={() => onStep(1)}
      >
        <ChevronRightIcon aria-hidden />
      </Button>
    </>
  )
}
