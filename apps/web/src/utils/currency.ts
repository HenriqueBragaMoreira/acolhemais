/** "60", "60,00" ou "1.200,50" em centavos; `null` se não for um valor. */
export function parseCurrencyToCents(value: string) {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  return Math.round(Number(normalized) * 100)
}
