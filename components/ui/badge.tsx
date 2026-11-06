import type * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

// Grounded against the Vitreus UI Kit "❖ Badge" component frame
// (@onetrust/vitreus/badge): pill radius 20, 1px border, tinted fill,
// fixed height (20 small / 24 medium), label caption 12/16 dark text
// (beta is the only solid/white-text variant). Color maps to the code
// enum: semantic colors first, then differentiators.
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2 py-0.5 font-heading text-xs font-normal whitespace-nowrap text-vt-dark-text focus-visible:ring-2 focus-visible:ring-vt-focus-ring [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'border-vt-grey-text bg-vt-surface',
        primary: 'border-vt-information bg-vt-secondary-3',
        success: 'border-vt-success bg-vt-success-light',
        warning: 'border-vt-warning bg-vt-warning-light',
        danger: 'border-vt-risk-very-high bg-vt-risk-very-high-light',
        hold: 'border-vt-risk-very-low bg-vt-risk-very-low-light',
        orange: 'border-vt-risk-high bg-vt-risk-high-light',
        purple: 'border-vt-graphic-2 bg-[#f2eef9]',
        pink: 'border-vt-graphic-8 bg-[#faebf2]',
        metadata: 'border-vt-secondary-2 bg-vt-secondary-3',
        beta: 'border-vt-graphic-8 bg-vt-graphic-8 text-vt-light-text',
      },
      size: {
        medium: 'h-6',
        small: 'h-5 text-[0.6875rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'medium',
    },
  },
)

function Badge({
  className,
  variant,
  size,
  closable,
  onClose,
  children,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    closable?: boolean
    onClose?: () => void
  }) {
  return (
    <span
      data-slot="badge"
      tabIndex={0}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      <span className="truncate">{children}</span>
      {closable && size !== 'small' ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Remove"
          className="-mr-1 flex size-4 shrink-0 items-center justify-center rounded-full text-vt-grey-text hover:text-vt-dark-text"
        >
          <Icon name="xmark" size={14} aria-hidden />
        </button>
      ) : null}
    </span>
  )
}

export { Badge, badgeVariants }
