'use client'

import * as React from 'react'

import { Icon } from '@/components/ui/icon'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export const PAGE_SIZES = [10, 20, 50, 100]

/** Page numbers with ellipses: 1 2 3 4 5 … 71 near the start, 1 … 34 35 36 … 71 in the middle. */
function pageItems(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, 'gap', pageCount]
  if (page >= pageCount - 3) return [1, 'gap', ...Array.from({ length: 5 }, (_, i) => pageCount - 4 + i)]
  return [1, 'gap', page - 1, page, page + 1, 'gap', pageCount]
}

const square =
  'flex size-8 items-center justify-center rounded text-sm text-vt-dark-text outline-none focus-visible:ring-2 focus-visible:ring-vt-focus-ring'

/** Queue table footer from the new table layout: pages, "Go to page" and a page-size picker. */
export function QueuePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}) {
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
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 font-sans text-sm">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(square, 'hover:bg-vt-background disabled:text-vt-empty disabled:hover:bg-transparent')}
        >
          <Icon name="chevron-left" aria-hidden />
        </button>
        {pageItems(page, pageCount).map((item, i) =>
          item === 'gap' ? (
            <span key={`gap-${i}`} className={cn(square, 'text-vt-grey-text')} aria-hidden>
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={cn(square, 'hover:bg-vt-background', item === page && 'bg-[#efefef] font-medium')}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className={cn(square, 'hover:bg-vt-background disabled:text-vt-empty disabled:hover:bg-transparent')}
        >
          <Icon name="chevron-right" aria-hidden />
        </button>

        <label htmlFor="queue-go-to" className="ml-3 text-vt-dark-text">
          Go to page
        </label>
        <input
          id="queue-go-to"
          inputMode="numeric"
          value={goTo}
          onChange={(e) => setGoTo(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && submitGoTo()}
          className="ml-2 h-8 w-10 rounded border border-vt-control-border bg-vt-surface px-1 text-center outline-none focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
        />
        <button
          type="button"
          onClick={submitGoTo}
          className="ml-1 h-8 rounded border border-vt-primary-1 px-2 font-medium text-vt-primary-1 outline-none hover:bg-vt-background focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
        >
          Go
        </button>
      </div>

      <div className="flex items-center gap-3 text-vt-dark-text">
        <span>
          Showing {first}-{last} of {total.toLocaleString()}
        </span>
        <span aria-hidden className="h-4 w-px bg-vt-border" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Rows per page"
              className="flex items-center gap-6 rounded px-1 outline-none hover:bg-vt-background focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
            >
              {pageSize}/page
              <Icon name="chevron-down" size={14} aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            {PAGE_SIZES.map((size) => (
              <DropdownMenuItem key={size} onSelect={() => onPageSizeChange(size)}>
                {size}/page
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
