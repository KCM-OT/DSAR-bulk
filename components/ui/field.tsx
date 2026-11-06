import * as React from "react"
import { Icon } from '@/components/ui/icon'

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

/**
 * Composes label + control + helper/error text per the ❖ Input field
 * contract: label (caption, required asterisk in error red), the control
 * itself, then either helper text or an error row with a small icon.
 */
function Field({
  label,
  required,
  helperText,
  errorText,
  htmlFor,
  className,
  children,
}: {
  label?: string
  required?: boolean
  helperText?: string
  errorText?: string
  htmlFor?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div data-slot="field" className={cn("flex w-full flex-col gap-1", className)}>
      {label ? (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      ) : null}
      {children}
      {errorText ? (
        <div className="flex items-center gap-1 text-xs leading-4 font-light text-vt-error">
          <Icon name="circle-exclamation" variant="filled" size={12} aria-hidden />
          <span>{errorText}</span>
        </div>
      ) : helperText ? (
        <p className="text-xs leading-4 font-light text-vt-grey-text">{helperText}</p>
      ) : null}
    </div>
  )
}

export { Field }
