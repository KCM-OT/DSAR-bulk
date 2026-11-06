import * as React from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Grounded against the "Table header" component: a 18/24 medium title with the
 * row count in light weight, then a toolbar row (saved-view select on the
 * left, search and actions on the right) and an optional "Add filter" row
 * that hosts applied filter chips.
 */
function TableToolbar({
  title,
  count,
  savedView,
  search,
  actions,
  filters,
  onAddFilter,
  className,
}: {
  title: React.ReactNode
  count?: number
  savedView?: React.ReactNode
  search?: React.ReactNode
  actions?: React.ReactNode
  filters?: React.ReactNode
  onAddFilter?: () => void
  className?: string
}) {
  return (
    <div data-slot="table-toolbar" className={cn('flex flex-col gap-2 pb-2', className)}>
      <h3 className="font-heading text-lg leading-6 font-medium tracking-[-0.02em] text-vt-dark-text">
        {title}
        {count !== undefined ? (
          <span className="font-light text-vt-grey-text"> ({count.toLocaleString()})</span>
        ) : null}
      </h3>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-2">{savedView}</div>
        <div className="flex items-center justify-end gap-2">
          {search}
          {actions}
        </div>
      </div>
      {onAddFilter || filters ? (
        <div className="flex flex-wrap items-center gap-2">
          {onAddFilter ? (
            <button
              type="button"
              onClick={onAddFilter}
              className="inline-flex h-8 items-center gap-2 rounded-sm px-2 font-sans text-sm leading-5 font-medium text-vt-primary-1 outline-none hover:bg-vt-background focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
            >
              <Icon name="plus" aria-hidden />
              Add filter
            </button>
          ) : null}
          {filters}
        </div>
      ) : null}
    </div>
  )
}

export { TableToolbar }
