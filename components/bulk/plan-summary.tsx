'use client'

import * as React from 'react'

import { Status } from '@/components/ui/status'
import type { Plan, PlanGroup } from '@/lib/actions'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

/**
 * Figma Status at default size is caption text (12/16) with a 4px gap and a 32px min box;
 * the Vitreus copy here renders 14/20 with an 8px gap, so the summary overrides it.
 */
const captionStatus = 'min-h-8 gap-1 text-xs leading-4'

/** Each outcome tone maps to a Vitreus Status tone. */
const statusTone = { success: 'success', info: 'information', warning: 'warning' } as const

/** The requests in one outcome group, shown when its View link is open. */
function GroupRequests({ group }: { group: PlanGroup }) {
  const { byId } = useStore()
  const shown = group.ids.slice(0, 50)
  return (
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
  )
}

/** One row: a caption-size Status with the outcome as its label, View on the right. */
export function GroupRow({ group }: { group: PlanGroup }) {
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
          <GroupRequests group={group} />
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
          <GroupRow key={`skip-${g.key}`} group={g} />
        ))}
      </ul>
    </section>
  )
}

/** A bordered box of outcome rows under a heading, per the Figma progress flow (skipped requests). */
export function GroupBox({ title, groups, className }: { title: string; groups: PlanGroup[]; className?: string }) {
  return (
    <section className={cn('flex flex-col gap-1 rounded border border-vt-border px-4 py-[15px] text-vt-dark-text', className)}>
      <h3 className="font-heading text-base leading-6 font-medium tracking-[-0.32px]">{title}</h3>
      <ul className="flex flex-col">
        {groups.map((g) => (
          <GroupRow key={g.key} group={g} />
        ))}
      </ul>
    </section>
  )
}
