import type { Email } from './provider'

/** Assunto e corpo de um e-mail, sem o destinatário. */
export type Message = Omit<Email, 'to'>

// Cores da plataforma (PLATFORM_COLORS na web): texto marrom-escuro sobre o âmbar passa no AA.
const BRAND = { primary: '#ffb547', onPrimary: '#3b2618', muted: '#52606d' }

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Nomes vêm de quem se cadastrou ou da organização: nunca entram crus no HTML. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char)
}

type Content = {
  subject: string
  greeting: string
  paragraphs: string[]
  action: { label: string; url: string }
  /** Fecho em letra menor: validade do link e o que fazer se a pessoa não pediu. */
  note: string
}

function compose({ subject, greeting, paragraphs, action, note }: Content): Message {
  const paragraph = (text: string) => `<p style="margin:0 0 16px">${escapeHtml(text)}</p>`
  const url = escapeHtml(action.url)
  const html = `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:24px;background:#f6f5f2;font-family:Arial,Helvetica,sans-serif;color:#1f2933;font-size:16px;line-height:1.5">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px">
<p style="margin:0 0 24px;font-size:20px;font-weight:bold">Acolhe+</p>
${[greeting, ...paragraphs].map(paragraph).join('\n')}
<p style="margin:24px 0"><a href="${url}" style="display:inline-block;background:${BRAND.primary};color:${BRAND.onPrimary};text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:bold">${escapeHtml(action.label)}</a></p>
<p style="margin:0 0 16px;font-size:14px;color:${BRAND.muted}">Se o botão não funcionar, copie este endereço no navegador:<br><a href="${url}" style="color:${BRAND.onPrimary};word-break:break-all">${url}</a></p>
<p style="margin:0;font-size:14px;color:${BRAND.muted}">${escapeHtml(note)}</p>
</div>
</body>
</html>`
  const text = [
    greeting,
    ...paragraphs,
    `${action.label}: ${action.url}`,
    note,
    'Equipe Acolhe+',
  ].join('\n\n')
  return { subject, html, text }
}

const IGNORE = 'Se não foi você, ignore este e-mail: nada muda na sua conta.'

/** Confirmação do e-mail no cadastro e a cada login recusado por falta dela (FR-003). */
export function verificationEmail({ name, url }: { name: string; url: string }): Message {
  return compose({
    subject: 'Confirme seu e-mail no Acolhe+',
    greeting: `Olá, ${name}!`,
    paragraphs: ['Para entrar no Acolhe+, confirme que este e-mail é seu.'],
    action: { label: 'Confirmar e-mail', url },
    note: `O link vale por 24 horas. ${IGNORE}`,
  })
}

/** "Esqueci a senha" (FR-004). */
export function resetPasswordEmail({ name, url }: { name: string; url: string }): Message {
  return compose({
    subject: 'Redefina sua senha do Acolhe+',
    greeting: `Olá, ${name}!`,
    paragraphs: [
      'Recebemos um pedido para redefinir a senha da sua conta. Ao criar a nova senha, as outras sessões abertas da conta são encerradas.',
    ],
    action: { label: 'Criar nova senha', url },
    note: `O link vale por 1 hora e só pode ser usado uma vez. ${IGNORE}`,
  })
}

/** Primeiro acesso de quem teve a conta criada pela equipe da plataforma (BR-015). */
export function firstAccessEmail({ name, url }: { name: string; url: string }): Message {
  return compose({
    subject: 'Sua conta no Acolhe+ foi criada',
    greeting: `Olá, ${name}!`,
    paragraphs: [
      'A equipe do Acolhe+ criou uma conta para você. Para usá-la, crie a sua senha: ninguém da equipe a conhece.',
    ],
    action: { label: 'Criar minha senha', url },
    note: 'O link vale por 1 hora. Se ele expirar, use "Esqueci a senha" na tela de entrada para receber outro.',
  })
}

/** Convite para a equipe de uma organização (BR-056). */
export function invitationEmail({
  organizationName,
  inviterName,
  url,
}: {
  organizationName: string
  inviterName: string
  url: string
}): Message {
  return compose({
    subject: `Convite para a equipe de ${organizationName} no Acolhe+`,
    greeting: 'Olá!',
    paragraphs: [
      `${inviterName} convidou você para a equipe de ${organizationName} no Acolhe+.`,
      'Para aceitar, entre com este e-mail (confirmado) e abra o convite.',
    ],
    action: { label: 'Ver convite', url },
    note: `O convite vale por 7 dias. Se não conhece ${organizationName}, ignore este e-mail.`,
  })
}
