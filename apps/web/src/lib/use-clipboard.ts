'use client'

import { useState } from 'react'

export type CopyState = 'idle' | 'copied' | 'failed'

/**
 * Copia um texto e diz por 3 segundos se deu certo. Sem permissão para a área de transferência
 * (ou fora de HTTPS) fica `failed`, e a tela diz à pessoa para copiar à mão.
 */
export function useClipboard() {
  const [state, setState] = useState<CopyState>('idle')

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
    } catch {
      setState('failed')
    }
    setTimeout(() => setState('idle'), 3000)
  }

  return { state, copy }
}
