'use client'

import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { cn } from 'cn'

/** Lista de ações que abre a partir de um botão ("Mover para…"). Setas navegam, Esc fecha. */
const Menu = MenuPrimitive.Root
const MenuTrigger = MenuPrimitive.Trigger

function MenuContent({
  className,
  align = 'start',
  ...props
}: MenuPrimitive.Popup.Props & Pick<MenuPrimitive.Positioner.Props, 'align'>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner sideOffset={6} align={align} className="z-50">
        <MenuPrimitive.Popup
          data-slot="menu-content"
          className={cn(
            'min-w-(--anchor-width) rounded-xl bg-background p-1 text-foreground shadow-[0_0_0_1px_rgb(31_26_23/0.1),0_12px_32px_-12px_rgb(31_26_23/0.3)] outline-none',
            'origin-(--transform-origin) transition-[opacity,scale] duration-150 ease-out data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0',
            className,
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function MenuItem({ className, ...props }: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      className={cn(
        'flex h-10 cursor-default items-center gap-2 rounded-lg px-3 text-[0.9375rem] outline-none select-none data-disabled:opacity-50 data-highlighted:bg-muted [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
      {...props}
    />
  )
}

export { Menu, MenuContent, MenuItem, MenuTrigger }
