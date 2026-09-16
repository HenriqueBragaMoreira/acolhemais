import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { ArrowLeftIcon, HeartHandshakeIcon, HourglassIcon } from 'lucide-react'
import { getFormatter, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PAGE_CONTAINER } from '@/app/(public)/_components/page-container'
import { animalsServices } from '@/services/animals'
import type { Animal } from '@/services/animals/types'
import { AnimalFacts } from './animal-facts'
import { AnimalPhotos } from './animal-photos'
import { RelatedAnimals } from './related-animals'
import { ShareAnimal } from './share-animal'

const LINK =
  'rounded-sm font-medium text-ring underline decoration-1 underline-offset-4 hover:decoration-2'

/** Botão "Quero adotar": leva à candidatura (FR-041, FR-042). */
function adoptHref(animal: Animal) {
  return `/animais/${animal.id}/candidatura`
}

/** A página do animal (FR-050): fotos, dados, taxa, organização e o "Quero adotar". */
export async function AnimalProfile({ id }: { id: Promise<string> }) {
  const animal = await animalsServices.get(await id)
  if (!animal) notFound()

  const [t, format, fromOrganization, similar] = await Promise.all([
    getTranslations('AnimalProfile'),
    getFormatter(),
    animalsServices.fromOrganization(animal),
    animalsServices.similar(animal),
  ])
  const summary = [
    t('sex', { sex: animal.sex }),
    t('age', { age: animal.ageGroup, sex: animal.sex }),
    t('size', { size: animal.size }),
  ].join(' · ')

  return (
    <div>
      <div className={`${PAGE_CONTAINER} pt-6 pb-16 sm:pt-8`}>
        <Link href="/" className={cn(LINK, 'inline-flex items-center gap-1.5 text-sm')}>
          <ArrowLeftIcon aria-hidden className="size-4" />
          {t('back')}
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-14">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <AnimalPhotos name={animal.name} photos={animal.photos} />
          </div>

          <div className="flex max-w-xl flex-col gap-8">
            <header>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{animal.name}</h1>
              <p className="mt-2 text-lg">{summary}</p>
              <p className="text-muted-foreground">{animal.city}</p>
            </header>

            {animal.status === 'in-process' && (
              <p className="flex gap-3 rounded-lg border border-border px-3.5 py-3 text-sm">
                <HourglassIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span>
                  <span className="font-semibold">{t('inProcess.title')}</span>{' '}
                  {t('inProcess.description')}
                </span>
              </p>
            )}

            <div className="flex flex-col gap-4">
              {/* No celular quem faz esse papel é a barra presa ao pé da tela. */}
              <Link
                href={adoptHref(animal)}
                className={cn(buttonVariants({ size: 'lg' }), 'hidden self-start lg:inline-flex')}
              >
                <HeartHandshakeIcon aria-hidden />
                {t('adopt')}
              </Link>
              <ShareAnimal name={animal.name} />
            </div>

            <dl className="grid gap-4 rounded-2xl bg-secondary p-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">{t('fee.label')}</dt>
                <dd className="mt-1">
                  {animal.fee ? (
                    <>
                      <span className="text-lg font-semibold tabular-nums">
                        {format.number(animal.fee.cents / 100, {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                      <span className="block text-sm">
                        {t('fee.covers', { what: animal.fee.covers })}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-semibold">{t('fee.none')}</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t('organization')}</dt>
                <dd className="mt-1">
                  {/* Link em tinta, não em âmbar tostado: sobre a névoa ele não chega ao AA. */}
                  <Link
                    href={`/ong/${animal.organization.slug}`}
                    className="rounded-sm text-lg font-semibold underline decoration-1 underline-offset-4 hover:decoration-2"
                  >
                    {animal.organization.name}
                  </Link>
                  <span className="block text-sm">{animal.organization.city}</span>
                </dd>
              </div>
            </dl>

            <section aria-labelledby="historia">
              <h2 id="historia" className="text-lg font-bold tracking-tight">
                {t('story')}
              </h2>
              <p className="mt-2 text-pretty">{animal.story}</p>
              {animal.videoUrl && (
                <a href={animal.videoUrl} className={cn(LINK, 'mt-3 inline-block')}>
                  {t('video')}
                </a>
              )}
            </section>

            <AnimalFacts animal={animal} />
          </div>
        </div>
      </div>

      {(fromOrganization.length > 0 || similar.length > 0) && (
        <div className="bg-secondary">
          <div className={`${PAGE_CONTAINER} flex flex-col gap-14 py-14`}>
            <RelatedAnimals
              id="mais-da-organizacao"
              title={t('fromOrganization', { organization: animal.organization.name })}
              animals={fromOrganization}
            />
            <RelatedAnimals
              id="parecidos"
              title={t('similar', { name: animal.name })}
              animals={similar}
            />
          </div>
        </div>
      )}

      {/* No celular, o "Quero adotar" fica preso ao pé da tela enquanto a pessoa rola, acima da
          barra de gestos do sistema. */}
      <div className="sticky bottom-0 z-10 border-t border-border bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
        <Link href={adoptHref(animal)} className={cn(buttonVariants({ size: 'lg' }), 'w-full')}>
          <HeartHandshakeIcon aria-hidden />
          {t('adopt')}
        </Link>
      </div>
    </div>
  )
}
