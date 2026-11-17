'use client'

import * as React from 'react'

import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Status } from '@/components/ui/status'
import type { Plan, PlanGroup } from '@/lib/actions'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { idFilterUrl } from '@/lib/views'

/**
 * Figma Status at default size is caption text (12/16) with a 4px gap and a 32px min box;
 * the Vitreus copy here renders 14/20 with an 8px gap, so the summary overrides it.
 */
const captionStatus = 'min-h-8 gap-1 text-xs leading-4'

/** Each outcome tone maps to a Vitreus Status tone. */
const statusTone = { success: 'success', info: 'information', warning: 'warning' } as const

/** Tag text for a skipped group's filtered view: the reason, without the trailing "hence skipped". */
const skippedLabel = (group: PlanGroup) => `Skipped: ${group.text.replace(/,? hence skipped$/, '')}`

/** Opens the queue in a new tab, filtered to the requests in this group. */
function openFilteredView(group: PlanGroup, pushToast: ReturnType<typeof useStore>['pushToast']) {
  const url = idFilterUrl({ label: skippedLabel(group), ids: group.ids })
  const tab = url ? window.open(url, '_blank') : null
  if (tab) tab.opener = null
  else pushToast({ tone: 'error', text: "The filtered view couldn't be opened in a new tab." })
}

/** The requests in one outcome group, shown when its View link is open; skipped groups can open as a filtered view. */
function GroupRequests({ group, filterable }: { group: PlanGroup; filterable?: boolean }) {
  const { byId, pushToast } = useStore()
  const shown = group.ids.slice(0, 50)
  return (
    <div className="flex flex-col gap-2">
      <div className="max-h-40 overflow-auto rounded border border-vt-border bg-vt-table-header">
        <table className="w-full text-xs">
          <tbody>
            {shown.map((id) => {
              const r = byId.get(id)
              return (
                <tr key={id} className="border-b border-vt-border last:border-0">
                  <td className="px-2 py-1 font-medium text-vt-information">{id}</td>
                  <td className="px-2 py-1 font-light">{r?.name}</td>
                  <td className="px-2 py-1 font-light">{r?.stage}</td>
                  <td className="px-2 py-1 font-light text-vt-grey-text">{r?.workflow}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {group.ids.length > shown.length && <p className="px-2 py-1 text-xs text-vt-grey-text">and {group.ids.length - shown.length} more</p>}
      </div>
      {filterable && (
        <Button variant="secondary" size="sm" className="self-start" onClick={() => openFilteredView(group, pushToast)}>
          Open as filtered view
          <ExternalLink aria-hidden />
        </Button>
      )}
    </div>
  )
}

/** One row: a caption-size Status with the outcome as its label, View on the right. */
export function GroupRow({ group, filterable }: { group: PlanGroup; filterable?: boolean }) {
  const [open, setOpen] = React.useState(false)
  return (
    <li className="flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <Status tone={statusTone[group.tone]} className={captionStatus}>
          {group.text}
        </Status>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="shrink-0 text-xs leading-4 font-light text-vt-link-text hover:underline"
        >
          {open ? 'Hide' : 'View'}
        </button>
      </div>
      {open && (
        <div className="pb-2 pl-3">
          <GroupRequests group={group} filterable={filterable} />
        </div>
      )}
    </li>
  )
}

/**
 * The outcome of a bulk action, per Figma DSAR 4632:18775: a bordered box with the title and
 * count on one row, then caption-size Vitreus Status rows without dividers.
 */
export function PlanSummary({ plan, selectedCount, className }: { plan: Plan; selectedCount: number; className?: string }) {
  return (
    <section className={cn('flex flex-col rounded border border-vt-border px-4 py-[15px] text-vt-dark-text', className)}>
      <header className="flex items-center justify-between">
        <h3 className="font-heading text-base leading-6 font-medium tracking-[-0.32px]">Summary</h3>
        <span className="text-xs leading-4 font-light">{selectedCount.toLocaleString()} selected</span>
      </header>
      <ul className="flex flex-col">
        {plan.processIds.length === 0 && (
          <li>
            <Status tone="error" className={cn(captionStatus, 'text-vt-error')}>
              None of the selected requests are eligible for this action
            </Status>
          </li>
        )}
        {plan.outcome.map((g) => (
          <GroupRow key={g.key} group={g} />
        ))}
        {plan.skipped.map((g) => (
          <GroupRow key={`skip-${g.key}`} group={g} filterable />
        ))}
      </ul>
    </section>
  )
}

/** A bordered box of outcome rows under a heading, per the Figma progress flow (skipped requests). */
export function GroupBox({
  title,
  groups,
  filterable,
  className,
}: {
  title: string
  groups: PlanGroup[]
  /** Skipped groups get a button under their list that opens them as a filtered view. */
  filterable?: boolean
  className?: string
}) {
  return (
    <section className={cn('flex flex-col gap-1 rounded border border-vt-border px-4 py-[15px] text-vt-dark-text', className)}>
      <h3 className="font-heading text-base leading-6 font-medium tracking-[-0.32px]">{title}</h3>
      <ul className="flex flex-col">
        {groups.map((g) => (
          <GroupRow key={g.key} group={g} filterable={filterable} />
        ))}
      </ul>
    </section>
  )
}
