---
version: 1
slug: "src-app-public-page-tsx"
primary_target: "src/app/(public)/page.tsx"
related_targets: ["src/app/(public)/sobre/page.tsx"]
---

# Página inicial (vitrine) e Sobre

- **Escopo:** `/` (vitrine de animais, FR-050) e `/sobre` (FR-053), no grupo `(public)` com
  cabeçalho e rodapé próprios. A página do animal (`/animais/{id}`) é a próxima tela.
- **Modo:** a vitrine é Operate com cara de Experience (achar um animal; os animais lideram);
  o Sobre é Read.
- **Público:** quem quer adotar, vindo de link ou busca; ONGs e quem quer apoiar, pelo Sobre.
- **Dados:** fictícios, de `services/animals` (fotos do Unsplash, origem em
  `public/demo/animais/PROVENIENCIA.md`). Sem aviso de demonstração na tela: decisão do
  mantenedor em 2026-11-11 (ele avisa nos vídeos).
- **Decisões do mantenedor (2026-11-11):** topo branco com a galeria já visível; cartão com a foto
  ocupando o quadro e legenda sobre véu; cabeçalho branco; busca com cidade como campo principal,
  espécie ao lado e "Mais filtros"; ordem "há mais tempo esperando", com opção "mais recentes";
  "Ver mais animais" em vez de rolagem infinita.

## Direction contract

THESIS: a página inicial é o próprio feed de resgate: quem chega vê animais esperando antes de
ler qualquer coisa. Recusa o hero de marketing com foto de banco e três cartões de "como
funciona".

OWN-WORLD: o "Feed de Resgate" do DESIGN.md: branco, tinta quente, neutros caramelo, um só âmbar
(o "Buscar"), cartões verticais 4:5 em que a foto sangra até o canto e a legenda ancora embaixo
sobre o véu marrom.

STORY: o visitante entende que ali há animais de várias ONGs, filtra pela cidade dele e abre um
animal. No Sobre, entende o que é o projeto e como ajudar.

FIRST VIEWPORT: cabeçalho branco de 64px; topo sobre a cena do caramelo com véu à esquerda
(decisão do mantenedor em 2026-11-11: o topo branco ficou "sem vida"); título em branco e linha
de apoio à esquerda; a busca num painel branco de até 56rem (a cidade precisa de largura com os
quatro controles numa linha); abaixo, em névoa caramelo, a linha de resultado (contagem e ordem)
e a primeira fileira de cinco cartões cortando a borda inferior a 1440×900.

FORM: estrutura fixada pelo mantenedor (textos, busca no centro, galeria embaixo), dentro do
mundo já estabelecido. seed: none (sem sorteio: pedido especificado pelo mantenedor; o new-work
manda não sortear nesse caso).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance
