const MINUTE = 60 * 1000

/**
 * Bloqueio progressivo de login por senha: a partir de 5 senhas erradas seguidas no mesmo
 * e-mail, cada nova tentativa errada bloqueia o login por um tempo que cresce com o total.
 * Complementa o rate limit por IP, que não segura um ataque distribuído contra uma só conta.
 *
 * O bloqueio vale também para e-mails sem conta, para não revelar quais e-mails estão
 * cadastrados. Como qualquer um pode provocar o bloqueio de uma conta alheia, ele é curto e
 * temporário.
 */
export const LOGIN_LOCKOUT_TIERS = [
  { failures: 15, lockMs: 60 * MINUTE },
  { failures: 10, lockMs: 15 * MINUTE },
  { failures: 5, lockMs: 1 * MINUTE },
] as const

/** Sem errar a senha por este tempo, a contagem de erros recomeça do zero. */
export const LOGIN_FAILURE_WINDOW_MS = 24 * 60 * MINUTE

/** Por quanto tempo bloquear depois de `consecutiveFailures` senhas erradas (0 = não bloqueia). */
export function loginLockoutMs(consecutiveFailures: number): number {
  return LOGIN_LOCKOUT_TIERS.find((tier) => consecutiveFailures >= tier.failures)?.lockMs ?? 0
}
