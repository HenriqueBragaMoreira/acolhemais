import type { ReactNode } from 'react'

/** Um grupo da vitrine: título, para que serve e os exemplos. */
export function ShowcaseSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id} className="border-t border-border py-10 first:border-t-0">
      <h3 id={id} className="text-xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mt-1 max-w-prose text-muted-foreground">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  )
}
