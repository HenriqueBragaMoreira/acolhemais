import { pixBrCode } from '@acolhemais/domain'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import QRCode from 'qrcode'
import type { OrganizationProfile } from '@/services/organizations/types'
import { CopyPixKey } from './copy-pix-key'

type PixDonationProps = {
  organization: Pick<OrganizationProfile, 'name' | 'city'> & {
    pix: NonNullable<OrganizationProfile['pix']>
  }
}

/**
 * Doação por PIX direto para a organização (BR-049): o QR do "copia e cola" para quem está no
 * computador e a chave com "Copiar chave" para quem está no celular.
 */
export async function PixDonation({ organization: { name, city, pix } }: PixDonationProps) {
  const t = await getTranslations('Organization.pix')
  // A cidade do BR Code vai sem o estado ("Campinas, SP" vira "Campinas").
  const [cityName = city] = city.split(',')
  const svg = await QRCode.toString(pixBrCode({ key: pix.key, name, city: cityName }), {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
  })

  return (
    <section
      aria-labelledby="doar"
      className="flex flex-col rounded-3xl bg-background p-6 text-foreground shadow-[0_18px_40px_-16px_rgb(59_38_24/0.35)] sm:p-7"
    >
      <h2 id="doar" className="text-xl font-bold tracking-tight">
        {t('title')}
      </h2>
      <p className="mt-1 text-sm text-pretty text-muted-foreground">{t('description')}</p>

      <div className="mt-5 flex items-center gap-5">
        {/* No celular o QR some: ninguém lê o QR na própria tela. */}
        <Image
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
          alt={t('qrAlt', { name })}
          width={128}
          height={128}
          unoptimized
          className="hidden size-32 shrink-0 md:block"
        />
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{t('keyLabel', { type: pix.type })}</p>
          {/* A chave quebra depois de "@", "." e "-", não no meio de uma palavra. */}
          <p className="mt-0.5 font-semibold [overflow-wrap:anywhere]">
            {pix.key.split(/(?<=[@.-])/).map((part, index) => (
              <span key={index}>
                {part}
                <wbr />
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* Com os painéis da mesma altura, o botão fica no pé, alinhado ao dos contatos. */}
      <div className="mt-auto pt-5">
        <CopyPixKey pixKey={pix.key} />
      </div>
    </section>
  )
}
