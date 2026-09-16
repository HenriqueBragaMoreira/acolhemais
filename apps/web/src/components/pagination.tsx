import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

/** As páginas que aparecem: todas até 7; depois, a primeira, a última e as vizinhas da atual. */
export function visiblePages(page: number, pages: number): (number | 'gap')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1)
  const near = [1, page - 1, page, page + 1, pages].filter((n) => n >= 1 && n <= pages)
  const unique = [...new Set(near)].toSorted((a, b) => a - b)
  return unique.flatMap((n, index) => {
    const previous = unique[index - 1]
    return previous !== undefined && n - previous > 1 ? ['gap' as const, n] : [n]
  })
}

/** Paginação por links (dá para abrir numa aba nova e voltar): anterior, números e próxima. */
export function Pagination({
  page,
  pages,
  href,
  className,
}: {
  page: number
  pages: number
  /** O endereço de cada página, montado pelo serializador do nuqs da tela. */
  href: (page: number) => string
  className?: string
}) {
  const t = useTranslations('Pagination')
  if (pages <= 1) return null

  const arrow = 'gap-1 px-3'
  return (
    <nav aria-label={t('label')} className={cn('flex justify-center', className)}>
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          {page > 1 ? (
            <Link href={href(page - 1)} className={cn(buttonVariants({ variant: 'ghost' }), arrow)}>
              <ChevronLeftIcon aria-hidden />
              {t('previous')}
            </Link>
          ) : null}
        </li>
        {visiblePages(page, pages).map((item, index) => (
          <li key={item === 'gap' ? `gap-${index}` : item}>
            {item === 'gap' ? (
              <span aria-hidden className="px-2 text-muted-foreground">
                …
              </span>
            ) : (
              <Link
                href={href(item)}
                aria-label={t('page', { page: item })}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  buttonVariants({ variant: item === page ? 'outline' : 'ghost', size: 'icon' }),
                  'tabular-nums',
                  item === page && 'border-foreground',
                )}
              >
                {item}
              </Link>
            )}
          </li>
        ))}
        <li>
          {page < pages ? (
            <Link href={href(page + 1)} className={cn(buttonVariants({ variant: 'ghost' }), arrow)}>
              {t('next')}
              <ChevronRightIcon aria-hidden />
            </Link>
          ) : null}
        </li>
      </ul>
    </nav>
  )
}
