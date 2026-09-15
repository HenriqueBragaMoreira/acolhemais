import { ArrowLeftIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { animalsServices } from '@/services/animals'
import { organizationsServices } from '@/services/organizations'
import { ApplicationWizard } from './application-wizard'

export const CONTAINER = 'mx-auto max-w-6xl px-4 sm:px-6 lg:px-10'

/** A candidatura para um animal: só existe para animal adotável de organização ativa. */
export async function Application({ id }: { id: Promise<string> }) {
  const animal = await animalsServices.get(await id)
  if (!animal) notFound()
  const [organization, t] = await Promise.all([
    organizationsServices.get(animal.organization.slug),
    getTranslations('Application'),
  ])
  if (!organization || organization.status !== 'active') notFound()

  return (
    <div className="bg-secondary">
      <div className={`${CONTAINER} pt-6 pb-16 sm:pt-8`}>
        <Link
          href={`/animais/${animal.id}`}
          className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          <ArrowLeftIcon aria-hidden className="size-4" />
          {t('backToAnimal', { name: animal.name })}
        </Link>
        <h1 className="mt-4 mb-6 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {t('title', { name: animal.name })}
        </h1>
        <ApplicationWizard
          animal={{
            id: animal.id,
            name: animal.name,
            species: animal.species,
            sex: animal.sex,
            ageGroup: animal.ageGroup,
            size: animal.size,
            city: animal.city,
            fee: animal.fee,
            cover: animal.photos[0],
          }}
          organization={{
            slug: organization.slug,
            name: organization.name,
            city: organization.city,
            questions: organization.questions,
            whatsapp: organization.contact.whatsapp ?? null,
          }}
        />
      </div>
    </div>
  )
}
