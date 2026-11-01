/**
 * Erro de regra de negócio. `code` é estável (usado em testes, logs e para
 * escolher a mensagem traduzida na interface); `message` é só para desenvolvedores.
 */
export class DomainError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'DomainError'
    this.code = code
  }
}
