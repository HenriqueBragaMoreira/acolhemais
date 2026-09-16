import type { BrandColors } from '@acolhemais/domain'
import type { PIX_KEY_TYPES } from '@/constants/organization'

export type PixKeyType = (typeof PIX_KEY_TYPES)[number]

/**
 * A organização como a página pública dela a mostra (FR-026): só a cidade, nunca o endereço
 * (BR-062). Suspensa não aparece (BR-043); encerrada aparece só como encerrada (BR-044).
 */
export type OrganizationProfile = {
  slug: string
  /** Slugs antigos, que levam ao atual (BR-047). */
  previousSlugs: string[]
  name: string
  city: string
  /** Cidades de atuação (FR-025). */
  serves: string[]
  status: 'active' | 'suspended' | 'closed'
  /** Sem cores próprias, a página usa as da plataforma (BR-048). */
  colors: BrandColors | null
  // shortcut: sem logo nos dados fictícios, a página mostra as iniciais; o logo enviado entra
  // aqui quando o upload existir (FR-025).
  cover: { src: string; focus: string } | null
  about: string
  contact: { whatsapp?: string; email?: string; instagram?: string }
  /** Só a chave da própria organização: a plataforma não toca no dinheiro (BR-049). */
  pix: { key: string; type: PixKeyType } | null
  /** Perguntas próprias da candidatura, somadas ao questionário da plataforma (FR-044). */
  questions: OrganizationQuestion[]
}

export type OrganizationQuestion =
  | { id: string; type: 'yes-no' | 'text'; label: string }
  | { id: string; type: 'choice'; label: string; options: string[] }
