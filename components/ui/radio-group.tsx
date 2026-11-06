"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"

import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

/**
 * Grounded against the ❖ Radio component frame: 16x16 round control, neutral
 * border by default, brand-green hover/checked border with an 8px dot, red for
 * error, grey fill + grey dot when disabled. Label is 14/20 light, optional
 * 12/16 description beneath it.
 */
function RadioGroupItem({
  className,
  label,
  description,
  error,
  id,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  label?: string
  description?: string
  error?: boolean
}) {
  const autoId = React.useId()
  const itemId = id ?? autoId

  const radio = (
    <RadioGroupPrimitive.Item
      id={itemId}
      data-slot="radio-group-item"
      aria-invalid={error || undefined}
      className={cn(
        "peer flex size-4 shrink-0 items-center justify-center rounded-full border border-vt-control-border bg-vt-surface outline-none transition-colors",
        "hover:border-vt-primary-2",
        "data-[state=checked]:border-vt-primary-2",
        "focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:bg-vt-control-disabled-bg disabled:hover:border-vt-control-border disabled:data-[state=checked]:border-vt-control-border",
        error && "border-vt-error hover:border-vt-error data-[state=checked]:border-vt-error",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        className={cn(
          "size-2 rounded-full bg-vt-primary-2",
          error && "bg-vt-error",
          "peer-disabled:bg-vt-control-border",
        )}
      />
    </RadioGroupPrimitive.Item>
  )

  if (!label) return radio

  return (
    <div className="flex items-start gap-2 py-2">
      <span className="flex h-5 items-center">{radio}</span>
      <label
        htmlFor={itemId}
        className="flex cursor-pointer flex-col gap-1 has-[~*]:cursor-pointer peer-disabled:cursor-not-allowed"
      >
        <span className="font-sans text-sm leading-5 font-light text-vt-dark-text">{label}</span>
        {description ? (
          <span className="font-sans text-xs leading-4 font-light text-vt-grey-text">{description}</span>
        ) : null}
      </label>
    </div>
  )
}

export { RadioGroup, RadioGroupItem }
