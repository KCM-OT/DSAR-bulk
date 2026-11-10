'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Bot, ShieldQuestion } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AutomationFlag, Stage } from '@/lib/types'

/** Minimal tooltip in Vitreus styling (dark surface, 12/16 text). Vitreus has no tooltip item yet. */
export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}) {
  if (!content) return <>{children}</>
  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className="z-[70] max-w-72 rounded bg-vt-dark-text px-2 py-1 font-sans text-xs leading-4 text-vt-light-text shadow-e2"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-vt-dark-text" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

/**
 * Stage pills from the Figma table (DSAR 4548:7582): tinted fill, coloured border, medium uppercase label.
 * Figma defines five: Unverified, Rejected-en-US-edited, In progress, Complete and Verify request.
 * The remaining stages only appear after actions in the prototype and reuse the closest Figma style.
 */
const stageTone: Record<Stage, string> = {
  New: 'border-vt-link-text bg-vt-secondary-3',
  Unverified: 'border-vt-risk-very-low bg-vt-risk-very-low-light',
  'Verifying identity': 'border-vt-risk-medium bg-vt-risk-medium-light',
  'In progress': 'border-vt-link-text bg-vt-secondary-3',
  'Awaiting data': 'border-vt-link-text bg-vt-secondary-3',
  Complete: 'border-vt-risk-low bg-vt-risk-low-light',
  Rejected: 'border-vt-risk-very-high bg-vt-risk-very-high-light',
  Closed: 'border-vt-risk-very-low bg-vt-risk-very-low-light',
  Expired: 'border-vt-risk-very-high bg-vt-risk-very-high-light',
}

/** Display labels from the Figma badges; stages not in the design keep their own name. */
export const STAGE_LABEL: Partial<Record<Stage, string>> = {
  'Verifying identity': 'Verify request',
  Rejected: 'Rejected-en-US-edited',
}

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-[20px] border px-2 font-sans text-xs leading-4 font-medium whitespace-nowrap text-vt-dark-text uppercase',
        stageTone[stage],
        className,
      )}
    >
      {STAGE_LABEL[stage] ?? stage}
    </span>
  )
}

export function FlagBadge({ flag, className }: { flag: AutomationFlag; className?: string }) {
  if (!flag) return <span className="text-vt-grey-text">---</span>
  const confirmed = flag === 'confirmed'
  return (
    <Badge variant={confirmed ? 'purple' : 'warning'} size="small" tabIndex={-1} className={cn('gap-1', className)}>
      {confirmed ? <Bot className="mr-1 inline size-3 align-[-2px]" aria-hidden /> : <ShieldQuestion className="mr-1 inline size-3 align-[-2px]" aria-hidden />}
      {confirmed ? 'Confirmed automation' : 'Suspected automation'}
    </Badge>
  )
}

export function ProgressBar({ value, tone = 'info' }: { value: number; tone?: 'info' | 'success' | 'warning' | 'error' }) {
  const color = {
    info: 'bg-vt-information',
    success: 'bg-vt-status-success',
    warning: 'bg-vt-warning',
    error: 'bg-vt-error',
  }[tone]
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className="h-2 w-full overflow-hidden rounded-full bg-[#e5e5e5]"
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', color)} style={{ width: `${value}%` }} />
    </div>
  )
}
