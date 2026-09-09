const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Decode(text: string): Uint8Array<ArrayBuffer> {
  const bytes: number[] = []
  let buffer = 0
  let bits = 0
  for (const char of text.replaceAll('=', '').toUpperCase()) {
    buffer = (buffer << 5) | BASE32.indexOf(char)
    bits += 5
    if (bits >= 8) {
      bits -= 8
      bytes.push((buffer >> bits) & 0xff)
    }
  }
  return new Uint8Array(bytes)
}

/**
 * Gera o código TOTP (RFC 6238) a partir da URI `otpauth://`, como um app autenticador faria.
 * `stepOffset` gera o código de um período vizinho (o servidor aceita ±1).
 */
export async function totpCode(totpURI: string, stepOffset = 0): Promise<string> {
  const params = new URL(totpURI).searchParams
  const digits = Number(params.get('digits') ?? 6)
  const period = Number(params.get('period') ?? 30)
  const key = await crypto.subtle.importKey(
    'raw',
    base32Decode(params.get('secret') ?? ''),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  )

  const counter = new DataView(new ArrayBuffer(8))
  counter.setBigUint64(0, BigInt(Math.floor(Date.now() / 1000 / period) + stepOffset))
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, counter.buffer))

  const offset = (mac.at(-1) ?? 0) & 0x0f
  const binary = new DataView(mac.buffer).getUint32(offset) & 0x7fffffff
  return String(binary % 10 ** digits).padStart(digits, '0')
}
