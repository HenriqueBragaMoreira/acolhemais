/** Espera `ms` milissegundos; simula a latência da API nos dados de demonstração. */
export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
