import * as React from 'react'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/**
 * Grounded against the table header "applied-filter" chip: #e8f1f6 fill,
 * radius 2, 24 tall, 14/20 light label with an 8px horizontal inset and a
 * trailing remove control. The "Hide | Clear all" links are 12/16 Open Sans
 * in link blue.
 */
function FilterChip({
  label,
  onRemove,
  className,
}: {
  label: string
  onRemove?: () => void
  className?: string
}) {
  return (
    <span
      data-slot="filter-chip"
      className={cn(
        'inline-flex h-6 items-center rounded-xs bg-vt-information-light pl-2 font-sans text-sm leading-5 font-light text-vt-dark-text',
        !onRemove && 'pr-2',
        className,
      )}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove filter: ${label}`}
          onClick={onRemove}
          className="ml-1 flex size-6 items-center justify-center rounded-xs outline-none hover:bg-vt-secondary-2 focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
        >
          <Icon name="xmark" aria-hidden size={12} />
        </button>
      )}
    </span>
  )
}

function FilterActions({
  expanded,
  onToggle,
  onClear,
}: {
  expanded: boolean
  onToggle: () => void
  onClear: () => void
}) {
  const linkClass =
    'rounded-sm font-sans text-xs leading-4 text-vt-information outline-none hover:underline focus-visible:ring-2 focus-visible:ring-vt-focus-ring'
  return (
    <div className="flex items-center gap-2 pl-2">
      <button type="button" onClick={onToggle} aria-expanded={expanded} className={linkClass}>
        {expanded ? 'Hide' : 'Show'}
      </button>
      <span aria-hidden className="h-3 w-px bg-vt-border" />
      <button type="button" onClick={onClear} className={linkClass}>
        Clear all
      </button>
    </div>
  )
}

export { FilterChip, FilterActions }
