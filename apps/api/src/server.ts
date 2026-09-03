import { serve } from '@hono/node-server'
import app from './app'

// Ponte temporária até a API rodar no Workers: repassa process.env como bindings.
serve(
  { fetch: (req) => app.fetch(req, process.env), port: Number(process.env.PORT ?? 3001) },
  (info) => {
    console.info(`API ouvindo em http://localhost:${info.port}`)
  },
)
