---
name: Acolhe+
description: Plataforma gratuita e de código aberto para ONGs e protetores de animais; o animal ocupa o quadro, a interface fica ancorada e quieta.
colors:
  background: '#ffffff'
  foreground: '#1f1a17'
  primary: '#ffb547'
  primary-foreground: '#000000'
  ring: '#996d2b'
  secondary: '#f6f0ea'
  muted: '#f6f0ea'
  muted-foreground: '#66594f'
  border: '#e9e1d9'
  input: '#8c7e74'
  destructive: '#b42318'
  destructive-muted: '#fdf1ef'
  frame-brown: '#3b2618'
  veil: '#1a100a'
typography:
  display:
    fontFamily: "'Figtree Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '3rem'
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: '-0.025em'
  headline:
    fontFamily: "'Figtree Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '1.875rem'
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: '-0.025em'
  title:
    fontFamily: "'Figtree Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '1.125rem'
    fontWeight: 600
    lineHeight: 1.556
  body:
    fontFamily: "'Figtree Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "'Figtree Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "'Figtree Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.875rem'
    fontWeight: 600
    lineHeight: 1
  button:
    fontFamily: "'Figtree Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.9375rem'
    fontWeight: 600
  code:
    fontFamily: "'Figtree Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '1.5rem'
    fontWeight: 600
    fontFeature: '"tnum"'
  wordmark:
    fontFamily: "'Figtree Variable', ui-sans-serif, system-ui, sans-serif"
    fontWeight: 800
    letterSpacing: '-0.025em'
rounded:
  sm: '0.375rem'
  md: '0.5rem'
  lg: '0.625rem'
  xl: '0.875rem'
  2xl: '1rem'
spacing:
  xs: '0.5rem'
  sm: '0.75rem'
  md: '1rem'
  lg: '1.5rem'
  xl: '2rem'
  2xl: '2.5rem'
  3xl: '3rem'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
    typography: '{typography.button}'
    rounded: '{rounded.lg}'
    padding: '0 16px'
    height: '40px'
  button-primary-hover:
    backgroundColor: '#eba741'
  button-primary-lg:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
    rounded: '{rounded.lg}'
    padding: '0 20px'
    height: '48px'
  button-outline:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    typography: '{typography.button}'
    rounded: '{rounded.lg}'
    padding: '0 16px'
    height: '40px'
  button-outline-hover:
    backgroundColor: '{colors.muted}'
  button-secondary:
    backgroundColor: '{colors.secondary}'
    textColor: '{colors.foreground}'
    typography: '{typography.button}'
    rounded: '{rounded.lg}'
    padding: '0 16px'
    height: '40px'
  button-secondary-hover:
    backgroundColor: 'color-mix(in oklch, #f6f0ea, #1f1a17 5%)'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.foreground}'
    rounded: '{rounded.lg}'
    padding: '0 16px'
    height: '40px'
  button-ghost-hover:
    backgroundColor: '{colors.muted}'
  button-destructive:
    backgroundColor: '{colors.destructive}'
    textColor: '#ffffff'
    typography: '{typography.button}'
    rounded: '{rounded.lg}'
    padding: '0 16px'
    height: '40px'
  button-destructive-hover:
    backgroundColor: '#9e1f15'
  button-link:
    backgroundColor: 'transparent'
    textColor: '{colors.ring}'
    typography: '{typography.button}'
    padding: '0'
  input:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    typography: '{typography.body}'
    rounded: '{rounded.lg}'
    padding: '0 12px'
    height: '44px'
  input-disabled:
    backgroundColor: '{colors.muted}'
  input-otp-slot:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    typography: '{typography.code}'
    height: '56px'
    width: '48px'
  field-label:
    textColor: '{colors.foreground}'
    typography: '{typography.label}'
  alert-destructive:
    backgroundColor: '{colors.destructive-muted}'
    textColor: '{colors.destructive}'
    typography: '{typography.body-sm}'
    rounded: '{rounded.lg}'
    padding: '12px 14px'
  card:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    typography: '{typography.body-sm}'
    rounded: '{rounded.xl}'
    padding: '16px'
  auth-panel:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.2xl}'
    padding: '32px'
    width: '27rem'
  panel-header:
    backgroundColor: '{colors.frame-brown}'
    textColor: '#ffffff'
    height: '64px'
  account-list-row:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    padding: '12px 16px'
