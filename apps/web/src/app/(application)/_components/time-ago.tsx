'use client'

import { useFormatter, useNow } from 'next-intl'

/** "há 2 dias", com a data inteira no `title` e no `dateTime`. */
export function TimeAgo({ value }: { value: string }) {
  const format = useFormatter()
  const now = useNow({ updateInterval: 60_000 })
  const date = new Date(value)
  return (
    <time dateTime={value} title={format.dateTime(date, { dateStyle: 'long', timeStyle: 'short' })}>
      {format.relativeTime(date, now)}
    </time>
  )
}
