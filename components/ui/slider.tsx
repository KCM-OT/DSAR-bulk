"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

/**
 * Grounded against the ❖ .slider/Handle base component: a 34x28 light grey
 * handle (3px radius, soft drop shadow, two vertical grip lines) that picks up
 * a darker border on hover, the blue focus ring on focus and 50% opacity when
 * disabled. The track is a slim rail with a brand-green range.
 */
function Slider({
  className,
  defaultValue,
  value,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const thumbs = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [props.min ?? 0]),
    [value, defaultValue, props.min],
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      className={cn(
        "relative flex h-7 w-full touch-none items-center select-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1 grow overflow-hidden rounded-full bg-vt-border">
        <SliderPrimitive.Range className="absolute h-full bg-vt-primary-2" />
      </SliderPrimitive.Track>
      {thumbs.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={cn(
            "flex h-7 w-8.5 items-center justify-center gap-1 rounded-[3px] border border-vt-border bg-vt-secondary-3 outline-none",
            "shadow-[0_2px_5px_-2px_rgb(0_0_0/0.25)] transition-[border-color,box-shadow]",
            "hover:border-vt-control-border",
            "focus-visible:border-2 focus-visible:border-vt-focus-ring focus-visible:shadow-[0_2px_5px_-2px_rgb(0_0_0/0.25),0_0_2px_2px_var(--color-vt-focus-ring)]",
          )}
        >
          <span aria-hidden className="h-3.5 w-px bg-vt-border" />
          <span aria-hidden className="h-3.5 w-px bg-vt-border" />
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
