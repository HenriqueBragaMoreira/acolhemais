import { api } from '@/lib/api'

export const authServices = {
  /** Formas de login ligadas na API (o Google é opcional por instalação). */
  async providers() {
    const response = await api.auth.providers.$get()
    if (!response.ok) throw new Error(`GET /auth/providers respondeu ${response.status}`)

    return response.json()
  },
}
