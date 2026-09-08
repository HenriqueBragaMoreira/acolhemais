'use client'

import { Button } from '@acolhemais/ui/components/button'
import { FieldSeparator } from '@acolhemais/ui/components/field'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { AFTER_SIGN_IN_PAGE, authClient } from '@/lib/auth-client'
import { GoogleIcon } from './google-icon'

/**
 * Botão "Entrar com Google" e o divisor "ou". Dando certo, o navegador segue para o Google; se
 * a pessoa tiver 2FA, a API devolve para /entrar/2fa, e uma falha no caminho volta para
 * /entrar?erro=google.
 */
export function GoogleSignIn({ onError }: { onError: (message: string) => void }) {
  const t = useTranslations('SignIn')

  const { mutate, isPending, isSuccess } = useMutation({
    mutationKey: ['sign-in-google'],
    mutationFn: async () => {
      const origin = window.location.origin
      const response = await authClient.signIn.social({
        provider: 'google',
        callbackURL: new URL(AFTER_SIGN_IN_PAGE, origin).href,
        errorCallbackURL: new URL('/entrar?erro=google', origin).href,
      })
      if (response.error) throw response.error
    },
    onError: () => onError(t('googleFailed')),
  })

  // Depois de resolver, o navegador já está indo para o Google: o botão segue ocupado.
  const busy = isPending || isSuccess

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        disabled={busy}
        aria-busy={busy}
        onClick={() => mutate()}
      >
        {busy ? <Spinner /> : <GoogleIcon />}
        {t('google')}
      </Button>
      <FieldSeparator className="my-5">{t('or')}</FieldSeparator>
    </>
  )
}
