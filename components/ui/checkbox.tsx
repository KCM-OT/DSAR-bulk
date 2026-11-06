"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Minus } from "lucide-react"

import { Icon } from '@/components/ui/icon'

import { cn } from "@/lib/utils"

/**
 * Grounded against the ❖ Checkbox component frame: 16x16 box, 4px radius,
 * neutral border by default, brand green hover/checked/indeterminate fill,
 * error turns the border red, disabled fills light grey.
 */
function Checkbox({
  className,
  label,
  description,
  error,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  label?: string
  description?: string
  error?: boolean
}) {
  const checkbox = (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      aria-invalid={error || undefined}
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-vt-control-border bg-vt-surface outline-none transition-colors",
        "hover:border-vt-primary-2",
        "data-[state=checked]:border-vt-primary-2 data-[state=checked]:bg-vt-primary-2",
        "data-[state=indeterminate]:border-vt-primary-2 data-[state=indeterminate]:bg-vt-primary-2",
        "focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:border-vt-control-border disabled:bg-vt-control-disabled-bg disabled:data-[state=checked]:bg-vt-control-disabled-bg disabled:data-[state=indeterminate]:bg-vt-control-disabled-bg",
        error && "border-vt-error hover:border-vt-error",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-vt-light-text">
        {props.checked === "indeterminate" ? (
          <Minus className="size-2.5" strokeWidth={3} />
        ) : (
          <Icon name="check" variant="filled" size={12} aria-hidden />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (!label) return checkbox

  return (
    <label className="flex cursor-pointer items-start gap-2 has-disabled:cursor-not-allowed">
      <span className="flex h-5 items-center">{checkbox}</span>
      <span className="flex flex-col gap-1">
        <span className="font-sans text-sm leading-5 font-light text-vt-dark-text peer-disabled:opacity-60">
          {label}
        </span>
        {description ? (
          <span className="font-sans text-xs leading-4 font-light text-vt-grey-text">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}

export { Checkbox }
