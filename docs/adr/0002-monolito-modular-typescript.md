# ADR 0002 — Monolito modular em TypeScript

- **Status**: aceito
- **Data**: 2026-11-01

## Contexto

Orçamento inicial de hospedagem ≈ R$0, mantenedor principal com experiência em TypeScript e
necessidade de atrair contribuidores voluntários.

## Decisão

- Monorepo **pnpm + Turborepo** com um único app **Next.js** (`apps/web`) e pacotes internos.
- Regras de negócio em **`packages/domain`**: funções puras, sem framework nem banco, 100% testáveis.
- Banco **PostgreSQL** (Neon em produção, Docker localmente) via **Drizzle ORM**, com migrations
  versionadas em `packages/db`.
- Autenticação com **Better Auth** (dados no próprio Postgres, sem dependência de fornecedor).
- Lint com **oxlint**, formatação com **Prettier**, testes com **Vitest** e **Playwright**.

## Consequências

- Um só deploy, compatível com free tiers. Uma API separada pode ser extraída depois, pois o domínio
  já é independente da interface.
- Jobs agendados (expirações, lembretes) não rodam continuamente: são disparados por cron externo
  (GitHub Actions) chamando um endpoint protegido.
