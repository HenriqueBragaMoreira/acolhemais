'use client'

import { ArrowRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import type { ApplicationWithAnimal } from '@/services/panel/types'
import { AdopterBadges } from '@/app/(application)/_components/adopter-badges'
import { AnimalThumb } from '@/app/(application)/_components/animal-thumb'
import { TimeAgo } from '@/app/(application)/_components/time-ago'

/** Uma candidatura recém-chegada no Início: quem, para qual animal, quando e os selos. */
export function RecentApplicationRow({ application }: { application: ApplicationWithAnimal }) {
  const t = useTranslations('Panel.home')

  return (
    <li className="group relative -mx-2 flex items-center gap-4 rounded-lg px-2 py-3 has-[a:hover]:bg-muted">
      <AnimalThumb photo={application.animal.cover} className="w-11" />
      <div className="min-w-0 flex-1">
        {/* O nome é o link e cobre a linha; os selos abrem a explicação por cima dele. */}
        <Link
          href={`/painel/candidaturas/${application.id}`}
          className="block font-semibold after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
        >
          {application.profile.applicant.name}
        </Link>
        <p className="text-sm text-muted-foreground">
          {t('recentFor', { animal: application.animal.name })} ·{' '}
          <TimeAgo value={application.sentAt} />
        </p>
        {/* No celular, os selos descem para baixo do nome: "Atenção" nunca some. */}
        <AdopterBadges
          badges={application.badges}
          incidents={application.incidents}
          className="relative z-10 mt-2 w-fit sm:hidden"
        />
      </div>
      <AdopterBadges
        badges={application.badges}
        incidents={application.incidents}
        className="relative z-10 hidden sm:flex"
      />
      <ArrowRightIcon
        aria-hidden
        className="size-4 shrink-0 text-muted-foreground group-has-[a:hover]:text-foreground"
      />
    </li>
  )
}
