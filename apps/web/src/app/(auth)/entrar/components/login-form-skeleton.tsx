/** Lugar do formulário enquanto o servidor confere as formas de login (mesma altura). */
export function LoginFormSkeleton() {
  return (
    <div aria-hidden className="mt-8 flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="h-3.5 w-16 rounded bg-muted" />
        <div className="h-11 rounded-lg bg-muted" />
        <div className="min-h-5" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-3.5 w-16 rounded bg-muted" />
        <div className="h-11 rounded-lg bg-muted" />
        <div className="min-h-10" />
      </div>
      <div className="h-12 rounded-lg bg-muted" />
    </div>
  )
}
