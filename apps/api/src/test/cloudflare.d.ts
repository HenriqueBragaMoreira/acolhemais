import type * as worker from '../index'

// Tipa `exports` de `cloudflare:workers` nos testes a partir do próprio ponto de
// entrada, sem gerar tipos com `wrangler types`.
declare global {
  namespace Cloudflare {
    interface GlobalProps {
      mainModule: typeof worker
    }
  }
}
