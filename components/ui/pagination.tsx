'use client'

import * as React from 'react'
import { Icon } from '@/components/ui/icon'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Grounded against the "Example - full table" footer: chevron prev/next with
 * numbered page buttons (current page tinted #e8f1f6), a "Go to page" input
 * with a secondary "Go" button, and a trailing "Showing x-y of z | N/page"
 * summary.
 */
type PaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}

function visiblePages(page: number, pageCount: number) {
  const start = Math.max(1, Math.min(page - 1, pageCount - 2))
  const end = Math.min(pageCount, start + 2)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

function Pagination({ page, pageSize, total, onPageChange, className }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const [goTo, setGoTo] = React.useState('')
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(total, page * pageSize)

  const submitGoTo = () => {
    const target = Number.parseInt(goTo, 10)
    if (Number.isFinite(target)) onPageChange(Math.min(pageCount, Math.max(1, target)))
    setGoTo('')
  }

  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={cn('flex flex-wrap items-center justify-between gap-4 px-4 py-4 font-heading text-base', className)}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex size-8 items-center justify-center rounded text-vt-dark-text outline-none hover:bg-vt-information-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring disabled:text-vt-empty disabled:hover:bg-transparent"
        >
          <Icon name="chevron-left" aria-hidden />
        </button>

        {visiblePages(page, pageCount).map((number) => (
          <button
            key={number}
            type="button"
            aria-label={`Page ${number}`}
            aria-current={number === page ? 'page' : undefined}
            onClick={() => onPageChange(number)}
            className={cn(
              'flex size-8 items-center justify-center rounded font-light text-vt-dark-text outline-none hover:bg-vt-information-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
              number === page && 'bg-vt-information-light',
            )}
          >
            {number}
          </button>
        ))}

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="flex size-8 items-center justify-center rounded text-vt-dark-text outline-none hover:bg-vt-information-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring disabled:text-vt-empty disabled:hover:bg-transparent"
        >
          <Icon name="chevron-right" aria-hidden />
        </button>

        <span aria-hidden className="mx-1 h-4 w-px bg-vt-border" />

        <label htmlFor="pagination-go-to" className="font-light text-vt-dark-text">
          Go to page
        </label>
        <input
          id="pagination-go-to"
          inputMode="numeric"
          value={goTo}
          onChange={(event) => setGoTo(event.target.value.replace(/\D/g, ''))}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submitGoTo()
          }}
          className="h-8 w-14 rounded border border-vt-control-border bg-vt-surface px-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
        />
        <Button variant="secondary" onClick={submitGoTo}>
          Go
        </Button>
      </div>

      <p className="flex items-center gap-3 font-light text-vt-dark-text">
        <span>
          Showing {first}-{last} of {total}
        </span>
        <span aria-hidden className="h-4 w-px bg-vt-border" />
        <span>{pageSize}/page</span>
      </p>
    </nav>
  )
}

export { Pagination }
