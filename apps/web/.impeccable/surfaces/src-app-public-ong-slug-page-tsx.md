---
version: 1
slug: "src-app-public-ong-slug-page-tsx"
primary_target: "src/app/(public)/ong/[slug]/page.tsx"
related_targets: []
---

# Página pública da organização

- **Escopo:** `/ong/{slug}` (FR-026), no grupo `(public)`, com a marca da organização (BR-048),
  o PIX dela com QR e copiar (BR-049), contato, cidades de atuação e os animais dela com a mesma
  busca da galeria. Slug antigo leva ao atual (BR-047); encerrada mostra só "organização
  encerrada" (BR-044); suspensa e inexistente caem no "não encontrada" (BR-043).
- **Modo:** Experience: a organização e os animais dela lideram; a doação vem junto.
- **Dados:** fictícios, de `services/organizations` (capas do Unsplash; uma organização sem capa
  e sem cores próprias, o Lar da Cida; uma suspensa, Protetores do Vale; e uma encerrada, o
  Grupo Amigos de Pata).
- **Decisões do mantenedor (2026-11-11):** estrutura "capa com a doação"; cor da organização
  forte; QR do PIX de verdade (`qrcode` + BR Code no domínio).

## Direction contract

THESIS: a página da ONG é a capa dela: a foto ocupa a largura e a organização se apresenta
ancorada sobre ela (quem é, onde atua, como falar, como ajudar pelo PIX), com os animais dela logo
abaixo. Recusa o perfil de rede social (avatar redondo sobre a capa, abas) e a doação escondida
no rodapé; o logo (as iniciais, enquanto não há upload) é um selo quadrado dentro do painel.

OWN-WORLD: o mundo do Acolhe+ na cor da organização, em escala de página: painel de identidade
preenchido na primária dela (texto preto ou branco garantido), faixa da secundária sob a capa e
como fundo da capa sem foto, névoa da primária a 8% no fundo da página, painel do PIX branco com
sombra marrom, cartões 4:5, cantos de 24px nos painéis.

STORY: a pessoa reconhece a organização pela capa e pela cor, vê onde ela atua e como falar com
ela, doa ali mesmo (direto para a organização, sem a plataforma no meio) e desce para os animais.

FIRST VIEWPORT: cabeçalho branco; capa a toda a largura, 22rem (sem foto, faixa de 13rem sem
véu), véu escuro embaixo; sobre a borda de baixo, no container e com a mesma altura, o painel de
identidade à esquerda (selo com as iniciais, nome em 3rem, cidade, o sobre, "Atua em", WhatsApp,
e-mail, Instagram) e "Doe por PIX" à direita (QR de 8rem, chave, "Copiar chave" na cor de ação,
no pé do painel); abaixo, a busca na coluna do painel de identidade. A capa era de 26rem com o
sobre abaixo dos painéis: baixou e o sobre entrou no painel para a busca caber na primeira tela,
na revisão do build. Celular: capa baixa, identidade sobre a borda, PIX sem o QR (não se lê o QR
na própria tela), busca e galeria. Interação assinatura: "Copiar chave" que confirma "Chave
copiada".

FORM: "capa com a doação", 6ª da lista ordenada. seed:012d09379aacc4d7

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance
