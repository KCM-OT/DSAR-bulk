import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Grounded against the ❖ Input component frame in the Vitreus UI Kit:
 * default border is neutral grey, hover/focus pick up brand green and the
 * blue focus ring, error state turns red, disabled fills light grey, and the
 * `ai-modified` state (AI-authored or AI-assisted field values) uses the
 * dedicated purple token so AI output is visually distinguishable from
 * user-entered data.
 */
function Input({
  className,
  type,
  error,
  aiModified,
  ...props
}: React.ComponentProps<"input"> & { error?: boolean; aiModified?: boolean }) {
  return (
    <input
      type={type}
      data-slot="input"
      aria-invalid={error || undefined}
      className={cn(
        "flex h-8 w-full min-w-0 rounded-[4px] border bg-vt-surface px-2 py-1 font-sans text-base leading-6 font-light text-vt-dark-text",
        "border-vt-control-border outline-none transition-[border-color,box-shadow]",
        "placeholder:text-vt-grey-text",
        "hover:border-vt-primary-2",
        "focus-visible:border-2 focus-visible:border-vt-focus-ring focus-visible:px-[7px] focus-visible:py-[3px]",
        "disabled:cursor-not-allowed disabled:border-vt-control-border disabled:bg-vt-control-disabled-bg disabled:text-vt-grey-text disabled:hover:border-vt-control-border",
        "read-only:border-transparent read-only:px-0 read-only:py-0 read-only:hover:border-transparent",
        error &&
          "border-vt-error hover:border-vt-error focus-visible:border-vt-error",
        aiModified &&
          "border-vt-ai-modified text-vt-ai-modified hover:border-vt-ai-modified",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
