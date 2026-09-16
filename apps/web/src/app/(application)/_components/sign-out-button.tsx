'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogOutIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

/** "Sair" do cabeçalho: encerra a sessão, limpa o cache e volta para o login. */
export function SignOutButton() {
  const t = useTranslations('AppHeader')
  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationKey: ['sign-out'],
    mutationFn: async () => {
      const response = await authClient.signOut()
      if (response.error) throw response.error
    },
    onSuccess: () => {
      // Nada do que estava em cache sobre a conta pode sobrar para a próxima pessoa.
      queryClient.clear()
      router.replace('/entrar')
    },
  })

  return (
    <Button
      variant="secondary"
      disabled={isPending}
      aria-busy={isPending}
      className="focus-visible:outline-white lg:order-3"
      onClick={() => mutate()}
    >
      {isPending ? <Spinner /> : <LogOutIcon aria-hidden />}
      {isPending ? t('signingOut') : t('signOut')}
    </Button>
  )
}