---

# Design System: Acolhe+

## Overview

**Creative North Star: "O Feed de Resgate"**

O Acolhe+ se apresenta como os posts de resgate que as ONGs publicam: o animal preenche o quadro inteiro e a interface fica ancorada num canto, sem disputar com ele. Nas telas de acesso, uma ilustração pintada de um vira-lata caramelo na luz dourada do fim de tarde ocupa a tela; um painel branco de cantos generosos assenta embaixo, à esquerda, e a marca fica no alto, em branco, sobre um véu marrom-escuro que só existe ali. Quem chega reconhece o universo da adoção antes de ler qualquer coisa.

Fora da imagem, o sistema é calmo e utilitário: tinta quente quase preta, neutros tingidos do caramelo da ilustração, uma família só (Figtree) numa escala curta e fixa, e uma única cor de ação, o âmbar, que aparece apenas no que se pode clicar. O âmbar escurecido (o "âmbar tostado") faz o trabalho de foco e links, porque o âmbar claro some sobre o branco. A densidade é de formulário de trabalho: campos de 44px, botões de 40 a 48px, mensagens em espaço reservado para que nada pule quando o estado muda.

O sistema é multi-tenant por construção: a cor de ação, o texto sobre ela e a cor de foco/links são variáveis CSS que cada ONG substitui pelas próprias cores, sempre com contraste AA garantido pelo pacote de domínio. Só existe tema claro. A tela de login em cartão centralizado sobre fundo cinza foi recusada explicitamente para as telas de acesso.

**Key Characteristics:**

- Mídia do animal preenchendo o próprio quadro; interface ancorada embaixo, à esquerda.
- Uma única cor de ação (âmbar), só em elementos clicáveis, uma vez por tela.
- Foco e links no âmbar tostado; contorno sólido de 2px com afastamento de 2px.
- Neutros quentes derivados do caramelo; nada de cinza frio.
- Figtree auto-hospedada, escala curta, títulos em negrito com tracking apertado.
- Cores de marca trocáveis por ONG via variáveis CSS, com AA garantido.
- Só tema claro; ícones Lucide.

## Colors

Paleta quente e contida: branco, tinta quase preta com fundo marrom, neutros de areia e caramelo, um âmbar de ação e um vermelho-telha para erro.

### Primary

- **Âmbar de Ação** (`primary`): a única cor de ação. Preenche o botão principal de cada tela ("Entrar", "Confirmar", "Salvar animal") e, sobre o marrom da moldura, o "+" da marca. Sobre fundo claro nunca é texto nem ícone (contraste 1,76:1 com o branco). No hover, escurece 8% com preto. É o padrão da plataforma: `brandThemeStyle()` reescreve `--primary` com a cor da ONG na área dela.
- **Texto sobre a Ação** (`primary-foreground`): preto, escolhido por `readableForeground()` como o mais legível sobre a cor de ação (11,95:1 sobre o âmbar). Para uma ONG com cor escura, o domínio troca para branco.
- **Âmbar Tostado** (`ring`): o âmbar escurecido até contraste AA sobre branco (4,59:1), gerado por `darkenUntilReadableOnWhite()`. Cor de todo contorno de foco, de todo link, do cursor de texto nos campos, do "+" da marca sobre fundo claro e do ícone de 2FA ativa. Também é trocado por ONG.

### Neutral

