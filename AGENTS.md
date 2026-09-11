# Acolhe+

Plataforma open source e gratuita de adoção responsável para ONGs e protetores de animais
(multi-tenant, com reputação moderada de adotantes).

## Docs

- `docs/REQUIREMENTS.md` — requisitos (FR/NFR) com status agregado do sistema
- `docs/BUSINESS-RULES.md` — regras de negócio (BR), fonte única; não existem regras fora dele
- `docs/OPEN-QUESTIONS.md` — brechas e decisões pendentes (Q)
- `docs/api/`, `docs/web/` — status e escopo de cada camada
- `docs/PLANO.md` — visão, stack, roadmap, riscos · `docs/adr/` — decisões de arquitetura
- `CONTRIBUTING.md` — convenções de código, banco, API e interface

Ao implementar ou corrigir algo, atualize o status no doc da sua camada (`docs/api/` ou
`docs/web/`) e só promova o status na raiz quando todas as camadas com escopo chegarem ao mesmo
nível. Nunca marque `verified` (só o mantenedor). Item `draft` ou com **Em aberto** não se
implementa: leve a questão ao mantenedor. Regra nova ou alterada entra nos docs no mesmo
trabalho (e vira ADR se for de arquitetura).

## Decisões

Lib, padrão ou regra que os docs e ADRs não fixam: não escolha sozinho. Traga as opções com
trade-offs e uma recomendação, e espere a decisão.

## Docs de bibliotecas

Nunca confie na memória para a API de uma lib. Better Auth: MCP `better-auth` e as skills do
Better Auth. Demais libs: Context7 antes de escrever o código.

## Testes

Toda regra implementada sai com teste — unitário no domínio, integração na API, E2E quando
`docs/PLANO.md` §10 exige — com o ID (`BR-054`, `FR-023`) no nome do `describe`.

## Commits

Só commite ou dê push quando pedirem. Conventional Commits com título em inglês e corpo em pt-BR,
assinados com `-s` (DCO); commits pequenos que buildam e passam nos testes sozinhos.

## Comunicação e planos

Responda em pt-BR, direto. Planos curtos em tópicos, terminando com a lista de questões em aberto.
Código e identificadores em inglês; comentários, docs e mensagens ao usuário em pt-BR.
