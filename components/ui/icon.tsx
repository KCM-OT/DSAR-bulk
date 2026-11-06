import * as React from 'react'

import { iconData, type IconName, type IconVariant } from '@/components/ui/icon-data'
import { cn } from '@/lib/utils'

interface IconProps extends Omit<React.ComponentProps<'svg'>, 'name' | 'children'> {
  name: IconName
  variant?: IconVariant
  size?: number
  title?: string
}

function Icon({ name, variant = 'outline', size = 16, title, className, ...props }: IconProps) {
  const glyphs: Partial<Record<IconVariant, { viewBox: string; path: string }>> = iconData[name]
  const glyph = glyphs[variant] ?? glyphs.outline ?? glyphs.filled
  if (!glyph) return null

  return (
    <svg
      data-slot="icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={glyph.viewBox}
      width={size}
      height={size}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn('shrink-0', className)}
      {...props}
    >
      <path d={glyph.path} />
    </svg>
  )
}

export { Icon, type IconProps }
export type { IconName, IconVariant }
