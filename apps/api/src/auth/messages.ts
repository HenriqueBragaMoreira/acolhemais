import { pt } from '@better-auth/i18n/locales'

/**
 * Mensagens de erro do Better Auth em português, por código de erro. O pacote de i18n traduz só
 * os erros do núcleo: os códigos dos plugins que usamos são traduzidos aqui. O frontend deve
 * decidir pelo `code`, não pelo texto.
 */
export const authMessages = {
  ...pt,
  TOO_MANY_REQUESTS: 'Muitas requisições. Aguarde um pouco e tente novamente.',
  LOGIN_TEMPORARILY_LOCKED: 'Muitas tentativas com senha errada. Tente novamente mais tarde.',
  PASSWORD_COMPROMISED:
    'Esta senha apareceu em vazamentos de dados de outros sites. Escolha uma senha diferente.',

  // Plugin twoFactor (só TOTP e códigos de recuperação; o código por e-mail não é usado)
  TOTP_NOT_ENABLED: 'A verificação em duas etapas por aplicativo não está ativada.',
  TOTP_ALREADY_ENABLED: 'A verificação em duas etapas por aplicativo já está ativada.',
  TOTP_NOT_CONFIGURED: 'A verificação em duas etapas por aplicativo não está disponível.',
  TWO_FACTOR_NOT_ENABLED: 'A verificação em duas etapas não está ativada.',
  BACKUP_CODES_NOT_ENABLED: 'Os códigos de recuperação não estão ativados.',
  INVALID_BACKUP_CODE: 'Código de recuperação inválido.',
  INVALID_CODE: 'Código inválido.',
  ACCOUNT_TEMPORARILY_LOCKED:
    'Muitas tentativas com código errado. A conta foi bloqueada temporariamente. Tente novamente mais tarde.',
  INVALID_TWO_FACTOR_COOKIE: 'A verificação expirou. Entre novamente.',
}
