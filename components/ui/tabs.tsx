"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/**
 * Grounded against the ❖ Tabs (oc-tabs) component frame: label-only items
 * (no icons/badges/close buttons), left-aligned with an 8px gap and no
 * container border, 12x16 padding per item, hover tints the background,
 * and the selected item bolds its label and carries a 2px brand-green
 * underline flush with the bottom of the bar.
 */
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-4", className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex items-end gap-2 border-b border-vt-border", className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative min-w-12 max-w-48 truncate px-4 py-3 font-sans text-base leading-6 font-light text-vt-dark-text outline-none transition-colors",
        "rounded-t-[4px] hover:bg-vt-success-light",
        "focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-inset",
        "data-[state=active]:font-medium",
        "data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:-bottom-px data-[state=active]:after:h-[2px] data-[state=active]:after:bg-vt-primary-2",
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
