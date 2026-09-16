import { deriveBrandTheme, type BrandColors } from '@acolhemais/domain'
import type { CSSProperties } from 'react'

/**
 * Cores padrão da plataforma, usadas no portal e em ONGs sem personalização. O âmbar é a cor
 * de ação; a variante escurecida dele (foco e links) sai de `deriveBrandTheme`.
 */
export const PLATFORM_COLORS: BrandColors = { primary: '#ffb547', secondary: '#3b2618' }

/**
 * Converte as cores de uma ONG nas variáveis CSS do design system (`@acolhemais/ui`):
 * cor de ação, texto sobre ela e foco/links, todos com contraste AA. A secundária vai para
 * `--brand-secondary` (o `--secondary` do design system é a areia) e só pinta detalhes
 * decorativos, nunca texto nem botão (BR-048). Aplicar no elemento raiz da área com a marca (o
 * `body` na plataforma, a página da ONG nas páginas dela).
 */
export function brandThemeStyle(colors: BrandColors): CSSProperties {
  const theme = deriveBrandTheme(colors)
  return {
    '--primary': theme.primary,
    '--primary-foreground': theme.primaryForeground,
    '--ring': theme.primaryText,
    '--brand-secondary': theme.secondary,
    '--brand-secondary-foreground': theme.secondaryForeground,
  } as CSSProperties
}
