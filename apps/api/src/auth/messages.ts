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
  // O login recusado por falta de verificação reenvia o link (BR-007).
  EMAIL_NOT_VERIFIED:
    'Confirme seu e-mail para entrar. Enviamos um novo link de confirmação para a sua caixa de entrada.',
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
  YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS:
    'Contas não são excluídas. Para afastar alguém, suspenda a conta.',
  YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PASSWORD: 'Ninguém pode definir a senha de outro usuário.',
  YOU_ARE_NOT_ALLOWED_TO_SET_USERS_EMAIL: 'Ninguém pode mudar o e-mail de outro usuário.',
  BANNED_USER: 'Esta conta está suspensa.',
  YOU_ARE_NOT_ALLOWED_TO_GET_USER: 'Você não tem permissão para ver este usuário.',
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_USERS: 'Você não tem permissão para alterar usuários.',
  YOU_CANNOT_REMOVE_YOURSELF: 'Você não pode excluir a própria conta por aqui.',
  YOU_ARE_NOT_ALLOWED_TO_SET_NON_EXISTENT_VALUE: 'Papel inexistente.',
  INVALID_ROLE_TYPE: 'Papel inválido.',

  // Plugin organization (times desligados: os erros de times ficam de fora)
  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION:
    'Organizações nascem da aprovação da inscrição pela equipe do Acolhe+.',
  YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS: 'Limite de organizações atingido.',
  ORGANIZATION_ALREADY_EXISTS: 'Esta organização já existe.',
  ORGANIZATION_SLUG_ALREADY_TAKEN: 'Este endereço já está em uso por outra organização.',
  ORGANIZATION_NOT_FOUND: 'Organização não encontrada.',
  USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION: 'Esta pessoa não faz parte da equipe da organização.',
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION:
    'Você não tem permissão para alterar os dados da organização.',
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION:
    'Organizações não são excluídas. Para encerrar, fale com a equipe do Acolhe+.',
  NO_ACTIVE_ORGANIZATION: 'Escolha uma organização para continuar.',
  USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: 'Esta pessoa já faz parte da equipe.',
  MEMBER_NOT_FOUND: 'Membro da equipe não encontrado.',
  ROLE_NOT_FOUND: 'Papel não encontrado.',
  YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER:
    'Você é a única pessoa Responsável. Defina outro Responsável antes de sair.',
  YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER:
    'A organização precisa de ao menos uma pessoa Responsável.',
  YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER:
    'Você não tem permissão para remover esta pessoa da equipe.',
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION:
    'Você não tem permissão para convidar pessoas para a equipe.',
  USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: 'Esta pessoa já tem um convite pendente.',
  INVITATION_NOT_FOUND: 'Convite não encontrado.',
  YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION: 'Este convite foi enviado para outro e-mail.',
  EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION:
    'Confirme seu e-mail antes de responder ao convite.',
  EMAIL_VERIFICATION_REQUIRED_FOR_INVITATION: 'Confirme seu e-mail para ver seus convites.',
  YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION:
    'Você não tem permissão para cancelar este convite.',
  INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION:
    'Quem enviou o convite não faz mais parte da equipe.',
  YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE:
    'Você não tem permissão para convidar alguém com este papel.',
  FAILED_TO_RETRIEVE_INVITATION: 'Não foi possível carregar o convite.',
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER:
    'Você não tem permissão para mudar o papel desta pessoa.',
  ORGANIZATION_MEMBERSHIP_LIMIT_REACHED: 'A equipe atingiu o limite de membros.',
  INVITATION_LIMIT_REACHED: 'A organização atingiu o limite de convites.',
  YOU_ARE_NOT_ALLOWED_TO_ACCESS_THIS_ORGANIZATION:
    'Você não tem permissão para acessar esta organização.',
  YOU_ARE_NOT_A_MEMBER_OF_THIS_ORGANIZATION: 'Você não faz parte da equipe desta organização.',
  MISSING_AC_INSTANCE: 'Papéis próprios indisponíveis no momento.',
  YOU_MUST_BE_IN_AN_ORGANIZATION_TO_CREATE_A_ROLE: 'Escolha uma organização para criar um papel.',
  YOU_ARE_NOT_ALLOWED_TO_CREATE_A_ROLE: 'Você não tem permissão para criar papéis.',
  YOU_ARE_NOT_ALLOWED_TO_UPDATE_A_ROLE: 'Você não tem permissão para alterar papéis.',
  YOU_ARE_NOT_ALLOWED_TO_DELETE_A_ROLE: 'Você não tem permissão para excluir papéis.',
  YOU_ARE_NOT_ALLOWED_TO_READ_A_ROLE: 'Você não tem permissão para ver papéis.',
  YOU_ARE_NOT_ALLOWED_TO_LIST_A_ROLE: 'Você não tem permissão para ver papéis.',
  YOU_ARE_NOT_ALLOWED_TO_GET_A_ROLE: 'Você não tem permissão para ver papéis.',
  TOO_MANY_ROLES: 'A organização atingiu o limite de papéis.',
  INVALID_RESOURCE: 'O papel inclui uma permissão que não existe.',
  ROLE_NAME_IS_ALREADY_TAKEN: 'Já existe um papel com este nome.',
  CANNOT_DELETE_A_PRE_DEFINED_ROLE: 'Os papéis padrão não podem ser excluídos.',
  ROLE_IS_ASSIGNED_TO_MEMBERS:
    'Há pessoas da equipe com este papel. Troque o papel delas antes de excluí-lo.',

  // Travas da equipe da organização (plugin organizationGuards)
  TEAM_MANAGE_REQUIRED: 'Você não tem permissão para gerenciar a equipe.',
  CANNOT_ASSIGN_UNOWNED_PERMISSION:
    'Você só pode convidar, mudar o papel ou remover alguém com permissões que você também tem.',

  // Travas da equipe da plataforma (plugin platformGuards)
  USER_FIELD_NOT_EDITABLE: 'Na conta de outra pessoa, só é possível corrigir o nome e a foto.',
  CREATE_USER_FIELD_NOT_ALLOWED:
    'Informe só nome, e-mail e, se for da equipe, o papel. A pessoa cria a senha pelo e-mail de primeiro acesso.',
  ROLE_NOT_ASSIGNABLE: 'Pela API só é possível dar os papéis de moderador e suporte.',
  SUPERADMIN_CLI_ONLY:
    'O papel de superadmin só muda pela linha de comando. Para suspender um superadmin, retire o papel antes.',
  OWNER_REQUIRED:
    'Esta pessoa é a única Responsável de uma organização. Defina outro Responsável antes.',
}
