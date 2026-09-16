/** Sem acento e sem caixa, para busca: "goiania" acha "Goiânia, GO" e "algodao" acha "Algodão". */
export function normalizeSearch(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}
