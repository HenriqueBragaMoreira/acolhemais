import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PanelHome } from './components/panel-home'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Panel')
  return { title: t('metaTitle') }
}

export default function PanelPage() {
  return <PanelHome />
}
