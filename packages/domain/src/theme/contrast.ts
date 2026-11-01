import { DomainError } from '../errors'

/** Contraste mínimo WCAG 2.1 AA para texto normal. */
export const MIN_TEXT_CONTRAST = 4.5

const HEX_COLOR = /^#[0-9a-f]{6}$/i

type Rgb = readonly [number, number, number]

export function parseHexColor(hex: string): Rgb {
  if (!HEX_COLOR.test(hex)) {
    throw new DomainError('theme.invalid_color', `Invalid hex color: ${hex}`)
  }
  const channel = (i: number) => Number.parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  return [channel(0), channel(1), channel(2)]
}

function toHex(rgb: Rgb): string {
  return `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
}

function linearChannel(c: number): number {
  const s = c / 255
  return s <= 0.039_28 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function relativeLuminance([r, g, b]: Rgb): number {
  return 0.2126 * linearChannel(r) + 0.7152 * linearChannel(g) + 0.0722 * linearChannel(b)
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(parseHexColor(a))
  const lb = relativeLuminance(parseHexColor(b))
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Cor de texto (preto ou branco) mais legível sobre um fundo. */
export function readableForeground(background: string): '#000000' | '#ffffff' {
  return contrastRatio(background, '#ffffff') >= contrastRatio(background, '#000000')
    ? '#ffffff'
    : '#000000'
}

/**
 * Escurece a cor até ela ser legível como texto sobre fundo branco.
 * Usada para sugerir um ajuste quando a ONG escolhe uma cor clara (ex.: amarelo).
 */
export function darkenUntilReadableOnWhite(hex: string): string {
  const [r, g, b] = parseHexColor(hex)
  for (let step = 0; step <= 20; step++) {
    const factor = 1 - step * 0.05
    const candidate = toHex([r * factor, g * factor, b * factor])
    if (contrastRatio(candidate, '#ffffff') >= MIN_TEXT_CONTRAST) return candidate
  }
  return '#000000'
}

export interface BrandColors {
  readonly primary: string
  readonly secondary: string
}

/** Tokens de tema derivados das cores da ONG, todos com contraste AA garantido. */
export interface BrandTheme {
  readonly primary: string
  readonly primaryForeground: string
  /** Variante da cor primária usada como texto/link sobre fundo branco. */
  readonly primaryText: string
  readonly secondary: string
  readonly secondaryForeground: string
}

export function deriveBrandTheme({ primary, secondary }: BrandColors): BrandTheme {
  return {
    primary: primary.toLowerCase(),
    primaryForeground: readableForeground(primary),
    primaryText: darkenUntilReadableOnWhite(primary.toLowerCase()),
    secondary: secondary.toLowerCase(),
    secondaryForeground: readableForeground(secondary),
  }
}
