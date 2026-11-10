'use client'

import * as React from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip } from '@/components/common'
import { computePlan, type ActionId } from '@/lib/actions'
import { MAX_SELECTION } from '@/lib/store'
import type { DsarRequest } from '@/lib/types'
import { cn } from '@/lib/utils'

export type BulkMenuAction = ActionId | 'public-comment' | 'internal-comment'

/**
 * Contextual bulk action panel, attached to the top of the table card. Matching the DSAR Figma file ("Bulk Action Panel", node 4306:6360):
 * a 90px #e8f1f6 band, content right-aligned with an 8px gap. It holds the selection count over a
 * blue "select all" link, secondary Assign and Extend buttons, a bordered overflow icon button,
 * and a trailing close button.
 */
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
  onAction: (action: BulkMenuAction) => void
}) {
  const cap = Math.min(totalInView, MAX_SELECTION)
  const showSelectAll = selected.length < cap
  const overCap = totalInView > MAX_SELECTION
  const allStandard = selected.every((r) => r.flag === null)
  const canComplete = React.useMemo(() => computePlan('complete', {}, selected).processIds.length > 0, [selected])
  const anyWithout = (flag: 'confirmed' | 'suspected') => selected.some((r) => r.flag !== flag)

  const selectLink = (
    <button
      type="button"
      onClick={onSelectCap}
      className="rounded-sm font-heading text-sm leading-5 font-medium text-vt-information outline-none hover:underline focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
    >
      {overCap ? `Select ${MAX_SELECTION} items` : `Select all ${totalInView.toLocaleString()} items`}
    </button>
  )

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="flex h-[90px] shrink-0 items-center justify-end gap-2 rounded-t border border-b-0 border-vt-border bg-vt-information-light px-6"
    >
      <div className="flex items-center gap-2">
        <div className="flex w-36 flex-col items-center">
          <span aria-live="polite" className="font-heading text-sm leading-5 font-medium text-vt-dark-text">
            {selected.length.toLocaleString()} selected
          </span>
          {showSelectAll &&
            (overCap ? (
              <Tooltip
                content={`Bulk actions run on up to ${MAX_SELECTION} requests at a time. This selects the first ${MAX_SELECTION} requests in the current sort order.`}
              >
                {selectLink}
              </Tooltip>
            ) : (
              selectLink
            ))}
        </div>

        <Button variant="secondary" onClick={() => onAction('assign')}>
          Assign
        </Button>
        <Button variant="secondary" onClick={() => onAction('extend')}>
          Extend
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="More bulk actions"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'icon' }),
                'border-vt-secondary-2 bg-vt-secondary-3 hover:bg-vt-surface data-[state=open]:bg-vt-surface',
              )}
            >
              <Icon name="ellipsis" size={24} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[70vh] w-72 overflow-y-auto">
            <DropdownMenuItem onSelect={() => onAction('reject')}>Reject</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAction('close')}>Close</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAction('mark-unread')}>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem
              disabled={allStandard}
              description={allStandard ? 'Selected requests are already standard' : undefined}
              onSelect={() => onAction('move-to-standard')}
            >
              Move to standard queue
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!canComplete}
              description={canComplete ? undefined : 'None of the selected requests can be completed'}
              onSelect={() => onAction('complete')}
            >
              Complete
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAction('public-comment')}>Public comment</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAction('internal-comment')}>Internal comment</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAction('change-workflow')}>Change workflow</DropdownMenuItem>
            {(anyWithout('confirmed') || anyWithout('suspected')) && <DropdownMenuSeparator />}
            {anyWithout('confirmed') && (
              <DropdownMenuItem onSelect={() => onAction('flag-confirmed')}>Flag as confirmed automation</DropdownMenuItem>
            )}
            {anyWithout('suspected') && (
              <DropdownMenuItem onSelect={() => onAction('flag-suspected')}>Flag as suspect automation</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex h-10 items-center pl-2">
        <Button variant="ghost" size="icon" aria-label="Clear selection" onClick={onClear} className="text-vt-dark-text">
          <Icon name="xmark" />
        </Button>
      </div>
    </div>
  )
}
