/** Quem recebe a doação: a chave PIX e o nome e a cidade que o app do banco mostra. */
export interface PixReceiver {
  readonly key: string
  readonly name: string
  readonly city: string
}

/** Campo EMV: id de 2 dígitos, tamanho do valor em 2 dígitos e o valor. */
function field(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, '0')}${value}`
}

/** O BR Code só aceita ASCII em nome e cidade, com tamanho máximo. */
function ascii(text: string, max: number) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\x20-\x7E]/g, '')
    .slice(0, max)
    .trim()
}

/** CRC16-CCITT (polinômio 0x1021, início 0xFFFF), o dígito verificador do BR Code. */
function crc16(payload: string) {
  let crc = 0xffff
  for (const char of payload) {
    crc ^= char.charCodeAt(0) << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/**
 * O "PIX copia e cola" estático da organização, que também vira o QR (BR-049). Sem valor: quem
 * doa escolhe quanto no app do banco. Segue o Manual de Padrões para Iniciação do Pix do Banco
 * Central (EMV, nome até 25 e cidade até 15 caracteres).
 */
export function pixBrCode({ key, name, city }: PixReceiver) {
  const payload =
    field('00', '01') +
    field('26', field('00', 'br.gov.bcb.pix') + field('01', key)) +
    field('52', '0000') +
    field('53', '986') +
    field('58', 'BR') +
    field('59', ascii(name, 25)) +
    field('60', ascii(city, 15)) +
    field('62', field('05', '***')) +
    '6304'
  return payload + crc16(payload)
}
