/**
 * Erro de regra de negócio. `code` é estável (usado em testes, logs e para
 * escolher a mensagem traduzida na interface); `message` é só para desenvolvedores.
 * O código segue o padrão da API, `MAIUSCULAS_COM_SUBLINHADO` (NFR-012): o tipo recusa
 * minúsculas na compilação.
 */
export class DomainError extends Error {
  readonly code: string

  constructor(code: Uppercase<string>, message: string) {
    super(message)
    this.name = 'DomainError'
    this.code = code
  }
}
