---
version: 1
slug: "src-app-public-animais-id-candidatura-page-tsx"
primary_target: "src/app/(public)/animais/[id]/candidatura/page.tsx"
related_targets: []
---

# Candidatura do adotante

- **Escopo:** `/animais/{id}/candidatura` (FR-040, FR-041, FR-042, FR-044), aberta pelo "Quero
  adotar" da página do animal. Questionário base da plataforma (BR-070), perguntas da
  organização, revisão e a tela de enviada. Regras visíveis: CPF válido (BR-071), uma candidatura
  por animal (BR-075) e o limite de ativas (BR-074).
- **Modo:** Operate: a pessoa completa uma tarefa longa sem desistir no meio.
- **Dados:** fictícios, de `services/applications` (qualquer código de 6 dígitos vale; qualquer
  e-mail e senha entram na conta de exemplo da Marina, que já se candidatou ao Caramelo; o CPF
  529.982.247-25 está no limite de candidaturas).
- **Decisões do mantenedor (2026-11-11):** etapas (wizard) com react-hook-form, zod e Stepperize;
  os dois caminhos, sem conta (e-mail com código) e com conta (respostas salvas vêm
  preenchidas); 2 ou 3 perguntas próprias por organização; depois de enviar, os próximos passos e
  "como aumentar as suas chances".

## Direction contract

THESIS: um questionário longo vira uma conversa em partes curtas, com o animal sempre à vista
lembrando por que a pessoa está ali. Recusa o formulário único de vinte campos e o "wizard" de
checkout com abas numeradas clicáveis.

OWN-WORLD: o mundo público do Acolhe+: fundo areia, painel branco de cantos de 16px com a sombra
de superfície em repouso, barra de progresso em segmentos de tinta, perguntas Sim/Não em linha
com o rádio âmbar, um só âmbar por etapa (Continuar).

STORY: a pessoa diz quem é, conta da casa, dos animais, da rotina e do porquê, responde à
organização, confere e envia; depois entende o caminho até a adoção e o que fazer para ajudar.

FIRST VIEWPORT: cabeçalho branco; "Voltar para {animal}"; título "Candidatura para {animal}" em
2.25rem; à esquerda o painel com "Etapa 1 de 8", os segmentos, o título da etapa em 1.875rem, a
explicação e a escolha "Primeira vez" / "Já tenho conta" em dois cartões; à direita (20rem) o
animal: foto 4:5, nome, sexo e idade, organização, taxa. Celular: o animal numa linha compacta
acima do painel. Interação assinatura: ao trocar de etapa, o foco vai para o título dela.

FORM: etapas, escolhida pelo mantenedor. seed: none (pinned: "A user- or brief-pinned direction
beats the roll, always." — new-work.md; o mantenedor fixou a estrutura em etapas).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the
verdict, DESIGN.md, and every shipping raster carrying its provenance
