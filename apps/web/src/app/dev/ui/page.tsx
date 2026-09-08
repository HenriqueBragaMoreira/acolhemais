import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PLATFORM_COLORS } from '@/lib/brand-theme'
import { ThemeShowcase } from './components/theme-showcase'

export const metadata: Metadata = { title: 'Vitrine do design system', robots: { index: false } }

/** Só em desenvolvimento e nos testes E2E (ACOLHEMAIS_DEV_PAGES=1 no build). */
const ENABLED = process.env.NODE_ENV !== 'production' || process.env.ACOLHEMAIS_DEV_PAGES === '1'

/** Cores de uma ONG fictícia, para conferir o tema por organização. */
const EXAMPLE_ORGANIZATION = { primary: '#2f6f4e', secondary: '#f0c75e' }

export default function DevUiPage() {
  if (!ENABLED) notFound()

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Vitrine do design system</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Componentes de @acolhemais/ui em todos os estados. O E2E passa o axe nesta página nos dois
          temas.
        </p>
      </header>
      <ThemeShowcase
        scope="platform"
        title="Tema da plataforma"
        description="Âmbar como cor de ação, foco e links no âmbar escurecido."
        colors={PLATFORM_COLORS}
      />
      <ThemeShowcase
        scope="organization"
        title="Tema de uma ONG (exemplo)"
        description="Cores de uma ONG fictícia, aplicadas com o contraste garantido pelo domínio."
        colors={EXAMPLE_ORGANIZATION}
      />
    </main>
  )
}
