'use client'

import * as React from 'react'
import { Columns3, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Icon } from '@/components/ui/icon'
import { PageHeader } from '@/components/ui/page-header'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, type SortDirection } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FlagBadge, StageBadge, Tooltip } from '@/components/common'
import { BulkBar } from '@/components/queue/bulk-bar'
import { ActionLauncher, type PendingAction } from '@/components/bulk/action-launcher'
import { RequestDrawer } from '@/components/request-drawer'
import { daysLeft, formatDate } from '@/lib/mock-data'
import { MAX_SELECTION, useStore } from '@/lib/store'
import type { DsarRequest, ViewId } from '@/lib/types'
import { VIEWS } from '@/lib/views'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 50

type SortKey = 'createdAt' | 'daysLeft' | 'id' | 'name'

function ViewPicker({
  view,
  onChange,
  counts,
}: {
  view: ViewId
  onChange: (view: ViewId) => void
  counts: Record<ViewId, number>
}) {
  const [query, setQuery] = React.useState('')
  const current = VIEWS.find((v) => v.id === view)!
  const filtered = VIEWS.filter((v) => v.label.toLowerCase().includes(query.trim().toLowerCase()))
  return (
    <DropdownMenu onOpenChange={(open) => !open && setQuery('')}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-14 w-64 shrink-0 items-center justify-between gap-2 border-r border-vt-border px-4 text-left outline-none hover:bg-vt-background focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-inset"
        >
          <span className="min-w-0">
            <span className="block truncate font-heading text-sm font-medium">{current.label}</span>
            <span className="block text-xs font-light text-vt-grey-text">Saved view</span>
          </span>
          <Icon name="chevron-down" size={14} />
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
  const [query, setQuery] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [sort, setSort] = React.useState<{ key: SortKey; dir: Exclude<SortDirection, false> }>({ key: 'createdAt', dir: 'desc' })
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [pending, setPending] = React.useState<PendingAction | null>(null)
  const [drawerId, setDrawerId] = React.useState<string | null>(null)
  const [bannerOpen, setBannerOpen] = React.useState(true)

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
    const match = VIEWS.find((v) => v.id === view)!.match
    const term = query.trim().toLowerCase()
    const list = snapshot
      .filter(match)
      .map((r) => byId.get(r.id) ?? r)
      .filter((r) => !term || r.id.toLowerCase().includes(term) || r.name.toLowerCase().includes(term))
    const value = (r: DsarRequest) =>
      sort.key === 'daysLeft' ? (daysLeft(r) ?? Number.POSITIVE_INFINITY) : sort.key === 'createdAt' ? r.createdAt : r[sort.key]
    return [...list].sort((a, b) => {
      const av = value(a)
      const bv = value(b)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [snapshot, byId, view, query, sort])

  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pageSelected = pageRows.filter((r) => selected.has(r.id)).length
  const headerState: boolean | 'indeterminate' =
    pageRows.length > 0 && pageSelected === pageRows.length ? true : pageSelected > 0 ? 'indeterminate' : false

  const changeView = (next: ViewId) => {
    setView(next)
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

  const sortProps = (key: SortKey) => ({
    sorted: sort.key === key ? sort.dir : (false as const),
    onSort: () => setSort((s) => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' })),
  })

  const selectedRequests = React.useMemo(
    () => [...selected].map((id) => byId.get(id)).filter((r): r is DsarRequest => Boolean(r)),
    [selected, byId],
  )

  const launch = (p: PendingAction) => setPending(p)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <PageHeader
        title="Requests"
        description={<span className="font-sans font-light">Manage and fulfill privacy rights requests submitted to your organization.</span>}
        actions={
          <>
            <Button>Create request</Button>
            <Button variant="outline" size="icon" aria-label="Options">
              <Icon name="ellipsis" size={24} />
            </Button>
          </>
        }
        className="border-b border-vt-border pt-3 pb-3"
      />

      {selected.size > 0 && (
        <BulkBar
          selected={selectedRequests}
          totalInView={rows.length}
          onSelectCap={selectCap}
          onClear={() => setSelected(new Set())}
          onAction={(action) => launch({ action, ids: [...selected] })}
        />
      )}

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

        <section className="flex min-h-0 flex-col rounded border border-vt-border bg-vt-surface">
          <div className="flex items-center border-b border-vt-border">
            <ViewPicker view={view} onChange={changeView} counts={counts} />
            <div className="px-4">
              <div className="font-heading text-sm font-medium">{rows.length.toLocaleString()} Items</div>
              <div className="text-xs font-light text-vt-grey-text">{query ? '1 Filters applied' : 'No filters applied'}</div>
            </div>
            <div className="ml-auto flex items-center gap-1 pr-3">
              <SearchInput
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search"
                className="w-60"
              />
              <Tooltip content="Columns">
                <Button variant="outline" size="icon" aria-label="Columns">
                  <Columns3 />
                </Button>
              </Tooltip>
              <Tooltip content="Refresh">
                <Button variant="outline" size="icon" aria-label="Refresh" onClick={refresh}>
                  <Icon name="refresh" />
                </Button>
              </Tooltip>
              <Tooltip content="Filters">
                <Button size="icon" aria-label="Filters">
                  <Icon name="filter" variant="filled" />
                </Button>
              </Tooltip>
            </div>
          </div>

          <Table className="min-w-[1200px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="h-10">
                <TableHead className="h-10 w-10 pl-4">
                  <Checkbox checked={headerState} onCheckedChange={togglePage} aria-label="Select all on this page" />
                </TableHead>
                <TableHead className="h-10" {...sortProps('id')}>ID</TableHead>
                <TableHead className="h-10" {...sortProps('name')}>Name</TableHead>
                <TableHead className="h-10">Stage</TableHead>
                <TableHead className="h-10">Automation flag</TableHead>
                <TableHead className="h-10">Workflow</TableHead>
                <TableHead className="h-10">Request type</TableHead>
                <TableHead className="h-10" {...sortProps('daysLeft')}>Days left</TableHead>
                <TableHead className="h-10">Extended</TableHead>
                <TableHead className="h-10" {...sortProps('createdAt')}>Date created</TableHead>
                <TableHead className="h-10">Assignee</TableHead>
                <TableHead className="h-10" align="center">Completed subtasks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((r) => {
                const left = daysLeft(r)
                const isSelected = selected.has(r.id)
                return (
                  <TableRow key={r.id} data-state={isSelected ? 'selected' : undefined} className="h-10">
                    <TableCell className="pl-4">
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleRow(r.id)} aria-label={`Select ${r.id}`} />
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setDrawerId(r.id)}
                        className="inline-flex items-center gap-1.5 font-medium text-vt-information hover:underline"
                      >
                        {r.unread && <span className="size-1.5 rounded-full bg-vt-information" aria-label="Unread" />}
                        {r.id}
                      </button>
                    </TableCell>
                    <TableCell className={cn('font-light', r.unread && 'font-medium')}>{r.name}</TableCell>
                    <TableCell>
                      <StageBadge stage={r.stage} />
                    </TableCell>
                    <TableCell>
                      <FlagBadge flag={r.flag} />
                    </TableCell>
                    <TableCell className="max-w-48 truncate font-light">{r.workflow}</TableCell>
                    <TableCell className="font-light">{r.requestType}</TableCell>
                    <TableCell className={cn('font-light tabular-nums', left !== null && left < 0 && 'text-vt-error')}>
                      {left === null ? '---' : left}
                    </TableCell>
                    <TableCell className="font-light">{r.extended ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="font-light whitespace-nowrap">{formatDate(r.createdAt)}</TableCell>
                    <TableCell className="font-light">{r.assignee ?? <span className="text-vt-grey-text">Unassigned</span>}</TableCell>
                    <TableCell align="center" className="font-light tabular-nums">
                      {r.subtasksDone} / {r.subtasksTotal}
                    </TableCell>
                  </TableRow>
                )
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-16 text-center text-sm font-light text-vt-grey-text">
                    No requests in this view
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
          <div className="border-t border-vt-border px-4 py-2">
            <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onPageChange={setPage} />
          </div>
        </section>
      </div>

      {pending && (
        <ActionLauncher
          pending={pending}
          onClose={() => setPending(null)}
          onStarted={() => {
            setPending(null)
            if (!pending.single) setSelected(new Set())
          }}
        />
      )}
      <RequestDrawer
        requestId={drawerId}
        onClose={() => setDrawerId(null)}
        onAction={(action, id) => launch({ action, ids: [id], single: true })}
      />
    </div>
  )
}
