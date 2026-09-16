'use client'

import { buttonVariants } from '@acolhemais/ui/components/button'
import { cn } from '@acolhemais/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { authServices } from '@/services/auth'

/**
 * "Entrar" para quem está fora; "Painel" para quem já entrou. A sessão se confere no navegador
 * (mesma consulta do painel), então até ela chegar aparece "Entrar".
 */
export function AccountNavLink({ signIn, panel }: { signIn: string; panel: string }) {
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: () => authServices.session(),
  })

  return (
    <Link
      href={session ? '/painel' : '/entrar'}
      className={cn(buttonVariants({ variant: 'outline' }))}
    >
      {session ? panel : signIn}
    </Link>
  )
}
