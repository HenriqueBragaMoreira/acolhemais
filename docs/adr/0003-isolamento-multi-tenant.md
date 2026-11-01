# ADR 0003 — Isolamento multi-tenant em banco compartilhado

- **Status**: aceito
- **Data**: 2026-11-01

## Contexto

Todas as organizações compartilham a mesma instância. Vazamento de dados de adotantes entre ONGs
seria grave (LGPD) e é o tipo de falha mais comum em sistemas multi-tenant.

## Decisão

1. Banco único; tabelas de tenant têm `organization_id` obrigatório.
2. Todo acesso a dados de tenant passa por uma camada com escopo (`scopedRepo(orgId, actor)`), que
   aplica o filtro de organização **e** checa a permissão do ator (`packages/domain/src/rbac`).
3. **Row Level Security** do Postgres como defesa em profundidade nas tabelas sensíveis
   (candidaturas, perfis de adotante, ocorrências).
4. Testes automatizados tentam acessar dados de outra organização por ID direto e devem falhar.
5. IDs públicos são UUIDv7 (não sequenciais).

## Consequências

Mais código de infraestrutura no início, em troca de uma garantia que não depende da atenção de
cada contribuidor em cada consulta.