- **Branco** (`background`): fundo da página e de toda superfície de conteúdo (o painel de acesso, cartões, campos). `card` e `popover` têm o mesmo valor.
- **Tinta Quente** (`foreground`): texto principal, quase preto com fundo marrom (17,24:1 sobre branco). Também tinge as sombras.
- **Névoa Caramelo** (`secondary` / `muted`): o neutro de superfície. É o fundo do painel logado, do botão secundário, do hover de contorno e fantasma, do campo desativado e dos blocos do esqueleto de carregamento. `accent` tem o mesmo valor e não é usado por nenhum componente hoje.
- **Terra Suave** (`muted-foreground`): texto de apoio (descrições, ajuda, rodapé, rótulos de lista, placeholder, o "ou" do divisor). 6,76:1 sobre branco, 5,98:1 sobre a névoa.
- **Linha de Areia** (`border`): divisórias, separadores, linhas entre itens de lista. Borda padrão de todo elemento.
- **Contorno de Campo** (`input`): borda de campo e do botão de contorno, escurecida para 3,92:1 sobre branco (WCAG 1.4.11 pede 3:1).
- **Marrom Moldura** (`frame-brown`): o marrom da moldura de acesso. Fundo atrás da ilustração no computador e faixa do topo do painel logado. Token `--shell` (`bg-shell`).
- **Véu de Fim de Tarde** (`veil`): só em gradiente com transparência, atrás da marca e do slogan sobre a ilustração (ver Elevation & Depth). Token `--veil` (`from-veil/…`).

### Feedback

- **Vermelho Telha** (`destructive`): erro de campo, borda de campo inválido, texto do alerta de erro e fundo do botão destrutivo (texto branco, 6,57:1). Hover escurece 12% com preto.
- **Rosado de Alerta** (`destructive-muted`): fundo do alerta de erro, com borda no vermelho a 30%.

### Named Rules

**A Regra do Âmbar Único.** O âmbar preenche apenas o botão principal de cada tela. As demais ações são contorno, secundário, fantasma ou link. Fora disso ele só aparece no "+" da marca sobre o marrom e, a 45%, na seleção de texto.

**A Regra do Âmbar Tostado.** Sobre fundo claro, toda cor de marca em forma de texto, ícone, link ou foco usa `ring`, nunca `primary`. O âmbar claro é preenchimento, não tinta.

**A Regra da Marca Emprestada.** Cores de marca só entram pelo `brandThemeStyle()`, aplicado na raiz da área com a marca (o `body` na plataforma, a página da ONG nas páginas dela). Componentes usam `var(--primary)`, `var(--primary-foreground)` e `var(--ring)`, nunca o hex do âmbar.

## Typography

**Display Font:** Figtree Variable (com ui-sans-serif, system-ui, sans-serif)
**Body Font:** Figtree Variable (a mesma família)

**Character:** Uma geométrica humanista e amigável, auto-hospedada via `@fontsource-variable/figtree`. Calorosa nos títulos em negrito com tracking apertado, neutra e muito legível no corpo. Hierarquia por peso e tamanho, nunca por uma segunda família.

### Hierarchy

- **Display** (700, 3rem, 1.05, -0.025em): o slogan sobre a ilustração das telas de acesso, em branco, até 14ch. Desce para 2.25rem em telas de computador baixas (altura até 820px), 1.875rem a partir de 40rem de largura e 1.5rem no celular (entrelinha 1.25).
- **Headline** (700, 1.875rem, 1.2, -0.025em): o `h1` de cada tela ("Entrar", "Verificação em duas etapas", a saudação do painel). Com `text-balance`.
- **Title** (600, 1.125rem, 1.556): títulos de seção dentro de uma tela ("Sua conta"). A vitrine usa também 1.5rem/700 e 1.25rem/600 nos próprios cabeçalhos.
- **Body** (400, 1rem, 1.5): texto corrido, descrições abaixo do título (em `muted-foreground`) e valor dos campos. Parágrafos limitados a `max-w-prose` (65ch).
- **Body small** (400, 0.875rem, 1.43): ajuda de campo, rodapé, rótulos de lista, conteúdo de cartão e alerta. A mensagem de erro usa o mesmo tamanho em 500.
- **Label** (600, 0.875rem, 1): rótulo de campo, sempre visível acima dele.
- **Button** (600, 0.9375rem): texto do botão padrão; o grande usa 1rem, o pequeno 0.875rem.
- **Code** (600, 1.5rem, algarismos tabulares): dígitos do código de 6 dígitos. O código de recuperação usa a fonte mono do sistema com tracking largo.
- **Wordmark** (800, -0.025em): "Acolhe+", em 1.5rem a 1.875rem sobre a ilustração e 1.25rem na faixa do painel. O nome não é traduzido.

