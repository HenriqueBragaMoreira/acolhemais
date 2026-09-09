# ADR 0007 — Design system e testes E2E

- **Status**: aceito
- **Data**: 2026-11-03

## Contexto

O [PLANO](../PLANO.md) §5 prevê `packages/ui` com shadcn/ui e tema por ONG (cores com contraste
WCAG AA, já validadas em `packages/domain`), e o CI com E2E em Playwright e axe-core (WCAG 2.1
AA). A Fase 0 precisa das primeiras telas reais para exercitar isso: Entrar e o código 2FA.

## Decisão

### Design system (`packages/ui`)

- **shadcn/ui no estilo `base-nova`, sobre Base UI** (não Radix), no formato de monorepo do
  shadcn: pacote só de código-fonte, compilado pelo Next, com `components.json` nos dois lados
  para o `shadcn add` funcionar. Os componentes do registro são ajustados aos nossos tokens e
  passam a ser nossos.
- **Só tema claro.** Tokens com os nomes do shadcn; tinta quente quase preta, neutros tingidos
  do caramelo e **uma única cor de ação** (âmbar), usada só no que se pode clicar. Foco com
  contorno sólido na variante escurecida da cor de marca (AA sobre branco); borda de campo com
  contraste 3:1; alvos de toque de 40 a 48 px.
- **Tema por ONG**: `brandThemeStyle()` escreve `--primary`, `--primary-foreground` e `--ring` a
  partir de `deriveBrandTheme()` do domínio, em qualquer elemento. A plataforma usa o mesmo
  mecanismo com as cores dela.
- Fonte **Figtree** auto-hospedada (`@fontsource-variable`, sem buscar no Google no build);
  ícones **Lucide**.
- Começa só com a base de formulário (botão, campo, senha, código de 6 dígitos, alerta, cartão,
  separador, carregamento). Componente novo entra quando uma tela pedir.
- Vitrine em `/dev/ui`, com todos os componentes e estados nos temas da plataforma e de uma ONG
  de exemplo. Só existe em desenvolvimento ou com `ACOLHEMAIS_DEV_PAGES=1` no build (E2E).

### Direção visual das telas de acesso

Escolhida com a skill de design do projeto (registro em `apps/web/PRODUCT.md` e no brief em
`apps/web/.impeccable/surfaces/`): o animal ocupa o quadro, como nos posts de resgate das ONGs,
e a interface fica num painel claro ancorado embaixo à esquerda (no celular, ilustração no topo
e formulário abaixo). A ilustração foi gerada por IA pelo mantenedor; origem e prompt ficam em
`apps/web/public/ilustracoes/PROVENIENCIA.md` e ao lado de cada imagem.

### Frontend (`apps/web`)

- Grupos de rotas `(auth)` (telas de acesso, com a moldura) e `(application)` (área logada,
  barrada em `src/proxy.ts` para quem não tem cookie de sessão). O compartilhado de cada grupo
  fica em `_components/`.
- `page.tsx` só com a página (`NomePage`); os demais componentes em `components/` dentro da
  rota; formulários em `components/forms/`, com o schema zod no topo do arquivo.
- Formulários com **react-hook-form + zod**; requisições com **React Query**, com
  `useQuery`/`useMutation` no próprio componente. Rotas da nossa API em `src/services/`.
- `app/providers.tsx` reúne os providers (next-intl, React Query); o `QueryClient` fica em
  `src/lib/tanstack-query.tsx`. A organização segue a do projeto we-finance.

### E2E (`apps/e2e`)

- **Playwright + `@axe-core/playwright`**, regras WCAG 2.1 A/AA, rodadas em cada estado que
  importa (vazio, com erro), não só na abertura.
- Contra a API e o banco de verdade: a web no build de produção, a API no `wrangler dev`, o
  Postgres do docker compose (ou serviço do CI). Contas criadas pela API em cada teste.
- **Chromium em tela de computador (1440×900) e de celular (Pixel 7).** Um teste por vez.
- O login conta tentativas por IP, e todo login do E2E sai do mesmo IP: a API aceita
  `AUTH_RATE_LIMIT=off`, **só quando roda em localhost** (fora dele, recusa subir). O bloqueio
  progressivo por e-mail continua ligado e tem teste; o rate limit segue coberto pelos testes de
  integração da API.
- Job `e2e` no CI, sem segredos; em falha, guarda o relatório do Playwright por 7 dias.

## Consequências

- O lint desliga, só nos componentes do registro do shadcn, regras de a11y que dão falso
  positivo com os padrões dele (rótulo genérico com `htmlFor` de quem usa, `role="group"`,
  clique no complemento que foca o campo). A acessibilidade real é conferida pelo axe no E2E.
- Tema escuro exigiria uma segunda validação de contraste por ONG: fica para quando houver
  pedido.
- Firefox e WebKit ficam fora do CI por enquanto (tempo e instabilidade); reavaliar antes do beta.
