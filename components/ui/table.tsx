import * as React from 'react'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Table" (vt-table): 48px rows, 1px #cccccc horizontal row
 * borders only (no vertical cell borders), 8px horizontal cell padding, 14/20
 * medium text with an optional 12/16 #4d4d4d subtext line, a fixed #f8f8f8
 * header fill (--vt-table-header), #f8f8f8 striped rows, #e8f1f6 selected row.
 */
function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn('w-full caption-bottom border-collapse font-heading text-sm leading-5 font-medium', className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead data-slot="table-header" className={cn('bg-vt-table-header', className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={className} {...props} />
}

function TableRow({
  className,
  striped,
  ...props
}: React.ComponentProps<'tr'> & { striped?: boolean }) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'h-12 border-b border-vt-border transition-colors',
        'hover:bg-vt-background data-[state=selected]:bg-vt-information-light',
        striped && 'bg-vt-background',
        className,
      )}
      {...props}
    />
  )
}

type SortDirection = 'asc' | 'desc' | false
type CellAlign = 'left' | 'center' | 'right'

const alignText: Record<CellAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const alignFlex: Record<CellAlign, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

function TableHead({
  className,
  sorted,
  onSort,
  align = 'left',
  children,
  ...props
}: React.ComponentProps<'th'> & { sorted?: SortDirection; onSort?: () => void; align?: CellAlign }) {
  const ariaSort = sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
  return (
    <th
      data-slot="table-head"
      scope="col"
      aria-sort={onSort ? (ariaSort ?? 'none') : undefined}
      className={cn('h-12 border-y border-vt-border bg-vt-table-header px-2 align-middle text-vt-dark-text', alignText[align], className)}
      {...props}
    >
      {onSort ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            'flex w-full items-center gap-2 rounded-sm py-3.5 outline-none focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
            alignFlex[align],
          )}
        >
          {children}
          {sorted === 'asc' && <Icon name="caret-up" variant="filled" aria-hidden />}
          {sorted === 'desc' && <Icon name="caret-down" variant="filled" aria-hidden />}
        </button>
      ) : (
        <div className={cn('flex items-center gap-2 py-3.5', alignFlex[align])}>{children}</div>
      )}
    </th>
  )
}

function TableCell({
  className,
  subtext,
  align = 'left',
  children,
  ...props
}: React.ComponentProps<'td'> & { subtext?: React.ReactNode; align?: CellAlign }) {
  return (
    <td
      data-slot="table-cell"
      className={cn('px-2 py-1 align-middle text-vt-dark-text', alignText[align], className)}
      {...props}
    >
      {subtext ? (
        <div className={cn('flex flex-col', align === 'center' && 'items-center', align === 'right' && 'items-end')}>
          <span>{children}</span>
          <span className="text-xs leading-4 text-vt-grey-text">{subtext}</span>
        </div>
      ) : (
        children
      )}
    </td>
  )
}

/**
 * Grounded against "Table subheader row": 48px group row with a 48px leading
 * expand control and a medium-weight group title. Spans every column.
 */
function TableSubheaderRow({
  title,
  colSpan,
  expanded = true,
  onToggle,
  className,
}: {
  title: React.ReactNode
  colSpan: number
  expanded?: boolean
  onToggle?: () => void
  className?: string
}) {
  return (
    <tr data-slot="table-subheader-row" className={cn('h-12 border-b border-vt-border bg-vt-surface', className)}>
      <td colSpan={colSpan} className="p-0">
        <div className="flex items-center">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse group' : 'Expand group'}
            className="flex size-12 items-center justify-center text-vt-grey-text outline-none hover:text-vt-dark-text focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-inset"
          >
            <Icon name={expanded ? 'chevron-down' : 'chevron-right'} aria-hidden />
          </button>
          <span className="text-sm leading-5 font-medium text-vt-dark-text">{title}</span>
        </div>
      </td>
    </tr>
  )
}

/**
 * Grounded against "Table expanded detail row": a borderless slot with
 * 8px horizontal, 16px top and 24px bottom padding projected under the row.
 */
function TableExpandedRow({
  colSpan,
  className,
  children,
}: {
  colSpan: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <tr data-slot="table-expanded-row" className="border-b border-vt-border bg-vt-surface">
      <td colSpan={colSpan} className={cn('px-2 pt-4 pb-6 text-sm leading-5 font-medium text-vt-dark-text', className)}>
        {children}
      </td>
    </tr>
  )
}

/**
 * Grounded against "Table footer row": 48px row of summary cells on the
 * surface fill; empty cells render the "- - - -" placeholder.
 */
function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return <tfoot data-slot="table-footer" className={cn('bg-vt-surface', className)} {...props} />
}

function TableFooterRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return <tr data-slot="table-footer-row" className={cn('h-12 border-b border-vt-border', className)} {...props} />
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return <caption data-slot="table-caption" className={cn('sr-only', className)} {...props} />
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableSubheaderRow,
  TableExpandedRow,
  TableFooterRow,
}
export type { SortDirection, CellAlign }
