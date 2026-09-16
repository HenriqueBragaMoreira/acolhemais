import { api } from '@/lib/api'
import { authClient } from '@/lib/auth-client'

export const authServices = {
  /** Formas de login ligadas na API (o Google é opcional por instalação). */
  async providers() {
    const response = await api.auth.providers.$get()
    if (!response.ok) throw new Error(`GET /auth/providers respondeu ${response.status}`)

    return response.json()
  },

  /** A sessão de quem entrou (Better Auth); `null` sem sessão. Usar com `queryKey: ['session']`. */
  async session() {
    const response = await authClient.getSession()
    if (response.error) throw response.error

    return response.data
  },
}
