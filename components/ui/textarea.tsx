import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Grounded against the ❖ Textarea field frame: 4px radius, neutral border,
 * brand-green hover, 2px blue focus border (red when invalid), light grey
 * disabled fill, borderless read-only, and the purple ai-modified state.
 * 16/24 light value text, vertical resize handle.
 */
function Textarea({
  className,
  error,
  aiModified,
  ...props
}: React.ComponentProps<"textarea"> & { error?: boolean; aiModified?: boolean }) {
  return (
    <textarea
      data-slot="textarea"
      aria-invalid={error || undefined}
      className={cn(
        "flex min-h-26 w-full resize-y rounded-[4px] border bg-vt-surface px-2 py-1 font-sans text-base leading-6 font-light text-vt-dark-text",
        "border-vt-control-border outline-none transition-[border-color,box-shadow]",
        "placeholder:text-vt-grey-text",
        "hover:border-vt-primary-2",
        "focus-visible:border-2 focus-visible:border-vt-focus-ring focus-visible:px-[7px] focus-visible:py-[3px]",
        "disabled:cursor-not-allowed disabled:border-vt-control-border disabled:bg-vt-control-disabled-bg disabled:text-vt-grey-text disabled:hover:border-vt-control-border",
        "read-only:min-h-0 read-only:resize-none read-only:border-transparent read-only:px-0 read-only:py-0 read-only:hover:border-transparent",
        error && "border-vt-error hover:border-vt-error focus-visible:border-vt-error",
        aiModified && "border-vt-ai-modified text-vt-ai-modified hover:border-vt-ai-modified",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
