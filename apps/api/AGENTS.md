# Acolhe+ — API

Servidor Hono no Cloudflare Workers: única camada com acesso a banco, Better Auth, storage e
e-mail. Regras puras ficam em `packages/domain`; aqui só validação, escopo, permissão e
orquestração.

## Docs

- `../../docs/api/REQUIREMENTS.md` — status e escopo da API por requisito
- `../../docs/api/BUSINESS-RULES.md` — onde cada regra é aplicada no servidor
- Definições em `../../docs/REQUIREMENTS.md` e `../../docs/BUSINESS-RULES.md`

Atualize o status em `docs/api/`. Promova a raiz só quando a web (se tiver escopo) estiver no
mesmo nível.
