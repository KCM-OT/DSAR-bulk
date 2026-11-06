'use client'

import * as React from 'react'
import * as MenuPrimitive from '@radix-ui/react-dropdown-menu'

import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Menu item": 8px padding (16px horizontally when the item
 * sits in a group), 16/24 light label with an optional 12/16 #4d4d4d
 * description, #e8f1f6 hover/highlight, 2px #167cbb focus outline, and a
 * #eeeeee fill with #898989 text when disabled.
 */
const DropdownMenu = MenuPrimitive.Root
const DropdownMenuTrigger = MenuPrimitive.Trigger
const DropdownMenuGroup = MenuPrimitive.Group

function DropdownMenuContent({
  className,
  sideOffset = 4,
  align = 'end',
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-50 min-w-56 overflow-hidden rounded border border-vt-border bg-vt-surface shadow-e3',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuItem({
  className,
  description,
  inGroup,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item> & { description?: string; inGroup?: boolean }) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        'flex cursor-pointer flex-col gap-0.5 bg-vt-surface py-2 font-sans text-base leading-6 font-light text-vt-dark-text outline-none',
        inGroup ? 'px-4' : 'px-2',
        'data-[highlighted]:bg-vt-information-light',
        'focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-inset',
        'data-[disabled]:pointer-events-none data-[disabled]:bg-[#eeeeee] data-[disabled]:text-[#898989]',
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {description && <span className="text-xs leading-4 text-vt-grey-text">{description}</span>}
    </MenuPrimitive.Item>
  )
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Label>) {
  return (
    <MenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn('px-4 py-2 font-heading text-sm leading-5 font-medium text-vt-grey-text', className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return <MenuPrimitive.Separator className={cn('h-px bg-vt-border', className)} {...props} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
