'use client'

import { Button } from '@acolhemais/ui/components/button'
import { Spinner } from '@acolhemais/ui/components/spinner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogOutIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Wordmark } from '@/components/wordmark'
import { authClient } from '@/lib/auth-client'

/** Faixa do topo da área logada, no marrom da moldura de acesso, com a marca e a saída. */
export function AppHeader() {
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
    <header className="bg-shell text-white">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          aria-label={t('home')}
          className="rounded-md text-xl focus-visible:outline-white"
        >
          <Wordmark onDark />
        </Link>
        <Button
          variant="secondary"
          disabled={isPending}
          aria-busy={isPending}
          className="focus-visible:outline-white"
          onClick={() => mutate()}
        >
          {isPending ? <Spinner /> : <LogOutIcon aria-hidden />}
          {isPending ? t('signingOut') : t('signOut')}
        </Button>
      </div>
    </header>
  )
}
