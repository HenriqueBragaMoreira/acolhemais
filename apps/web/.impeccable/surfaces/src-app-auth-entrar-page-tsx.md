---
version: 1
slug: "src-app-auth-entrar-page-tsx"
primary_target: "src/app/(auth)/entrar/page.tsx"
related_targets: ["src/app/(auth)/entrar/2fa/page.tsx","src/app/(application)/painel/page.tsx","src/app/dev/ui/page.tsx"]
---

# Telas de acesso: Entrar, código 2FA, painel mínimo e vitrine

## Escopo e modo

Operate. Entrar (`/entrar`), código 2FA (`/entrar/2fa`), destino após o login (`/painel`) e a
vitrine dos componentes (`/dev/ui`, só desenvolvimento e E2E). Primeiras telas do design system
(`packages/ui`, shadcn sobre Base UI, só tema claro).

## Público, tarefa e restrições

- Equipe das ONGs (voluntários, coordenadores, protetores) e da plataforma; entram para
  trabalhar. Sucesso: estar dentro em segundos, com e-mail e senha ou Google, e o código TOTP
  quando houver 2FA.
- Estados: foco, carregando, credencial errada com tentativas restantes, bloqueio temporário,
  conta suspensa, muitas requisições, código inválido, código de recuperação, verificação
  expirada. Mensagens em espaço reservado: mudar de estado não empurra o layout.
- Só o que funciona: sem "esqueci a senha" e sem "criar conta"; botão do Google só quando a
  API informa que está ligado (`GET /auth/providers`).
- WCAG 2.1 AA (axe no E2E), uso completo por leitor de tela e teclado, pt-BR, ícones Lucide.

## Direction contract

THESIS: o animal ocupa o quadro inteiro, como nos posts de resgate que as ONGs publicam; a
interface fica ancorada embaixo, à esquerda, sem disputar com ele. Recusa o cartão de login
centralizado sobre fundo cinza que toda a categoria entrega.

OWN-WORLD: ilustração pintada de um vira-lata caramelo na luz dourada do fim de tarde (origem:
ChatGPT/OpenAI, registrada junto do arquivo). Painel branco de cantos 16px, tinta quente quase
preta, neutros tingidos do caramelo, uma única cor de ação âmbar (#FFB547, texto escuro) só no
que se pode clicar; foco e links na variante escura do âmbar (AA sobre branco). Figtree
auto-hospedada, escala fixa curta. Véu escuro só atrás da marca.

STORY: quem chega reconhece o universo da adoção antes de ler qualquer coisa, entende que é a
área da organização e entra sem procurar nada.

FIRST VIEWPORT: computador: ilustração em tela cheia com o cão à direita; "Acolhe+" e o slogan
no canto superior esquerdo, em branco sobre o véu; painel branco de ~420px ancorado embaixo à
esquerda com título "Entrar", Google (se ligado), divisor, e-mail, senha com "Mostrar", espaço
de erro e o botão âmbar "Entrar"; no pé do painel, a linha "Plataforma gratuita e de código
aberto…" com o link "Ver o código" (aprovada pelo usuário em 2026-11-03). Celular: ilustração em close no terço de cima com a marca;
formulário logo abaixo em fundo branco, sem sobreposição. A orelha do cão sangra pela borda
direita do quadro: enquadramento de feed aceito pelo usuário em 2026-11-03.

FORM: desafiante de catálogo pop-culture-shelf-vertical-video-feed-surface ("Feed de resgate"),
escolhido pelo usuário no lugar do nº 5 sorteado da lista própria (Termo carimbado).
seed:5ceef50614bbd2ff. Gesto marcante do sistema: mídia do animal sempre preenchendo o próprio
quadro, com nome e legenda ancorados embaixo sobre véu (componente entra com as telas de animais).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decisões em aberto

Nenhuma para estas telas. Fotos reais de animais e a mídia das ONGs ficam para as telas de
animais (Fase 1).
