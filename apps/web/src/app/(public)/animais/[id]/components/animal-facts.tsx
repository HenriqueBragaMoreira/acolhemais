import { CheckIcon, CircleHelpIcon, XIcon } from 'lucide-react'
import { getFormatter, getTranslations } from 'next-intl/server'
import { type Animal, COMPANIONS } from '@/services/animals'

const ANSWER_ICON = { yes: CheckIcon, no: XIcon, untested: CircleHelpIcon }

const SECTION_TITLE = 'text-lg font-bold tracking-tight'
const ROW = 'flex justify-between gap-4 border-b border-border py-2.5 last:border-0'

/** Ficha, convivência e saúde do animal (BR-060), em listas de rótulo e valor. */
export async function AnimalFacts({ animal }: { animal: Animal }) {
  const t = await getTranslations('AnimalProfile.facts')
  const format = await getFormatter()
  const { health } = animal
  const bornAround = format.dateTime(new Date(`${animal.bornAround}-15T12:00:00`), {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="ficha">
        <h2 id="ficha" className={SECTION_TITLE}>
          {t('title')}
        </h2>
        <dl className="mt-2">
          <div className={ROW}>
            <dt className="text-muted-foreground">{t('species')}</dt>
            <dd className="font-medium">{t('speciesValue', { species: animal.species })}</dd>
          </div>
          <div className={ROW}>
            <dt className="text-muted-foreground">{t('age')}</dt>
            <dd className="text-right font-medium">
              {t('ageValue', { age: animal.ageGroup, sex: animal.sex })}
              <span className="block text-sm font-normal text-muted-foreground">
                {t('bornAround', { date: bornAround })}
              </span>
            </dd>
          </div>
          <div className={ROW}>
            <dt className="text-muted-foreground">{t('size')}</dt>
            <dd className="font-medium">{t('sizeValue', { size: animal.size })}</dd>
          </div>
          <div className={ROW}>
            <dt className="text-muted-foreground">{t('coat')}</dt>
            <dd className="font-medium">{t('coatValue', { coat: animal.coat })}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="convive-com">
        <h2 id="convive-com" className={SECTION_TITLE}>
          {t('goodWith')}
        </h2>
        <dl className="mt-2">
          {COMPANIONS.map((companion) => {
            const answer = animal.goodWith[companion]
            const Icon = ANSWER_ICON[answer]
            return (
              <div key={companion} className={ROW}>
                <dt className="text-muted-foreground">{t('companion', { companion })}</dt>
                <dd className="flex items-center gap-1.5 font-medium">
                  <Icon aria-hidden className="size-4" />
                  {t('answer', { answer })}
                </dd>
              </div>
            )
          })}
        </dl>
      </section>

      <section aria-labelledby="saude">
        <h2 id="saude" className={SECTION_TITLE}>
          {t('health')}
        </h2>
        <dl className="mt-2">
          <div className={ROW}>
            <dt className="text-muted-foreground">{t('castration')}</dt>
            <dd className="font-medium">{t('done', { done: String(health.castrated) })}</dd>
          </div>
          <div className={ROW}>
            <dt className="text-muted-foreground">{t('vaccines')}</dt>
            <dd className="font-medium">{t('upToDate', { ok: String(health.vaccinated) })}</dd>
          </div>
          <div className={ROW}>
            <dt className="text-muted-foreground">{t('deworming')}</dt>
            <dd className="font-medium">{t('upToDate', { ok: String(health.dewormed) })}</dd>
          </div>
          {health.fivFelv && (
            <div className={ROW}>
              <dt className="text-muted-foreground">{t('fivFelv')}</dt>
              <dd className="font-medium">{t('fivFelvValue', { result: health.fivFelv })}</dd>
            </div>
          )}
        </dl>
        {health.specialNeeds && (
          <p className="mt-4 rounded-lg border border-border px-3.5 py-3 text-sm">
            <span className="font-semibold">{t('specialNeeds')}</span> {health.specialNeeds}
          </p>
        )}
      </section>
    </div>
  )
}