### Named Rules

**A Regra da Escala Curta.** Uma família, nove papéis. Tamanho novo só entra quando uma tela real pedir e não couber em nenhum destes.

## Layout

A unidade é a de 4px do Tailwind; o ritmo observado é 8 / 12 / 16 / 24 / 32 / 40 / 48px. Rótulo e campo ficam a 8px; campos se separam por 12px mais a área reservada da mensagem; o título fica a 8px da descrição e 32px do formulário; o pé do painel abre com 32px.

**Moldura de acesso** (`/entrar`, `/entrar/2fa`). A partir de 64rem: a ilustração cobre a tela inteira com o cão à direita (`object-position: 72% 50%`); a marca e o slogan ficam no canto superior esquerdo com 48px de margem; o painel branco de 27rem assenta embaixo, à esquerda, a 48px das bordas, com topo mínimo em `clamp(13rem, 30svh, 18rem)` para nunca cobrir o slogan. Abaixo de 64rem: a ilustração vira um retrato em close no terço de cima (36svh, mínimo 14rem), a marca sobre ela, e o formulário segue logo abaixo em fundo branco, ocupando a largura com 24px (32px a partir de 40rem) de margem, sem sobreposição. A orelha do cão sangra pela borda direita: é o enquadramento de feed, aceito.

**Painel logado.** Fundo em névoa caramelo, faixa do topo de 64px em marrom moldura, conteúdo centralizado em 64rem com 24px de margem lateral e 48px em cima e embaixo. Blocos de conteúdo limitados a 36rem.

**Vitrine** (`/dev/ui`). Coluna de 72rem, seções separadas por linha de areia e 40px.

Breakpoints usados: 40rem, 48rem, 64rem, mais uma consulta de altura (até 820px) para o slogan.

### Named Rules

**A Regra do Quadro do Animal.** Onde houver mídia do animal, ela preenche o próprio quadro e a interface ou a legenda ancoram embaixo, sobre véu ou num painel; a mídia nunca vira miniatura dentro de um cartão de login.

**A Regra do Espaço Reservado.** Toda mensagem de campo tem lugar reservado (20px, ou 40px no último campo, que também mostra o erro do envio). Mudar de estado nunca empurra o layout; o esqueleto de carregamento tem a mesma altura do formulário.

## Elevation & Depth

O sistema é plano por padrão: superfícies brancas separadas por linha de areia ou por um anel de 1px na tinta a 10%. Sombra só aparece quando uma superfície flutua sobre algo que não é branco, e sempre tingida de marrom, nunca cinza ou preta pura. A profundidade das telas de acesso vem da própria ilustração e do véu.

### Shadow Vocabulary

- **Painel sobre a imagem** (`box-shadow: 0 24px 64px -16px rgb(26 16 10 / 0.55)`): o painel de acesso no computador, sobre a ilustração. No celular o painel não flutua e não tem sombra.
- **Superfície em repouso** (`box-shadow: 0 1px 2px rgb(31 26 23 / 0.06), 0 8px 24px -12px rgb(31 26 23 / 0.18)`): lista da conta sobre a névoa caramelo do painel.
- **Anel de cartão** (`box-shadow: 0 0 0 1px rgb(31 26 23 / 0.1)`): o componente Card, sem sombra projetada.

**Véu.** Gradiente do véu de fim de tarde só atrás da marca: no celular `linear-gradient(to bottom, rgb(26 16 10 / 0.75), rgb(26 16 10 / 0.25) 45%, transparent)`; no computador `linear-gradient(160deg, rgb(26 16 10 / 0.8), rgb(26 16 10 / 0.35) 30%, transparent 60%)`, interpolados em oklab.

### Named Rules

**A Regra da Sombra Quente.** Toda sombra usa o marrom do véu ou da tinta, nunca preto neutro. Se a superfície está sobre branco, ela não tem sombra.

## Shapes

