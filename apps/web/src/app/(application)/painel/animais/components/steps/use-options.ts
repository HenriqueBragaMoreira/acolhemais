import { useTranslations } from 'next-intl'

export function useOptions<const T extends readonly string[]>(group: string, values: T) {
  const t = useTranslations('Panel.animalForm.options')
  return values.map((value) => ({ value, label: t(`${group}.${value}` as never) }))
}
