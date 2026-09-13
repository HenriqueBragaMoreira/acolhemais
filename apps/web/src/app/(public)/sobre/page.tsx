import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { REPOSITORY_URL } from '@/lib/project'
import { AboutIllustration } from './components/about-illustration'
import { HELP_SECTION_ID, HelpProject } from './components/help-project'
import { SectionHeading } from './components/section-heading'

/** Seções do texto, com o endereço de cada uma (`/sobre#para-ongs`). */
const SECTIONS = [
  { key: 'why', id: 'por-que-existe' },
  { key: 'adopters', id: 'para-quem-adota' },
  { key: 'organizations', id: 'para-ongs' },
  { key: 'responsible', id: 'adocao-responsavel' },
] as const

const OPEN_SECTION_ID = 'codigo-aberto'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('About')
  return { title: t('metaTitle') }
}

export default async function AboutPage() {
  const t = await getTranslations('About')

  const contents = [
    ...SECTIONS.map(({ key, id }) => ({ id, title: t(`${key}.title`) })),
    { id: OPEN_SECTION_ID, title: t('open.title') },
    { id: HELP_SECTION_ID, title: t('help.title') },
  ]

  return (
    <>
      <AboutIllustration />
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 pt-10 pb-20 sm:px-6 sm:pt-14 lg:grid-cols-[13rem_minmax(0,1fr)_22rem] lg:gap-x-16 lg:px-10">
        <header className="max-w-prose lg:col-start-2 lg:row-start-1">
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-pretty text-muted-foreground">{t('lead')}</p>
        </header>

        <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <nav
            aria-labelledby="nesta-pagina"
            className="rounded-2xl border border-border p-5 lg:sticky lg:top-8 lg:border-0 lg:p-0"
          >
            <h2 id="nesta-pagina" className="text-sm font-semibold text-muted-foreground">
              {t('contents')}
            </h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {contents.map(({ id, title }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="rounded-sm decoration-1 underline-offset-4 hover:underline"
                  >
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <article className="max-w-prose lg:col-start-2 lg:row-start-2">
          {SECTIONS.map(({ key, id }) => (
            <section key={id} className="mb-10">
              <SectionHeading id={id}>{t(`${key}.title`)}</SectionHeading>
              <p className="mt-3 text-pretty">{t(`${key}.body`)}</p>
            </section>
          ))}
          <section>
            <SectionHeading id={OPEN_SECTION_ID}>{t('open.title')}</SectionHeading>
            <p className="mt-3 text-pretty">
              {t('open.body')}{' '}
              <a
                href={REPOSITORY_URL}
                className="rounded-sm font-medium text-ring underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                {t('open.sourceCode')}
              </a>
            </p>
          </section>
        </article>

        <div className="lg:col-start-3 lg:row-span-2 lg:row-start-1">
          <HelpProject />
        </div>
      </div>
    </>
  )
}
