import { deriveBrandTheme, type BrandColors } from '@acolhemais/domain'
import type { CSSProperties } from 'react'

/**
 * Cores padrão da plataforma, usadas no portal e em ONGs sem personalização. O âmbar é a cor
 * de ação; a variante escurecida dele (foco e links) sai de `deriveBrandTheme`.
 */
export const PLATFORM_COLORS: BrandColors = { primary: '#ffb547', secondary: '#3d2a1e' }

/**
 * Converte as cores de uma ONG nas variáveis CSS do design system (`@acolhemais/ui`):
 * cor de ação, texto sobre ela e foco/links, todos com contraste AA. Aplicar no elemento raiz
 * da área com a marca (o `body` na plataforma, a página da ONG nas páginas dela).
 */
export function brandThemeStyle(colors: BrandColors): CSSProperties {
  const theme = deriveBrandTheme(colors)
  return {
    '--primary': theme.primary,
    '--primary-foreground': theme.primaryForeground,
    '--ring': theme.primaryText,
  } as CSSProperties
}
