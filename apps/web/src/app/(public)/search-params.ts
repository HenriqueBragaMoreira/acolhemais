import {
  createParser,
  parseAsBoolean,
  parseAsNativeArrayOf,
  parseAsStringLiteral,
  type UrlKeys,
} from 'nuqs'
import { AGE_GROUPS, COMPANIONS, SEXES, SIZES, SORTS, SPECIES } from '@/constants/animal-options'

/** A cidade digitada, cortada em 80 caracteres: o endereço é digitável e não é confiável. */
const parseAsCity = createParser({
  parse: (value) => value.slice(0, 80),
  serialize: (value: string) => value,
})

/*
 * Os filtros da galeria vivem no endereço (`/?city=…&species=cat&sex=male&sex=female`): o link
 * compartilhado abre a mesma busca, e o voltar do navegador desfaz o último filtro. Valores
 * desconhecidos são descartados pelos parsers. Vale para a página inicial e a da ONG.
 */
export const galleryParams = {
  city: parseAsCity.withDefault(''),
  species: parseAsStringLiteral(SPECIES),
  sex: parseAsNativeArrayOf(parseAsStringLiteral(SEXES)),
  ageGroup: parseAsNativeArrayOf(parseAsStringLiteral(AGE_GROUPS)),
  size: parseAsNativeArrayOf(parseAsStringLiteral(SIZES)),
  goodWith: parseAsNativeArrayOf(parseAsStringLiteral(COMPANIONS)),
  castrated: parseAsBoolean.withDefault(false),
  sort: parseAsStringLiteral(SORTS).withDefault('longest-waiting'),
}

export const galleryUrlKeys: UrlKeys<typeof galleryParams> = { ageGroup: 'age' }
