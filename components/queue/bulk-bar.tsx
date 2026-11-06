'use client'

import * as React from 'react'
import { Bot, ShieldQuestion } from 'lucide-react'

import { BulkActionPanel } from '@/components/ui/bulk-action-panel'
import { Button, buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip } from '@/components/common'
import { computePlan, type ActionId } from '@/lib/actions'
import { MAX_SELECTION } from '@/lib/store'
import type { DsarRequest } from '@/lib/types'

export function BulkBar({
  selected,
  totalInView,
  onSelectCap,
  onClear,
  onAction,
}: {
  selected: DsarRequest[]
  totalInView: number
  onSelectCap: () => void
  onClear: () => void
  onAction: (action: ActionId) => void
}) {
  const completePlan = React.useMemo(() => computePlan('complete', {}, selected), [selected])
  const canComplete = completePlan.processIds.length > 0

  const anyWithout = (flag: 'confirmed' | 'suspected') => selected.some((r) => r.flag !== flag)
  const anyWith = (flag: 'confirmed' | 'suspected') => selected.some((r) => r.flag === flag)

  const cap = Math.min(totalInView, MAX_SELECTION)
  const showSelectAll = selected.length < cap
  const selectLabel =
    totalInView > MAX_SELECTION ? (
      <Tooltip
        content={`Bulk actions run on up to ${MAX_SELECTION} requests at a time. This selects the first ${MAX_SELECTION} requests in the current sort order.`}
      >
        <span>Select {MAX_SELECTION} items</span>
      </Tooltip>
    ) : (
      `Select all ${totalInView} items`
    )

  return (
    <BulkActionPanel
      selectedCount={selected.length}
      totalCount={totalInView}
      onSelectAll={onSelectCap}
      showSelectAll={showSelectAll}
      selectAllLabel={selectLabel}
      onClear={onClear}
      className="sticky top-0 z-20 border-b border-vt-border py-3"
    >
      <Button variant="ghost" onClick={() => onAction('assign')}>
        Assign
      </Button>
      <Button variant="ghost" onClick={() => onAction('extend')}>
        Extend
      </Button>
      <Button variant="ghost" onClick={() => onAction('comment')}>
        Add comment
      </Button>
      <Button variant="ghost" onClick={() => onAction('change-workflow')}>
        Change workflow
      </Button>
      <Tooltip
        content={
          canComplete
            ? undefined
            : "None of the selected requests can be completed. They're already complete, in an ineligible stage, or have incomplete required subtasks."
        }
      >
        <span tabIndex={canComplete ? undefined : 0}>
          <Button variant="ghost" disabled={!canComplete} onClick={() => onAction('complete')}>
            Complete
          </Button>
        </span>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label="More bulk actions">
            <Icon name="ellipsis" size={24} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 [&_[data-slot=dropdown-menu-item]]:whitespace-nowrap">
          <DropdownMenuLabel>Automation flag</DropdownMenuLabel>
          {anyWithout('confirmed') && (
            <DropdownMenuItem inGroup onSelect={() => onAction('flag-confirmed')}>
              <span className="flex items-center gap-2">
                <Bot className="size-4 text-vt-graphic-2" /> Flag as confirmed automation
              </span>
            </DropdownMenuItem>
          )}
          {anyWithout('suspected') && (
            <DropdownMenuItem inGroup onSelect={() => onAction('flag-suspected')}>
              <span className="flex items-center gap-2">
                <ShieldQuestion className="size-4 text-vt-warning" /> Flag as suspected automation
              </span>
            </DropdownMenuItem>
          )}
          {anyWith('confirmed') && (
            <DropdownMenuItem inGroup onSelect={() => onAction('remove-confirmed')}>
              <span className="flex items-center gap-2"><span className="size-4" />Remove confirmed automation flag</span>
            </DropdownMenuItem>
          )}
          {anyWith('suspected') && (
            <DropdownMenuItem inGroup onSelect={() => onAction('remove-suspected')}>
              <span className="flex items-center gap-2"><span className="size-4" />Remove suspected automation flag</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem inGroup onSelect={() => onAction('reject')}>
            Reject
          </DropdownMenuItem>
          <DropdownMenuItem inGroup onSelect={() => onAction('close')}>
            Close
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem inGroup onSelect={() => onAction('mark-read')}>
            Mark as read
          </DropdownMenuItem>
          <DropdownMenuItem inGroup onSelect={() => onAction('mark-unread')}>
            Mark as unread
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </BulkActionPanel>
  )
}
