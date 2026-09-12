import { afterEach, describe, expect, it, vi } from 'vitest'
import { deliver, mailpitProvider, resendProvider } from './provider'
import { invitationEmail, verificationEmail } from './templates'

const email = { to: 'ana@acolhemais.test', subject: 'Assunto', html: '<p>oi</p>', text: 'oi' }

function captureFetch(status = 200) {
  const calls: { url: string; init: RequestInit }[] = []
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    calls.push({ url: new Request(input).url, init: init ?? {} })
    return new Response('{}', { status })
  })
  return calls
}

describe('FR-080: envio de e-mails', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('envia pelo Resend com a chave e o remetente da plataforma', async () => {
    const calls = captureFetch()
    await resendProvider('re_chave', 'nao-responda@acolhemais.org').send(email)

    expect(calls[0]?.url).toBe('https://api.resend.com/emails')
    expect(new Headers(calls[0]?.init.headers).get('authorization')).toBe('Bearer re_chave')
    expect(JSON.parse(String(calls[0]?.init.body))).toEqual({
      from: 'Acolhe+ <nao-responda@acolhemais.org>',
      to: ['ana@acolhemais.test'],
      subject: 'Assunto',
      html: '<p>oi</p>',
      text: 'oi',
    })
  })

  it('envia pela API do Mailpit no ambiente local', async () => {
    const calls = captureFetch()
    await mailpitProvider('http://localhost:8025', 'nao-responda@acolhemais.local').send(email)

    expect(calls[0]?.url).toBe('http://localhost:8025/api/v1/send')
    expect(JSON.parse(String(calls[0]?.init.body))).toMatchObject({
      From: { Name: 'Acolhe+', Email: 'nao-responda@acolhemais.local' },
      To: [{ Email: 'ana@acolhemais.test' }],
      Subject: 'Assunto',
    })
  })

  it('não derruba quem envia quando o serviço falha: só registra no log, sem o destinatário', async () => {
    captureFetch(500)
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(deliver(resendProvider('re_chave', 'x@acolhemais.org'), email)).resolves.toBe(
      undefined,
    )
    expect(log).toHaveBeenCalledOnce()
    expect(JSON.stringify(log.mock.calls)).not.toContain('ana@acolhemais.test')
  })

  it('escapa no HTML os nomes vindos de usuários e mantém o link no texto puro', () => {
    const url = 'https://api.acolhemais.test/verify?token=abc&callbackURL=x'
    const message = verificationEmail({ name: '<script>Ana</script>', url })
    expect(message.html).not.toContain('<script>')
    expect(message.html).toContain('&lt;script&gt;Ana&lt;/script&gt;')
    expect(message.html).toContain('token=abc&amp;callbackURL=x')
    expect(message.text).toContain(url)

    const invite = invitationEmail({ organizationName: 'Patas & Cia', inviterName: 'Bia', url })
    expect(invite.subject).toBe('Convite para a equipe de Patas & Cia no Acolhe+')
    expect(invite.html).toContain('Patas &amp; Cia')
  })
})
