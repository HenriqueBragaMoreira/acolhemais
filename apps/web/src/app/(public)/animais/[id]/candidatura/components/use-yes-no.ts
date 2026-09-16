'use client'

import { useTranslations } from 'next-intl'

/** Opções Sim/Não, na ordem em que aparecem em todas as perguntas. */
export function useYesNo() {
  const t = useTranslations('Application')
  return [
    { value: 'yes', label: t('yes') },
    { value: 'no', label: t('no') },
  ]
}
