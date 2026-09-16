---
version: 1
slug: "src-app-application-painel-page-tsx"
primary_target: "src/app/(application)/painel/page.tsx"
related_targets: ["src/app/(application)/painel/animais/page.tsx","src/app/(application)/painel/candidaturas/page.tsx"]
---

# Painel da organização

- **Escopo:** a área logada da organização (`/painel`): Início (resumo), Animais (lista, cadastro
  e edição em etapas, FR-030, FR-031, FR-032) e Candidaturas (colunas por etapa no computador,
  lista no celular, e a ficha com as ações, FR-045, FR-046, FR-048, FR-049). Regras visíveis:
  etapas e histórico (BR-076), recusa com motivo interno e mensagem (BR-077), ordem (BR-082),
  outras candidaturas (BR-084), CPF mascarado e revelação registrada (BR-085), selos (BR-090),
  status do animal (BR-064), concluir com documento com foto conferido (BR-079).
- **Modo:** Operate: a equipe da ONG trabalha aqui toda semana, muitas vezes no celular.
- **Dados:** fictícios, do Coletivo Focinho Gelado, em `services/` (qualquer conta que entrar vê a mesma
  organização); as mudanças valem até recarregar a página.
- **Decisões do mantenedor (2026-11-12):** estrutura "Resumo com números"; entram a ficha com
  as ações, o cadastro de animal, concluir a adoção e revelar o CPF; mover de etapa por botão na
  ficha (sem arrastar); login de verdade, como hoje.

## Direction contract

THESIS: o painel é o caminho da adoção visto do lado da ONG: os números são estações do mesmo
trilho que o adotante viu ao enviar, e cada animal aparece pela própria foto. Recusa a fileira de
cartões de indicador iguais e a tabela cinza de administração.

OWN-WORLD: faixa marrom moldura com a marca, o nome da ONG e as abas; fundo névoa caramelo;
painéis brancos de 16px com a sombra de superfície em repouso; tinta quente; o trilho de etapas
(linha de 2px, estações em círculo, contagem em 1.875rem com algarismos tabulares); fotos de
animal recortadas 4:5 com cantos de 8px; um só âmbar por tela.

STORY: a pessoa da ONG entra, vê quantas candidaturas esperam em cada etapa e quais chegaram
agora, abre uma, lê a ficha, move de etapa, pede informação, recusa ou conclui; cadastra um
animal em etapas e publica.

FIRST VIEWPORT: faixa de 64px (Acolhe+ · Coletivo Focinho Gelado, abas Início / Animais / Candidaturas,
Sair); "Olá, {nome}!" em 1.875rem; painel "Candidaturas" com o trilho de estações (Recebida, Em
análise, Entrevista/visita, Aprovada), cada uma link para a sua coluna; ao lado, em 20rem,
"Animais" com as contagens por situação e "Cadastrar animal" (o âmbar); abaixo, "Chegaram agora"
com a foto do animal, o adotante, os selos e há quanto tempo. Celular: o trilho vira vertical.
Interação assinatura: a candidatura movida desliza para a nova estação do trilho na ficha e,
nas colunas, fica marcada "Movida agora" até a próxima visita.

FORM: "Resumo com números", escolhida pelo mantenedor (7ª da lista). seed:f4536d4fdff05bb8.
Do quadro de embarque (recusado) fica a linha que muda de lugar e continua acesa até ser vista.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance
