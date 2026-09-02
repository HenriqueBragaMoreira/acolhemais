# Guia de contribuição

Obrigado por querer ajudar o Acolhe+! Este guia explica como propor mudanças sem quebrar nada.

## Fluxo

1. Procure ou abra uma **issue** descrevendo o problema ou a ideia. Para mudanças grandes, espere
   um mantenedor confirmar a abordagem antes de codar.
2. Faça um **fork** e crie uma branch a partir de `main` (`feat/filtro-por-porte`, `fix/...`).
3. Abra um **Pull Request** para `main` do repositório principal, preenchendo o template.
4. O **CI precisa passar** e um mantenedor precisa aprovar. Mudanças em áreas críticas
   (permissões, reputação, autenticação, migrations, CI) passam por revisão reforçada — veja
   [GOVERNANCE.md](GOVERNANCE.md).
5. O merge é feito por **squash**: o título do PR vira o commit no `main`.

## Título do PR: Conventional Commits

```
feat: adiciona filtro por porte no portal
fix(candidaturas): corrige expiração após adoção concluída
docs: explica configuração do docker
```

Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

## DCO (Developer Certificate of Origin)

Não pedimos CLA. Em vez disso, cada commit deve ser assinado com `-s`, declarando que você tem o
direito de enviar aquele código sob a licença do projeto ([developercertificate.org](https://developercertificate.org)):

```bash
git commit -s -m "feat: ..."
```

## Ambiente local

```bash
pnpm install
pnpm db:up     # requer Docker
pnpm dev
```

Antes de abrir o PR, rode o mesmo que o CI:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Convenções de código

- **TypeScript estrito** em tudo. Lint com **oxlint**, formatação com **Prettier**.
- **Código em inglês** (nomes de variáveis, funções, permissões); **textos de interface, comentários
  e documentação em português**. Todo texto de interface vai para os arquivos de tradução, nunca
  direto no componente.
- **Regras de negócio ficam em `packages/domain`**, como funções puras e testadas, sem depender de
  framework ou banco. A interface e as rotas só orquestram.
- Todo acesso a dados de uma organização passa pela camada com escopo de tenant — nunca consulte
  tabelas de tenant diretamente.
- Migrations já mergeadas são **imutáveis**: corrija com uma nova migration.
- Decisões de arquitetura relevantes ganham um ADR em `docs/adr/`.

## Primeira contribuição?

Procure issues com as labels `good first issue` ou `help wanted`. Dúvidas podem ser feitas na
própria issue — não existe pergunta boba.
