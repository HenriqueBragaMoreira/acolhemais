/** Só os dígitos do CPF: "529.982.247-25" vira "52998224725". */
export function cpfDigits(cpf: string) {
  return cpf.replace(/\D/g, '')
}

/** Um dígito verificador do CPF a partir dos dígitos anteriores. */
function checkDigit(digits: string) {
  let sum = 0
  for (let index = 0; index < digits.length; index++) {
    sum += Number(digits[index]) * (digits.length + 1 - index)
  }
  const rest = (sum * 10) % 11
  return rest === 10 ? 0 : rest
}

/**
 * CPF com os dois dígitos verificadores certos (BR-071). Aceita com ou sem pontuação e recusa
 * os de dígitos todos iguais, que passam na conta mas não existem.
 */
export function isValidCpf(cpf: string) {
  const digits = cpfDigits(cpf)
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false
  return (
    checkDigit(digits.slice(0, 9)) === Number(digits[9]) &&
    checkDigit(digits.slice(0, 10)) === Number(digits[10])
  )
}
