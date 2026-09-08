import type { BrandColors } from '@acolhemais/domain'
import { brandThemeStyle } from '@/lib/brand-theme'
import { ButtonShowcase } from './button-showcase'
import { FeedbackShowcase } from './feedback-showcase'
import { FieldShowcase } from './field-showcase'

/** A vitrine inteira com as cores de um tema (plataforma ou ONG). */
export function ThemeShowcase({
  scope,
  title,
  description,
  colors,
}: {
  scope: string
  title: string
  description: string
  colors: BrandColors
}) {
  return (
    <section
      aria-labelledby={`${scope}-title`}
      style={brandThemeStyle(colors)}
      className="rounded-2xl border border-border bg-background px-6 py-8 sm:px-10"
    >
      <h2 id={`${scope}-title`} className="text-2xl font-bold tracking-tight">
        {title}
      </h2>
      <p className="mt-1 text-muted-foreground">{description}</p>
      <ButtonShowcase scope={scope} />
      <FieldShowcase scope={scope} />
      <FeedbackShowcase scope={scope} />
    </section>
  )
}
