'use client'

import { ArrowLeftIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function BackToAnimals() {
  const t = useTranslations('Panel.animalForm')
  return (
    <Link
      href="/painel/animais"
      className="inline-flex items-center gap-1.5 rounded-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <ArrowLeftIcon aria-hidden className="size-4" />
      {t('backToAnimals')}
    </Link>
  )
}
