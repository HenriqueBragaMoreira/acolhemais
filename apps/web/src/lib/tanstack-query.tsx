import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClientProvider as Provider,
  QueryClient,
} from '@tanstack/react-query'
import type { ReactNode } from 'react'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        // Login e afins não podem ser repetidos sozinhos (contam no bloqueio por senha errada).
        retry: false,
      },
      dehydrate: {
        // Também leva ao cliente as consultas ainda em andamento no servidor (streaming).
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

/**
 * No servidor, um QueryClient novo a cada requisição (nada vaza entre usuários); no
 * navegador, um só durante toda a sessão.
 */
export function getQueryClient() {
  if (isServer) return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

export function QueryClientProvider({ children }: { children: ReactNode }) {
  return <Provider client={getQueryClient()}>{children}</Provider>
}
