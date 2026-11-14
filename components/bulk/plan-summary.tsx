'use client'

import * as React from 'react'

import { List, ListItem } from '@/components/ui/list'
import { Status } from '@/components/ui/status'
import type { Plan, PlanGroup } from '@/lib/actions'
import { useStore } from '@/lib/store'

/** Restyles the ListItem title (heading font, medium) as light body text, matching the modal's other copy. */
const lightRow = '[&_.font-heading]:font-sans [&_.font-heading]:font-light [&_.font-heading]:text-sm [&_.font-heading]:leading-5'

/** Each outcome tone maps to a Vitreus Status tone; the label is for screen readers only. */
const toneStatus = {
  success: { tone: 'success', label: 'Will be processed' },
  info: { tone: 'information', label: 'Note' },
  warning: { tone: 'warning', label: 'Skipped' },
} as const

function StatusDot({ tone, label }: { tone: 'success' | 'information' | 'warning' | 'error'; label: string }) {
  return (
    <Status tone={tone}>
      <span className="sr-only">{label}</span>
    </Status>
  )
}

function GroupRows({ group }: { group: PlanGroup }) {
  const { byId } = useStore()
  const [open, setOpen] = React.useState(false)
  const status = toneStatus[group.tone]
  const shown = group.ids.slice(0, 50)
  return (
    <>
      <ListItem
        title={group.text}
        className={lightRow}
        leading={<StatusDot tone={status.tone} label={status.label} />}
        trailing={
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="text-sm leading-5 text-vt-information hover:underline"
          >
            {open ? 'Hide' : 'View'}
          </button>
        }
      />
      {open && (
        <li className="border-b border-vt-border px-4 pb-4 last:border-b-0">
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
            {group.ids.length > shown.length && (
              <p className="px-2 py-1 text-xs text-vt-grey-text">and {group.ids.length - shown.length} more</p>
            )}
          </div>
        </li>
      )}
    </>
  )
}

/** The outcome of a bulk action, built from the Vitreus List (sparse) with a Status dot on each row. */
export function PlanSummary({ plan, selectedCount, className }: { plan: Plan; selectedCount: number; className?: string }) {
  return (
    <List title="Summary" caption={`${selectedCount.toLocaleString()} selected`} density="sparse" className={className}>
      {plan.processIds.length === 0 && (
        <ListItem
          title="None of the selected requests are eligible for this action."
          className={lightRow}
          leading={<StatusDot tone="error" label="Error" />}
        />
      )}
      {plan.outcome.map((g) => (
        <GroupRows key={g.key} group={g} />
      ))}
      {plan.skipped.map((g) => (
        <GroupRows key={`skip-${g.key}`} group={g} />
      ))}
    </List>
  )
}
