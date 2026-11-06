'use client'

import * as React from 'react'

import { Icon } from '@/components/ui/icon'
import type { Plan, PlanGroup } from '@/lib/actions'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const toneIcon = {
  success: { name: 'circle-check', className: 'text-vt-status-success' },
  info: { name: 'circle-info', className: 'text-vt-information' },
  warning: { name: 'triangle-exclamation', className: 'text-vt-warning' },
} as const

function GroupRow({ group }: { group: PlanGroup }) {
  const { byId } = useStore()
  const [open, setOpen] = React.useState(false)
  const icon = toneIcon[group.tone]
  const shown = group.ids.slice(0, 50)
  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <Icon name={icon.name} variant="filled" size={16} className={cn('mt-0.5', icon.className)} />
        <span className="flex-1 text-sm leading-5">{group.text}</span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="shrink-0 text-sm leading-5 text-vt-information hover:underline"
        >
          {open ? 'Hide' : 'View'}
        </button>
      </div>
      {open && (
        <div className="ml-6 max-h-40 overflow-auto rounded border border-vt-border bg-vt-table-header">
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
      )}
    </li>
  )
}

export function PlanSummary({ plan, selectedCount, className }: { plan: Plan; selectedCount: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3 rounded border border-vt-border p-4', className)}>
      <div className="flex items-baseline justify-between">
        <h3 className="font-heading text-base font-medium">Summary</h3>
        <span className="text-xs font-light text-vt-grey-text">{selectedCount.toLocaleString()} selected</span>
      </div>
      {plan.processIds.length === 0 && (
        <p className="flex items-start gap-2 text-sm text-vt-error">
          <Icon name="circle-exclamation" variant="filled" className="mt-0.5" />
          None of the selected requests are eligible for this action.
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {plan.outcome.map((g) => (
          <GroupRow key={g.key} group={g} />
        ))}
        {plan.skipped.map((g) => (
          <GroupRow key={`skip-${g.key}`} group={g} />
        ))}
      </ul>
    </div>
  )
}
