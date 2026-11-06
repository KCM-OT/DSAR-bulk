import * as React from 'react'
import { Icon } from '@/components/ui/icon'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Grounded against "Bulk Action Panel": #e8f1f6 band with 24px padding, a
 * centered "N selected" label over a blue "Select all N items" link, tertiary
 * (ghost) green actions, and a trailing close button.
 */
type BulkActionPanelProps = {
  selectedCount: number
  totalCount?: number
  onSelectAll?: () => void
  /** Prototype extension: overrides the default "Select all N items" label. */
  selectAllLabel?: React.ReactNode
  /** Prototype extension: shows the select-all link even when the cap is below the total. */
  showSelectAll?: boolean
  onClear: () => void
  children?: React.ReactNode
  className?: string
}

function BulkActionPanel({ selectedCount, totalCount, onSelectAll, selectAllLabel, showSelectAll, onClear, children, className }: BulkActionPanelProps) {
  if (selectedCount === 0) return null

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      data-slot="bulk-action-panel"
      className={cn('flex items-center justify-end gap-2 bg-vt-information-light p-6', className)}
    >
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex flex-col items-center gap-0.5 px-2 font-heading text-sm leading-5 font-medium">
          <span aria-live="polite" className="text-vt-dark-text">
            {selectedCount} selected
          </span>
          {onSelectAll && (showSelectAll ?? (totalCount !== undefined && totalCount > selectedCount)) && (
            <button
              type="button"
              onClick={onSelectAll}
              className="rounded-sm text-vt-information outline-none hover:underline focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
            >
              {selectAllLabel ?? `Select all ${totalCount} items`}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
      <Button variant="ghost" size="icon" aria-label="Clear selection" onClick={onClear}>
        <Icon name="xmark" aria-hidden />
      </Button>
    </div>
  )
}

export { BulkActionPanel }
