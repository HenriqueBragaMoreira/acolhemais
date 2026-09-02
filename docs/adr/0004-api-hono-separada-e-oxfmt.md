# ADR 0004 — API Hono no Cloudflare Workers e formatação com oxfmt

- **Status**: aceito
- **Data**: 2026-11-01
- **Substitui parcialmente**: [ADR 0002](0002-monolito-modular-typescript.md)

## Contexto

O ADR 0002 previa um único app Next.js, com regras acessadas por server actions e route handlers.
Preferimos uma API explícita, que possa servir também a um app mobile ou a uma API pública no
futuro, e que permita a contribuidores trabalharem só no backend ou só no frontend.

Também queremos um único ecossistema de ferramentas: o lint já usa oxlint (projeto Oxc).

## Decisão

- **`apps/api`** com **Hono** é a única camada que acessa banco, autenticação (Better Auth),
  storage e e-mail. As regras de negócio continuam em `packages/domain`; as rotas só validam a
  entrada (Zod), checam escopo/permissão e orquestram.
- **`apps/web`** (Next.js) é só interface e consome a API pelo cliente tipado do Hono
  (`hc<AppType>`), com tipos de rotas, parâmetros e respostas checados de ponta a ponta.
- Formatação com **oxfmt** (Oxc, compatível com o estilo do Prettier) no lugar do Prettier.

### Deploy da API: Cloudflare Workers

- A API roda no **Cloudflare Workers**, onde o Hono roda nativamente; o frontend continua na Vercel.
- **Banco**: Postgres no Neon, acessado pelo **Hyperdrive** (pool de conexões da Cloudflare,
  incluído no plano gratuito com 100 mil consultas/dia) com Drizzle.
- **Jobs agendados** (expirações, lembretes, retries de e-mail) usam **Cron Triggers** nativos do
  Workers, no lugar do cron via GitHub Actions previsto no plano.
- **Storage**: Cloudflare R2 acessado por binding direto do Worker (mesmo provedor, sem credenciais
  S3 na API em produção).
- **Configuração**: variáveis e segredos via `wrangler` (`wrangler secret`), nunca no repositório.
  O código lê a configuração validada (Zod) a partir das bindings do Worker.

## Consequências

- Dois deploys em vez de um. A API e o frontend devem ficar sob o mesmo domínio-raiz
  (ex.: `api.` e `www.`) para os cookies de sessão funcionarem com `SameSite=Lax`; o CORS da API
  aceita apenas a origem do frontend.
- O desenvolvimento local da API passa a usar `wrangler dev` (runtime `workerd`), para o ambiente
  local se comportar como produção; o `@hono/node-server` atual será substituído.
- **Limite de 10 ms de CPU por requisição no plano gratuito.** Espera por rede/banco não conta, mas
  hash de senha conta, e scrypt/argon2 com parâmetros seguros tende a estourar esse limite.
  **Não enfraqueceremos os parâmetros de hash para caber no limite.** Antes de liberar login por
  e-mail e senha em produção, medir o custo real no Worker; se estourar, migrar a API para o
  **Workers Paid (US$ 5/mês)** — custo a ser coberto por doações. Login com Google não é afetado.
- **Processamento de imagens**: `sharp` (nativo) não roda no Workers, e reencodar imagens em WASM
  não cabe em 10 ms de CPU. A estratégia para remover EXIF/GPS e normalizar uploads (ex.: Cloudflare
  Images, ou processamento fora da requisição) será definida em ADR próprio antes do upload de fotos.
- Sem APIs nativas do Node fora do suportado pela flag `nodejs_compat`: dependências da API precisam
  ser compatíveis com o runtime do Workers.
- O oxfmt ainda está em versão 0.x: diferenças pontuais de formatação em atualizações são esperadas
  e resolvidas com `pnpm format`.
