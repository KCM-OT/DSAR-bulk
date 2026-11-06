"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

/**
 * Grounded against the ❖ Toggle frame: a 40x20 pill. Off is neutral grey with
 * the knob on the left and a check/x glyph on the opposite side; on is brand
 * green. Disabled lightens the track, and `loading` swaps the knob for a
 * spinner while keeping the current value visible. Label is 14/20 light with
 * an optional 12/16 caption.
 */
function Switch({
  className,
  label,
  description,
  loading,
  id,
  disabled,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  label?: string
  description?: string
  loading?: boolean
}) {
  const autoId = React.useId()
  const switchId = id ?? autoId

  const control = (
    <SwitchPrimitive.Root
      id={switchId}
      data-slot="switch"
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        "peer relative inline-flex h-5 w-10 shrink-0 items-center rounded-full border border-transparent bg-vt-grey-text outline-none transition-colors",
        "data-[state=checked]:bg-vt-primary-2",
        "focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed",
        disabled && "bg-vt-border data-[state=checked]:bg-vt-border",
        className,
      )}
      {...props}
    >
      <Icon
        name="check"
        variant="filled"
        size={12}
        aria-hidden
        className="absolute left-1.5 text-vt-light-text opacity-0 transition-opacity [[data-state=checked]>&]:opacity-100"
      />
      <Icon
        name="xmark"
        variant="filled"
        size={12}
        aria-hidden
        className="absolute right-1.5 text-vt-light-text opacity-100 transition-opacity [[data-state=checked]>&]:opacity-0"
      />
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none z-10 flex size-4 translate-x-0.5 items-center justify-center rounded-full bg-vt-surface transition-transform",
          "data-[state=checked]:translate-x-5.5",
        )}
      >
        {loading ? (
          <span
            aria-hidden
            className="size-3 animate-spin rounded-full border-2 border-vt-primary-2 border-t-transparent"
          />
        ) : null}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )

  if (!label) return control

  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={switchId} className="flex cursor-pointer flex-col gap-1 peer-disabled:cursor-not-allowed">
        <span className="font-sans text-sm leading-5 font-light text-vt-dark-text">{label}</span>
        {description ? (
          <span className="font-sans text-xs leading-4 font-light text-vt-grey-text">{description}</span>
        ) : null}
      </label>
      {control}
    </div>
  )
}

export { Switch }
