import { cpfDigits } from '@acolhemais/domain'
import { MAX_ACTIVE_APPLICATIONS } from '@/constants/application'
import { wait } from '@/utils/wait'
import { DEMO_ACCOUNT_PROFILE, DEMO_ACTIVE_APPLICATIONS } from './demo-data'
import type { AdopterProfile, ApplicationBlock } from './types'

// shortcut: tudo fictício até existir a API: qualquer código de 6 dígitos vale, qualquer
// e-mail e senha entram na conta de exemplo e nada é gravado.
export const applicationsServices = {
  /** Manda o código de verificação para o e-mail (FR-042). */
  async sendCode(_email: string) {
    await wait(500)
  },

  /** Confere o código; `false` se ele está errado. */
  async verifyCode(_email: string, code: string) {
    await wait(400)
    return /^\d{6}$/.test(code)
  },

  /** Entra na conta e devolve o perfil salvo nela (FR-041). */
  async signIn(_email: string, _password: string): Promise<AdopterProfile> {
    await wait(600)
    return DEMO_ACCOUNT_PROFILE
  },

  /** Se este CPF pode se candidatar a este animal agora. */
  async check(cpf: string, animalId: string): Promise<ApplicationBlock | null> {
    await wait(300)
    const active = DEMO_ACTIVE_APPLICATIONS[cpfDigits(cpf)] ?? []
    if (active.includes(animalId)) return 'duplicate'
    if (active.length >= MAX_ACTIVE_APPLICATIONS) return 'limit'
    return null
  },

  /** Envia a candidatura: perfil, respostas da organização e o animal. */
  async submit(_application: {
    animalId: string
    email: string
    profile: AdopterProfile
    answers: Record<string, string>
  }) {
    await wait(800)
  },
}
