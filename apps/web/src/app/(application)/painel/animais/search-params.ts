import type { AnimalStatus } from '@acolhemais/domain'
import {
  createSerializer,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  type UrlKeys,
} from 'nuqs'

/** O filtro de situação na URL, em português, e a situação que ele escolhe. */
export const STATUS_FILTERS = {
  disponiveis: 'available',
  'em-processo': 'in-process',
  rascunhos: 'draft',
  indisponiveis: 'unavailable',
  adotados: 'adopted',
  arquivados: 'archived',
} as const satisfies Record<string, AnimalStatus>
export type StatusFilter = keyof typeof STATUS_FILTERS

/** O estado da lista de animais na URL: situação, busca pelo nome e página. */
export const animalsParams = {
  status: parseAsStringLiteral(Object.keys(STATUS_FILTERS) as StatusFilter[]),
  search: parseAsString.withDefault(''),
  page: parseAsInteger.withDefault(1),
}

export const animalsUrlKeys: UrlKeys<typeof animalsParams> = {
  status: 'situacao',
  search: 'busca',
  page: 'pagina',
}

/** O endereço da lista com estes filtros, para links ("Disponíveis" no Início, as páginas). */
export const animalsHref = createSerializer(animalsParams, { urlKeys: animalsUrlKeys })
