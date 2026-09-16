import { wait } from '@/utils/wait'
import { DEMO_ORGANIZATIONS } from './demo-data'
import type { OrganizationProfile } from './types'

// shortcut: lê os dados fictícios (demo-data.ts) até existir a rota da API.
export const organizationsServices = {
  /** A organização pelo slug atual ou por um antigo; `null` se não existe ou está suspensa. */
  async get(slug: string): Promise<OrganizationProfile | null> {
    await wait(150)
    const organizations: OrganizationProfile[] = Object.values(DEMO_ORGANIZATIONS)
    const found = organizations.find(
      (organization) => organization.slug === slug || organization.previousSlugs.includes(slug),
    )
    return found && found.status !== 'suspended' ? found : null
  },
}
