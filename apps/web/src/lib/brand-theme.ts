import { deriveBrandTheme, type BrandColors } from '@acolhemais/domain'
import type { CSSProperties } from 'react'

/** Cores padrão da plataforma, usadas no portal e em ONGs sem personalização. */
export const PLATFORM_COLORS: BrandColors = { primary: '#0f766e', secondary: '#c2410c' }

/**
 * Converte as cores de uma ONG em variáveis CSS consumidas pelos tokens do Tailwind
 * (ver globals.css). Aplicar no elemento raiz da página da ONG.
 */
export function brandThemeStyle(colors: BrandColors): CSSProperties {
  const theme = deriveBrandTheme(colors)
  return {
    '--brand-primary': theme.primary,
    '--brand-primary-foreground': theme.primaryForeground,
    '--brand-primary-text': theme.primaryText,
    '--brand-secondary': theme.secondary,
    '--brand-secondary-foreground': theme.secondaryForeground,
  } as CSSProperties
}
