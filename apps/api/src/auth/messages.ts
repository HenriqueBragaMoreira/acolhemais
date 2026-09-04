import { pt } from '@better-auth/i18n/locales'

/**
 * Mensagens de erro do Better Auth em português, por código de erro. O pacote de i18n traduz só
 * os erros do núcleo: os códigos dos plugins que usamos são traduzidos aqui. O frontend deve
 * decidir pelo `code`, não pelo texto.
 */
export const authMessages = {
  ...pt,
  PASSWORD_COMPROMISED:
    'Esta senha apareceu em vazamentos de dados de outros sites. Escolha uma senha diferente.',
}
