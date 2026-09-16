'use client'

import type { AnswerRow } from '../hooks/use-adopter-answers'

/** Uma parte das respostas: rótulo em texto de apoio, valor em 500, linhas de areia. */
export function AnswerList({ rows }: { rows: AnswerRow[] }) {
  return (
    <dl className="divide-y divide-border">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid gap-1 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6"
        >
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="font-medium text-pretty">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
