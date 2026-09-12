// Lê os e-mails que a API mandou ao Mailpit do docker compose (o mesmo endereço padrão da
// configuração). Cada teste usa e-mails únicos, então a busca pelo destinatário basta.

const MAILPIT = 'http://localhost:8025'

type Summary = { ID: string }
export type ReceivedEmail = { Subject: string; Text: string; HTML: string }

/** E-mails enviados a `address`, do mais novo para o mais antigo. */
export async function emailsTo(address: string): Promise<Summary[]> {
  const query = encodeURIComponent(`to:"${address}"`)
  const res = await fetch(`${MAILPIT}/api/v1/search?query=${query}`)
  if (!res.ok) throw new Error(`Mailpit respondeu ${res.status}`)
  return (await res.json<{ messages: Summary[] }>()).messages
}

/** O e-mail mais recente enviado a `address`, esperando um pouco pela indexação do Mailpit. */
export async function lastEmailTo(address: string): Promise<ReceivedEmail> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const [latest] = await emailsTo(address)
    if (latest) {
      const res = await fetch(`${MAILPIT}/api/v1/message/${latest.ID}`)
      return res.json<ReceivedEmail>()
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`nenhum e-mail para ${address}`)
}

/** O link de ação do e-mail (o único no texto puro). */
export function linkIn(email: ReceivedEmail): URL {
  const match = email.Text.match(/https?:\/\/\S+/)
  if (!match) throw new Error(`e-mail sem link: ${email.Subject}`)
  return new URL(match[0])
}
