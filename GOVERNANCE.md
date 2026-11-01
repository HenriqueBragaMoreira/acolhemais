# Governança

## Papéis

- **Mantenedor principal**: [@HenriqueBragaMoreira](https://github.com/HenriqueBragaMoreira) —
  define o roadmap, faz releases e tem a palavra final em decisões sem consenso.
- **Mantenedores**: revisam e aprovam PRs, fazem triagem de issues e cuidam da comunidade.
- **Contribuidores**: todas as pessoas que enviam código, documentação, design ou feedback.

## Como se tornar mantenedor

Contribuidores com participação constante (por exemplo, vários PRs relevantes mergeados e revisões
úteis ao longo de alguns meses) podem ser convidados por um mantenedor existente. O convite é
aprovado pelo mantenedor principal. Mantenedores precisam ter 2FA ativo no GitHub.

## Regras de aprovação

| Área                                                                                                        | Aprovações exigidas       |
| ----------------------------------------------------------------------------------------------------------- | ------------------------- |
| Geral                                                                                                       | CI verde + 1 mantenedor   |
| Críticas: permissões (`packages/domain/src/rbac`), reputação, autenticação, migrations do banco, `.github/` | CI verde + 2 mantenedores |

Enquanto o projeto tiver um único mantenedor, as áreas críticas exigem 1 aprovação **e** um período
mínimo de 48 h com o PR aberto para revisão da comunidade.

## Decisões

Mudanças de arquitetura ou de regra de negócio são discutidas em issue e registradas como ADR em
`docs/adr/`. Mudanças nas regras de reputação e privacidade também atualizam `docs/PLANO.md`.

## Contato

- **Segurança**: somente pelo [reporte privado do GitHub](SECURITY.md).
- **Código de conduta**: e-mail dedicado da comunidade — _a definir antes do lançamento público_.
