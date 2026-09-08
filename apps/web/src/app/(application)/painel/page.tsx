import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AccountSummary } from './components/account-summary'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Panel')
  return { title: t('metaTitle') }
}

export default function PanelPage() {
  return <AccountSummary />
}
