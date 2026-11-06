import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Status": a filled dot plus a #1a1a1a label.
 * Tones: empty #cccccc, information #1470a9, error #b30000, warning #da7c01,
 * success #028a02. Sizes: default, medium, large. Supports RTL by flipping the
 * dot to the trailing side.
 */
const dotVariants = cva('shrink-0 rounded-full', {
  variants: {
    tone: {
      empty: 'bg-vt-empty',
      information: 'bg-vt-information',
      error: 'bg-vt-error',
      warning: 'bg-vt-warning',
      success: 'bg-vt-status-success',
    },
    size: {
      default: 'size-2',
      medium: 'size-2.5',
      large: 'size-3',
    },
  },
  defaultVariants: { tone: 'empty', size: 'default' },
})

const textSize = {
  default: 'text-sm leading-5',
  medium: 'text-base leading-6',
  large: 'text-xl leading-7',
} as const

type StatusProps = VariantProps<typeof dotVariants> & {
  children: React.ReactNode
  className?: string
}

function Status({ tone, size = 'default', children, className }: StatusProps) {
  return (
    <span
      data-slot="status"
      data-tone={tone ?? 'empty'}
      className={cn(
        'inline-flex items-center gap-2 font-sans font-light text-vt-dark-text',
        textSize[size ?? 'default'],
        className,
      )}
    >
      <span aria-hidden className={dotVariants({ tone, size })} />
      {children}
    </span>
  )
}

export { Status }