Cantos suaves derivados de uma base de 10px (`--radius: 0.625rem`): 6px, 8px, 10px, 14px e 16px. Botões, campos, alertas, grupo do código e esqueletos usam 10px; cartões e a lista da conta, 14px; o painel de acesso e as molduras da vitrine, 16px. Os botões pequenos (32px e 24px) usam 8px. Os seis dígitos do código formam uma barra única: só a primeira e a última casa têm canto. Bordas são de 1px; o campo inválido ganha um segundo pixel por dentro (sombra interna) em vez de engrossar a borda. A ilustração nunca tem canto: sangra até a borda do quadro.

## Components

### Buttons

Firmes e baixos, sem sombra, com resposta tátil discreta.

- **Shape:** cantos de 10px; borda transparente de 1px em todas as variantes, para as alturas baterem.
- **Tamanhos:** padrão 40px (16px de lado), grande 48px (20px de lado, usado nos botões de envio das telas de acesso, em largura total), pequeno 32px, ícone 40×40.
- **Principal:** âmbar com texto preto, peso 600. Hover escurece 8%.
- **Contorno:** branco com borda em contorno de campo; hover na névoa. É o botão do Google, com o "G" nas cores oficiais.
- **Secundário:** névoa caramelo; hover mistura 5% de tinta. Usado no "Sair" sobre a faixa marrom.
- **Fantasma:** sem fundo; hover na névoa. Usado no "Mostrar/Ocultar" da senha (32px).
- **Destrutivo:** vermelho telha com texto branco; hover escurece 12%.
- **Link:** texto em âmbar tostado, sublinhado de 1px com afastamento de 4px, 2px no hover; sem altura nem padding próprios.
- **Foco:** contorno sólido de 2px em `ring` com afastamento de 2px. Sobre a faixa marrom e a ilustração, o contorno vira branco.
- **Ativo:** desce 1px. Transição de 150ms ease-out em fundo, borda, cor e posição.
- **Carregando:** `aria-busy`, spinner Lucide de 16px antes do texto, texto troca para o gerúndio ("Entrando…"), cursor de progresso; não fica translúcido. **Desativado:** opacidade 50%.

### Inputs / Fields

- **Style:** 44px de altura, fundo branco, borda de 1px em contorno de campo, cantos de 10px, 12px de lado, texto em 1rem.
- **Focus:** borda passa a `ring` e ganha contorno sólido de 2px em `ring` com afastamento de 2px. Cursor de texto em `ring`.
- **Error:** borda em vermelho telha mais 1px interno da mesma cor; abaixo, a mensagem em vermelho, 0.875rem/500, com ícone `CircleAlert` de 16px, `role="alert"`, ligada ao campo por `aria-describedby`.
- **Disabled:** fundo em névoa caramelo, opacidade 60%.
- **Rótulo:** sempre visível, acima do campo, 0.875rem/600. Ajuda abaixo em texto de apoio; o erro ocupa o lugar da ajuda.
- **Senha:** grupo com o campo e um botão fantasma "Mostrar"/"Ocultar" com ícone de olho dentro da borda; o foco do campo desenha o contorno no grupo todo.
- **Código de 6 dígitos:** seis casas de 56px de altura em barra única, dígitos em 1.5rem/600 tabulares; a casa ativa ganha borda e anel de 2px em `ring` (sem afastamento); inválido pinta todas as bordas de vermelho. Confere sozinho ao completar.
- **Área de texto:** mesmo tratamento do campo, mínimo de 96px, cresce com o conteúdo.

### Cards / Containers

- **Card (pacote):** fundo branco, cantos de 14px, anel de 1px na tinta a 10%, 16px de espaçamento interno (12px no tamanho pequeno), texto em 0.875rem. Título em 1rem/500; descrição em texto de apoio. Não aninhar cartões.
- **Lista de dados (painel):** lista de definições em fundo branco, cantos de 14px, sombra de superfície em repouso, linhas de 12px × 16px separadas por linha de areia; rótulo à esquerda em texto de apoio, valor à direita em 500.
- **Painel de acesso:** fundo branco, 32px de espaçamento interno, cantos de 16px e sombra de painel sobre a imagem no computador; no celular, superfície plana de largura total.

