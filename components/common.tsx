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

/** Outlined stage pills from the queue table design: tinted fill, coloured border, dark uppercase label. */
const stageTone: Record<Stage, string> = {
  New: 'border-vt-information bg-vt-information-light',
  Unverified: 'border-vt-grey-text bg-vt-background',
  'Verifying identity': 'border-vt-warning bg-vt-warning-light',
  'In progress': 'border-vt-information bg-vt-information-light',
  'Awaiting data': 'border-vt-graphic-2 bg-[#f2eef9]',
  Complete: 'border-vt-success bg-vt-success-light',
  Rejected: 'border-vt-error bg-vt-error-light',
  Closed: 'border-vt-grey-text bg-vt-background',
  Expired: 'border-vt-risk-high bg-vt-risk-high-light',
}

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full border px-2 font-sans text-xs leading-4 font-normal whitespace-nowrap text-vt-dark-text uppercase',
        stageTone[stage],
        className,
      )}
    >
      {stage}
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
