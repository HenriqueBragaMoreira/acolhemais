/** Pontuação do CPF enquanto se digita: "12345678909" vira "123.456.789-09". */
export function formatCpf(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

/** Telefone com DDD enquanto se digita: "(19) 9876-5432" ou, com 11 dígitos, "(19) 98765-4321". */
export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`

  const number = digits.slice(2)
  const split = digits.length === 11 ? 5 : 4
  const local = number.length > split ? `${number.slice(0, split)}-${number.slice(split)}` : number
  return `(${digits.slice(0, 2)}) ${local}`
}
