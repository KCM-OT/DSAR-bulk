'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Select field": 32px trigger, 1px #767676 border, radius
 * 4, 16/24 light value with a #767676 placeholder and a trailing chevron;
 * error turns the border #b30000. The listbox reuses the Menu item styling
 * (#e8f1f6 highlight, #eeeeee disabled).
 */
const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

function SelectTrigger({
  className,
  error,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & { error?: boolean }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      aria-invalid={error || undefined}
      className={cn(
        'flex h-8 w-full items-center justify-between gap-1 rounded border bg-vt-surface px-2 py-1 text-left font-sans text-base leading-6 font-light text-vt-dark-text outline-none transition-colors',
        'border-vt-control-border hover:border-vt-primary-2',
        'data-[placeholder]:text-vt-control-border',
        'focus-visible:border-vt-focus-ring focus-visible:ring-1 focus-visible:ring-vt-focus-ring',
        'data-[disabled]:cursor-not-allowed data-[disabled]:bg-vt-control-disabled-bg data-[disabled]:text-vt-grey-text data-[disabled]:hover:border-vt-control-border',
        error && 'border-vt-error hover:border-vt-error',
        className,
      )}
      {...props}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <SelectPrimitive.Icon asChild>
        <Icon name="chevron-down" aria-hidden className="text-vt-dark-text" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={4}
        className={cn(
          'z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded border border-vt-border bg-vt-surface shadow-e3',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectItem({
  className,
  children,
  description,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item> & { description?: string }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex cursor-pointer flex-col gap-0.5 bg-vt-surface py-2 pr-8 pl-2 font-sans text-base leading-6 font-light text-vt-dark-text outline-none',
        'data-[highlighted]:bg-vt-information-light',
        'data-[disabled]:pointer-events-none data-[disabled]:bg-[#eeeeee] data-[disabled]:text-[#898989]',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      {description && <span className="text-xs leading-4 text-vt-grey-text">{description}</span>}
      <SelectPrimitive.ItemIndicator className="absolute top-3 right-2">
        <Icon name="check" aria-hidden />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn('px-2 py-2 font-heading text-sm leading-5 font-medium text-vt-grey-text', className)}
      {...props}
    />
  )
}

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem, SelectLabel }
