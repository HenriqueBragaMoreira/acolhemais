import * as React from 'react'
import { cn } from 'cn'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-base transition-colors placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:border-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)]',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
