import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { NewAnimal } from '../components/new-animal'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Panel.animalForm')
  return { title: t('newTitle') }
}

export default function NewAnimalPage() {
  return <NewAnimal />
}
