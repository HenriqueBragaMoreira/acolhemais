---
version: 1
slug: "src-app-public-animais-id-page-tsx"
primary_target: "src/app/(public)/animais/[id]/page.tsx"
related_targets: []
---

# Página do animal

- **Escopo:** `/animais/{id}` (FR-050, FR-031), no grupo `(public)`. "Quero adotar" leva a
  `/animais/{id}/candidatura` (tela 4, ainda não feita); a organização leva a `/ong/{slug}`
  (tela 3, ainda não feita).
- **Modo:** Operate com cara de Experience: decidir se quer adotar este animal; a foto lidera.
- **Dados:** fictícios, de `services/animals` (fotos do Unsplash; dois animais com série de 3
  fotos e uma foto "sensível" leve, de gato de cone, na Nuvem).
- **Decisões do mantenedor (2026-11-11):** foto grande à esquerda, fixa ao rolar, e coluna de
  informações à direita no computador; no celular, barra fixa embaixo com o "Quero adotar";
  séries de fotos e uma foto sensível para a demonstração; extras: mais animais da organização,
  compartilhar (WhatsApp e copiar link) e animais parecidos de outras organizações.

## Direction contract

THESIS: o animal ocupa o quadro e a decisão fica a um toque: foto grande, nome, o "Quero adotar"
e o que a pessoa precisa saber (taxa, organização, convivência, saúde) sem caçar. Recusa a ficha
de e-commerce com abas e o carrossel automático.

OWN-WORLD: o "Feed de Resgate": branco, tinta quente, névoa caramelo no bloco de taxa e
organização e nas fileiras do fim, um só âmbar (o "Quero adotar"), fotos 4:5 de cantos 16px.

STORY: a pessoa vê o animal, entende quem é, se combina com a casa dela e quanto custa, e decide
adotar, compartilhar ou continuar vendo animais parecidos.

FIRST VIEWPORT: cabeçalho branco; "Voltar para a galeria" (nunca "vitrine": soa como venda); à esquerda a foto 4:5 com setas, na
largura que deixa foto e miniaturas caberem na tela quando a foto fica fixa (as miniaturas
aparecem na primeira rolagem; a foto não fica menor que 32rem); à direita o nome em 3rem, "sexo · idade · porte", a cidade, o "Quero adotar" em
âmbar, o compartilhar e o bloco de taxa e organização. No celular, a foto e o nome, com a barra
do "Quero adotar" presa ao pé da tela.

FORM: estrutura escolhida pelo mantenedor entre duas (foto + coluna). seed: none (sem sorteio:
pedido especificado pelo mantenedor; o new-work manda não sortear nesse caso).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance
