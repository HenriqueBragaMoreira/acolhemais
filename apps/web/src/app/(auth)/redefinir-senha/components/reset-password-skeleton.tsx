/** Lugar da descrição e do formulário enquanto a página lê o token do link (mesma altura). */
export function ResetPasswordSkeleton() {
  return (
    <div aria-hidden>
      <div className="mt-2 flex flex-col gap-2">
        <div className="h-4 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="h-3.5 w-24 rounded bg-muted" />
          <div className="h-11 rounded-lg bg-muted" />
          <div className="min-h-10" />
        </div>
        <div className="h-12 rounded-lg bg-muted" />
      </div>
    </div>
  )
}
