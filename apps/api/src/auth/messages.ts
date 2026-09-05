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

  // Plugin admin (equipe da plataforma)
  TWO_FACTOR_REQUIRED: 'Ative a verificação em duas etapas para acessar esta área.',
  YOU_CANNOT_BAN_YOURSELF: 'Você não pode suspender a própria conta.',
  YOU_ARE_NOT_ALLOWED_TO_CHANGE_USERS_ROLE: 'Você não tem permissão para mudar papéis.',
  YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS: 'Você não tem permissão para criar usuários.',
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS: 'Você não tem permissão para listar usuários.',
  YOU_ARE_NOT_ALLOWED_TO_LIST_USERS_SESSIONS:
    'Você não tem permissão para ver sessões de usuários.',
  YOU_ARE_NOT_ALLOWED_TO_BAN_USERS: 'Você não tem permissão para suspender usuários.',
  YOU_ARE_NOT_ALLOWED_TO_IMPERSONATE_USERS: 'Ninguém pode entrar como outro usuário.',
  YOU_ARE_NOT_ALLOWED_TO_REVOKE_USERS_SESSIONS:
    'Você não tem permissão para encerrar sessões de usuários.',
  YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS: 'Você não tem permissão para excluir usuários.',
  YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PASSWORD: 'Ninguém pode definir a senha de outro usuário.',
  YOU_ARE_NOT_ALLOWED_TO_SET_USERS_EMAIL: 'Ninguém pode mudar o e-mail de outro usuário.',
  BANNED_USER: 'Esta conta está suspensa.',
  YOU_ARE_NOT_ALLOWED_TO_GET_USER: 'Você não tem permissão para ver este usuário.',
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_USERS: 'Você não tem permissão para alterar usuários.',
  YOU_CANNOT_REMOVE_YOURSELF: 'Você não pode excluir a própria conta por aqui.',
  YOU_ARE_NOT_ALLOWED_TO_SET_NON_EXISTENT_VALUE: 'Papel inexistente.',
  INVALID_ROLE_TYPE: 'Papel inválido.',
}