### Alerts

- **Padrão:** fundo branco, borda de areia, cantos de 10px, 12px × 14px, ícone Lucide de 16px à esquerda, título em 600.
- **Erro:** fundo rosado de alerta, borda em vermelho a 30%, título e descrição em vermelho telha.

### Navigation

- **Faixa do painel:** 64px em marrom moldura, texto branco; a marca à esquerda (link para o início, foco branco) e "Sair" em botão secundário à direita. Não há outra navegação construída ainda.

### Moldura de acesso (assinatura)

A expressão atual do gesto marcante do sistema: ilustração do caramelo em tela cheia (a cena da varanda no computador, o retrato no celular, AVIF/WebP em várias larguras), véu só atrás da marca, painel branco ancorado embaixo à esquerda, e no pé do painel a linha "Plataforma gratuita e de código aberto…" com o link "Ver o código". A ilustração é decorativa (`alt=""`) e entra com a animação **settle** (escala 1.045 → 1 em 1.6s, `cubic-bezier(0.16, 1, 0.3, 1)`), o único movimento de entrada da página, só com `prefers-reduced-motion: no-preference`. Toda imagem gerada carrega a proveniência ao lado (`public/ilustracoes/PROVENIENCIA.md` e um `.json` por arquivo).

### Wordmark

"Acolhe" em Figtree 800 com tracking apertado e o "+" na cor de marca: âmbar sobre fundo escuro, âmbar tostado sobre fundo claro. Não há logotipo gráfico.

## Do's and Don'ts

### Do:

- **Do** usar `primary` só como preenchimento do botão principal de cada tela; as outras ações vão em contorno, secundário, fantasma ou link.
- **Do** usar `ring` para todo foco (contorno sólido de 2px, afastamento de 2px), todo link (sublinhado de 1px, afastamento de 4px, 2px no hover) e toda cor de marca em forma de texto ou ícone sobre fundo claro.
- **Do** aplicar cores de marca com `brandThemeStyle()` na raiz da área com a marca e consumir `var(--primary)`, `var(--primary-foreground)` e `var(--ring)` nos componentes.
- **Do** reservar o espaço das mensagens abaixo dos campos (20px; 40px no último) e dar ao esqueleto de carregamento a altura do conteúdo final.
- **Do** manter alvos de toque entre 40 e 48px (botões 40/48px, campos 44px, casas do código 56px).
- **Do** manter o rótulo visível acima de cada campo e o erro com ícone `CircleAlert` no lugar da ajuda.
- **Do** usar ícones Lucide de 16px dentro de botões e mensagens, com `aria-hidden`.
- **Do** registrar a proveniência de toda imagem gerada ao lado do arquivo e rotular material ilustrativo como exemplo.
- **Do** tingir sombras com o marrom (`rgb(26 16 10)` ou `rgb(31 26 23)`) e usá-las só sobre imagem ou névoa.

### Don't:

- **Don't** usar o âmbar (`primary`) como texto ou ícone sobre branco ou névoa (1,76:1); sobre fundo claro, use `ring`. Âmbar como texto só sobre o marrom moldura (8,1:1), como no "+" da marca.
- **Don't** colocar links em `ring` sobre a névoa caramelo (4,06:1, abaixo de AA); links ficam em superfícies brancas.
- **Don't** escrever o hex do âmbar ou do âmbar tostado em componentes: isso quebra o tema das ONGs.
- **Don't** montar as telas de acesso como cartão de login centralizado sobre fundo cinza.
- **Don't** usar laranja-amarelo saturado dentro de ilustrações: é reservado à interface.
- **Don't** usar o véu escuro fora da área da marca sobre a imagem.
- **Don't** introduzir uma segunda família tipográfica nem fonte de sistema como display.
- **Don't** aninhar cartões.
- **Don't** criar tema escuro nem variantes `dark:`: o contraste por ONG é validado só sobre o tema claro.
- **Don't** adicionar animação de entrada além do settle da ilustração, nem animação que ignore `prefers-reduced-motion`.
