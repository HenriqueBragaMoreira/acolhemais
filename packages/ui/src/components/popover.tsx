'use client'

import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { cn } from 'cn'

/**
 * Janelinha presa a um botão, para explicar algo curto (o que um selo quer dizer). Abre no
 * clique ou no toque, e no teclado: ao contrário do tooltip, funciona no celular.
 */
const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

function PopoverContent({
  className,
  align = 'start',
  ...props
}: PopoverPrimitive.Popup.Props & Pick<PopoverPrimitive.Positioner.Props, 'align'>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        sideOffset={8}
        align={align}
        collisionPadding={16}
        className="z-50"
      >
        <PopoverPrimitive.Popup
          className={cn(
            'w-[min(20rem,calc(100vw-2rem))] rounded-xl bg-background p-4 text-sm text-foreground shadow-[0_0_0_1px_rgb(31_26_23/0.1),0_12px_32px_-12px_rgb(31_26_23/0.3)] outline-none',
            'origin-(--transform-origin) transition-[opacity,scale] duration-150 ease-out data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0',
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return <PopoverPrimitive.Title className={cn('font-semibold', className)} {...props} />
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      className={cn('mt-1 text-pretty text-muted-foreground', className)}
      {...props}
    />
  )
}

export { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger }
