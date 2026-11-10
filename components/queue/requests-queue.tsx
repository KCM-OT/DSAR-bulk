'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Columns3, Download, ListFilter, Lock, MoveVertical, Plus, RotateCw, User, X } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Icon } from '@/components/ui/icon'
import { PageHeader } from '@/components/ui/page-header'
import { Avatar } from '@/components/ui/avatar'
import { SearchInput } from '@/components/ui/search-input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, type SortDirection } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StageBadge, Tooltip } from '@/components/common'
import { BulkBar } from '@/components/queue/bulk-bar'
import { QueuePagination } from '@/components/queue/queue-pagination'
import { ActionLauncher, type PendingAction } from '@/components/bulk/action-launcher'
import { daysLeft, emailFor, formatTableDate } from '@/lib/mock-data'
import { MAX_SELECTION, useStore } from '@/lib/store'
import type { DsarRequest, ViewId } from '@/lib/types'
import { FILTERS, matchesFilters, VIEWS, type FilterId } from '@/lib/views'
import { cn } from '@/lib/utils'

type SortKey = 'createdAt' | 'daysLeft' | 'subtasks'
type SortState = { key: SortKey; dir: Exclude<SortDirection, false> }

/** Empty-cell placeholder used across the queue table ("- - - -"). */
function Dashes({ count = 5 }: { count?: number }) {
  return (
    <span className="text-vt-dark-text" aria-label="None">
      {Array.from({ length: count }, () => '-').join(' ')}
    </span>
  )
}

/** Sortable header: a vertical double arrow when unsorted, an up/down arrow when sorted. */
function SortHead({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string
  sortKey: SortKey
  sort: SortState
  onSort: (key: SortKey) => void
  className?: string
}) {
  const active = sort.key === sortKey
  const SortIcon = !active ? MoveVertical : sort.dir === 'asc' ? ArrowUp : ArrowDown
  return (
    <TableHead
      className={cn('border-t-0', className)}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="-mx-1 flex items-center gap-1.5 rounded px-1 outline-none focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
      >
        {label}
        <SortIcon className="size-4 text-vt-dark-text" strokeWidth={1.75} aria-hidden />
      </button>
    </TableHead>
  )
}

const AVATAR_TONES = [5, 1, 2, 7, 3, 6] as const

/** Approver cell: initials avatar with name and email, or a generic person icon when unassigned. */
function Approver({ name }: { name: string | null }) {
  if (!name) {
    return (
      <span className="grid size-7 place-items-center rounded-full bg-vt-information text-vt-light-text" aria-label="No approver">
        <User className="size-4" fill="currentColor" strokeWidth={0} />
      </span>
    )
  }
  const tone = AVATAR_TONES[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % AVATAR_TONES.length]
  return (
    <span className="flex items-center gap-2">
      <Avatar name={name} size={28} tone={tone} />
      <span className="flex flex-col">
        <span className="text-sm leading-5">{name}</span>
        <span className="text-xs leading-4 text-vt-grey-text">{emailFor(name)}</span>
      </span>
    </span>
  )
}

function ViewPicker({
  view,
  onChange,
  counts,
  active,
}: {
  view: ViewId
  onChange: (view: ViewId) => void
  counts: Record<ViewId, number>
  active: boolean
}) {
  const [query, setQuery] = React.useState('')
  const current = VIEWS.find((v) => v.id === view)!
  const filtered = VIEWS.filter((v) => v.label.toLowerCase().includes(query.trim().toLowerCase()))
  return (
    <DropdownMenu onOpenChange={(open) => !open && setQuery('')}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Saved view: ${current.label}`}
          className={cn(
            'group flex h-8 w-[185px] shrink-0 items-center gap-1 rounded px-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
            // A view that applies filters is shown in the "active" green tint from the Figma table header.
            active ? 'bg-[#edf3ee] hover:bg-[#e1ebe3]' : 'bg-[#efefef] hover:bg-[#e5e5e5]',
          )}
        >
          <ListFilter className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
          <span className="min-w-0 flex-1 truncate font-sans text-base leading-6 text-vt-dark-text">{current.label}</span>
          <Icon name="chevron-down" size={16} className="transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <div className="flex justify-end gap-2 p-3">
          <Button variant="secondary" size="sm" disabled>
            Save
          </Button>
          <Button variant="secondary" size="sm">
            Save As
          </Button>
        </div>
        <div className="px-3 pb-2">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Search..."
            className="max-w-none"
          />
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-auto py-1">
          {filtered.map((v, i) => (
            <React.Fragment key={v.id}>
              {i === 4 && !query && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onSelect={() => onChange(v.id)}
                className={cn('text-sm leading-5', v.id === view && 'border-l-2 border-vt-information bg-vt-information-light')}
                description={v.description}
              >
                <span className="flex items-center gap-2">
                  <span className="flex-1">{v.label}</span>
                  {v.isNew && (
                    <span className="rounded-full border border-vt-graphic-8 px-1.5 text-[10px] leading-4 text-vt-graphic-8">NEW</span>
                  )}
                  <span className="tabular-nums text-vt-grey-text">{counts[v.id].toLocaleString()}</span>
                  <Tooltip content="Seeded view. It can't be renamed or deleted.">
                    <Lock className="size-3 text-vt-grey-text" aria-label="Seeded view" />
                  </Tooltip>
                </span>
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </div>
        <DropdownMenuSeparator />
        <div className="flex justify-center p-3">
          <Button variant="secondary" size="sm">
            Manage views
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function RequestsQueue() {
  const { requests, byId, refreshToken, refresh, pushToast } = useStore()
  const [view, setView] = React.useState<ViewId>('all')
  const [filters, setFilters] = React.useState<FilterId[]>([])
  const [filtersHidden, setFiltersHidden] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [page, setPage] = React.useState(1)
  const router = useRouter()
  const [pageSize, setPageSize] = React.useState(20)
  const [sort, setSort] = React.useState<SortState>({ key: 'createdAt', dir: 'desc' })
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [pending, setPending] = React.useState<PendingAction | null>(null)
  const [bannerOpen, setBannerOpen] = React.useState(true)
  // Standard requests have no automation flag, so the Automated submission column is hidden there.
  const showAutomated = view !== 'standard'

  // View membership is evaluated against a snapshot taken at the last refresh (Story 1, AC 9).
  const [snapshot, setSnapshot] = React.useState(requests)
  const requestsRef = React.useRef(requests)
  requestsRef.current = requests
  React.useEffect(() => setSnapshot(requestsRef.current), [refreshToken])

  const counts = React.useMemo(() => {
    const out = {} as Record<ViewId, number>
    for (const v of VIEWS) out[v.id] = snapshot.filter(v.match).length
    return out
  }, [snapshot])

  const rows = React.useMemo(() => {
    const term = query.trim().toLowerCase()
    const list = snapshot
      .filter((r) => matchesFilters(r, filters))
      .map((r) => byId.get(r.id) ?? r)
      .filter((r) => !term || r.id.toLowerCase().includes(term) || r.name.toLowerCase().includes(term))
    const value = (r: DsarRequest): number | string => {
      switch (sort.key) {
        case 'daysLeft':
          return daysLeft(r) ?? Number.POSITIVE_INFINITY
        case 'subtasks':
          return r.subtasksTotal ? r.subtasksDone / r.subtasksTotal : -1
        default:
          return r.createdAt
      }
    }
    return [...list].sort((a, b) => {
      const av = value(a)
      const bv = value(b)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [snapshot, byId, filters, query, sort])

  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)
  const pageSelected = pageRows.filter((r) => selected.has(r.id)).length
  const headerState: boolean | 'indeterminate' =
    pageRows.length > 0 && pageSelected === pageRows.length ? true : pageSelected > 0 ? 'indeterminate' : false

  const changeView = (next: ViewId) => {
    setView(next)
    setFilters(VIEWS.find((v) => v.id === next)!.filters)
    setFiltersHidden(false)
    setPage(1)
    setSelected(new Set())
  }

  // Removing a tag widens the results; once nothing is left the table is back to All requests.
  const removeFilter = (id: FilterId) => {
    const next = filters.filter((f) => f !== id)
    if (next.length === 0) return changeView('all')
    setFilters(next)
    setPage(1)
    setSelected(new Set())
  }

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size >= MAX_SELECTION) {
        pushToast({ tone: 'warning', text: `Bulk actions can run on up to ${MAX_SELECTION} requests at a time.` })
        return prev
      } else next.add(id)
      return next
    })
  }

  const togglePage = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (headerState === true) pageRows.forEach((r) => next.delete(r.id))
      else {
        for (const r of pageRows) {
          if (next.size >= MAX_SELECTION) break
          next.add(r.id)
        }
      }
      return next
    })
  }

  const selectCap = () => setSelected(new Set(rows.slice(0, MAX_SELECTION).map((r) => r.id)))

  const sortBy = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))

  const selectedRequests = React.useMemo(
    () => [...selected].map((id) => byId.get(id)).filter((r): r is DsarRequest => Boolean(r)),
    [selected, byId],
  )

  const launch = (p: PendingAction) => setPending(p)
  const pendingRef = React.useRef(pending)
  pendingRef.current = pending
  const onLauncherDone = React.useCallback(() => {
    const done = pendingRef.current
    setPending(null)
    if (done && !done.single) setSelected(new Set())
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <PageHeader
        title="Requests"
        description={<span className="font-sans font-light">Manage and fulfill privacy rights requests submitted to your organization.</span>}
        actions={
          <>
            <Button>Create request</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={buttonVariants({ variant: 'outline', size: 'icon' })} aria-label="More options">
                  <Icon name="ellipsis" size={24} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem
                  onSelect={() => pushToast({ tone: 'info', text: 'Export is not wired up in this prototype.' })}
                >
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => pushToast({ tone: 'info', text: 'View archive is not wired up in this prototype.' })}
                >
                  View archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
        className="border-b border-vt-border pt-3 pb-3"
      />


      <div className="flex flex-col gap-4 p-4">
        {bannerOpen && (
          <section className="relative rounded border border-vt-border bg-vt-surface p-4">
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setBannerOpen(false)}
              className="absolute top-3 right-3 grid size-8 place-items-center rounded hover:bg-vt-information-light"
            >
              <Icon name="xmark" />
            </button>
            <h2 className="font-heading text-lg font-medium">Data Redaction for privacy requests</h2>
            <p className="mt-2 max-w-3xl text-sm font-light">
              OneTrust Data Redaction for Privacy Requests allows you to upload, scan, and auto-redact sensitive information from documents used
              in DSAR cases. Tutorial users will be provided a Test Request to use as an example use case.
            </p>
            <div className="mt-3 flex items-center gap-4">
              <Button>Start tutorial</Button>
              <a href="#" className="inline-flex items-center gap-1 text-sm text-vt-information hover:underline">
                Learn more <Icon name="external-link" size={12} />
              </a>
            </div>
          </section>
        )}

        {/* The bulk panel sits on top of the table card and shares its border, so the two read as one unit. */}
        <div className="flex min-h-0 flex-col">
          {selected.size > 0 && (
            <BulkBar
              selected={selectedRequests}
              totalInView={rows.length}
              onSelectCap={selectCap}
              onClear={() => setSelected(new Set())}
              onAction={(action) =>
                launch(
                  action === 'public-comment'
                    ? { action: 'comment', ids: [...selected], commentMode: 'public' }
                    : action === 'internal-comment'
                      ? { action: 'comment', ids: [...selected], commentMode: 'internal' }
                      : { action, ids: [...selected] },
                )
              }
            />
          )}
        <section
          className={cn(
            'flex min-h-0 flex-col rounded border border-vt-border bg-vt-surface',
            selected.size > 0 && 'rounded-t-none',
          )}
        >
          {/* Table header from Figma "X / Table / Table header": saved view + actions, then filters. */}
          <div className="flex flex-col gap-2 px-4 pt-3 pb-2">
            <div className="flex items-center justify-between gap-4">
              <ViewPicker view={view} onChange={changeView} counts={counts} active={filters.length > 0} />
              <div className="flex flex-1 items-center justify-end gap-2">
                <SearchInput
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Search..."
                  className="w-[270px]"
                />
                <Tooltip content="Columns">
                  <Button variant="ghost" size="icon" aria-label="Columns">
                    <Columns3 />
                  </Button>
                </Tooltip>
                <Tooltip content="Refresh">
                  <Button variant="ghost" size="icon" aria-label="Refresh" onClick={refresh}>
                    <RotateCw />
                  </Button>
                </Tooltip>
                <Tooltip content="Export">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Export"
                    onClick={() => pushToast({ tone: 'info', text: 'Export is not wired up in this prototype.' })}
                  >
                    <Download />
                  </Button>
                </Tooltip>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => pushToast({ tone: 'info', text: 'Adding filters is not wired up in this prototype.' })}
                className="flex h-8 items-center gap-1 rounded px-2 text-sm leading-5 font-semibold text-vt-primary-1 outline-none hover:bg-vt-background focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
              >
                <Plus className="size-5" strokeWidth={1.75} aria-hidden />
                Add filter
              </button>
              {filters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Applied filters">
                  {!filtersHidden &&
                    filters.map((id) => (
                      <span
                        key={id}
                        role="listitem"
                        className="flex h-7 items-center rounded border border-vt-secondary-2 bg-vt-information-light"
                      >
                        <span className="px-2 py-0.5 text-sm leading-5 text-vt-dark-text">{FILTERS[id].label}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${FILTERS[id].label} filter`}
                          onClick={() => removeFilter(id)}
                          className="grid size-6 place-items-center rounded text-vt-dark-text outline-none hover:bg-vt-secondary-2 focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
                        >
                          <X className="size-4" strokeWidth={1.75} />
                        </button>
                      </span>
                    ))}
                  <span className="flex h-4 items-center pl-2 text-xs leading-4 text-vt-link-text">
                    <button type="button" onClick={() => setFiltersHidden((h) => !h)} className="hover:underline">
                      {filtersHidden ? `Show (${filters.length})` : 'Hide'}
                    </button>
                    <span aria-hidden className="mx-2 h-3 w-px bg-vt-border" />
                    <button type="button" onClick={() => changeView('all')} className="hover:underline">
                      Clear all
                    </button>
                  </span>
                </div>
              )}
            </div>
          </div>

          <Table className="min-w-[1600px] font-sans font-normal [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap [&_tbody_tr]:border-[#e5e5e5]">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="h-12">
                <TableHead className="w-12 border-t-0 pl-4">
                  <Checkbox checked={headerState} onCheckedChange={togglePage} aria-label="Select all on this page" />
                </TableHead>
                <TableHead className="w-12 border-t-0">
                  <span className="sr-only">Actions</span>
                </TableHead>
                <TableHead className="border-t-0">ID</TableHead>
                <TableHead className="border-t-0">Name</TableHead>
                <TableHead className="border-t-0">Organization</TableHead>
                <TableHead className="border-t-0">Stage</TableHead>
                <TableHead className="border-t-0">Request type</TableHead>
                {showAutomated && (
                  <TableHead className="border-t-0">
                    <span className="inline-flex items-center gap-1.5">
                      Automated submission
                      <Tooltip content="Whether the request was flagged as submitted by an automated agent">
                        <span className="inline-flex" aria-label="About automated submission">
                          <Icon name="circle-info" variant="filled" size={14} className="text-vt-dark-text" />
                        </span>
                      </Tooltip>
                    </span>
                  </TableHead>
                )}
                <SortHead label="Days left" sortKey="daysLeft" sort={sort} onSort={sortBy} />
                <TableHead className="border-t-0">Extended</TableHead>
                <SortHead label="Date created" sortKey="createdAt" sort={sort} onSort={sortBy} />
                <TableHead className="border-t-0">Subject type</TableHead>
                <SortHead label="Completed subtasks" sortKey="subtasks" sort={sort} onSort={sortBy} />
                <TableHead className="border-t-0">Approver</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((r) => {
                const left = daysLeft(r)
                const isSelected = selected.has(r.id)
                const terminal = left === null
                return (
                  <TableRow key={r.id} data-state={isSelected ? 'selected' : undefined} className="h-12">
                    <TableCell className="pl-4">
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleRow(r.id)} aria-label={`Select ${r.id}`} />
                    </TableCell>
                    <TableCell className="px-0 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Actions for ${r.id}`}
                            className="grid size-8 place-items-center rounded outline-none hover:bg-vt-background focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
                          >
                            <Icon name="ellipsis" variant="filled" size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                          <DropdownMenuItem onSelect={() => router.push(`/requests/${r.id}`)}>View details</DropdownMenuItem>
                          <DropdownMenuItem disabled={terminal || r.extended} onSelect={() => launch({ action: 'extend', ids: [r.id], single: true })}>
                            Extend
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={terminal} onSelect={() => launch({ action: 'reject', ids: [r.id], single: true })}>
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={terminal} onSelect={() => launch({ action: 'close', ids: [r.id], single: true })}>
                            Close
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/requests/${r.id}`}
                        className="inline-flex items-center gap-1.5 font-medium text-vt-information hover:underline"
                      >
                        {r.unread && <span className="size-1.5 rounded-full bg-vt-information" aria-label="Unread" />}
                        {r.id}
                      </Link>
                    </TableCell>
                    <TableCell className={cn(r.unread && 'font-medium')}>{r.name}</TableCell>
                    <TableCell>{r.organization}</TableCell>
                    <TableCell>
                      <StageBadge stage={r.stage} />
                    </TableCell>
                    <TableCell>{r.requestType || <Dashes />}</TableCell>
                    {showAutomated && (
                      <TableCell>
                        {r.flag === 'confirmed' ? 'Confirmed' : r.flag === 'suspected' ? 'Suspected' : 'n/a'}
                      </TableCell>
                    )}
                    <TableCell className="tabular-nums">
                      {left === null ? (
                        <Dashes />
                      ) : left < 0 ? (
                        <span className="inline-flex items-center gap-2">
                          {left}
                          <span className="inline-flex h-6 items-center rounded-full border border-vt-error bg-vt-error-light px-2 text-xs leading-4">
                            Overdue
                          </span>
                        </span>
                      ) : (
                        left
                      )}
                    </TableCell>
                    <TableCell>{r.extended ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="tabular-nums">{formatTableDate(r.createdAt)}</TableCell>
                    <TableCell>{r.subjectType}</TableCell>
                    <TableCell className="tabular-nums">
                      {r.subtasksDone}/{r.subtasksTotal}
                    </TableCell>
                    <TableCell className="py-0">
                      <Approver name={r.assignee} />
                    </TableCell>
                  </TableRow>
                )
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={showAutomated ? 14 : 13} className="py-16 text-center text-sm text-vt-grey-text">
                    No requests in this view
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
          <div className="border-t border-vt-border">
            <QueuePagination
              page={page}
              pageSize={pageSize}
              total={rows.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          </div>
        </section>
        </div>
      </div>

      {pending && (
        <ActionLauncher
          pending={pending}
          onClose={() => setPending(null)}
          onStarted={onLauncherDone}
        />
      )}
    </div>
  )
}
