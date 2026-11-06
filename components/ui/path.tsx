'use client'

import * as React from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Path" and "❖ .Path/Item": chevron-shaped steps, 34px
 * tall. Completed #5c9cb9, current #1470a9 (white label) and incomplete
 * #cee1ea, which darkens to #5c9cb9 on hover. The first step has a rounded
 * start, the last a rounded end; middle steps are notched on both sides.
 */
type PathItemStatus = 'completed' | 'current' | 'incomplete'
type PathItemPosition = 'first' | 'middle' | 'last' | 'only'

const NOTCH = '12px'

const clipPaths: Record<PathItemPosition, string> = {
  first: `polygon(0 0, calc(100% - ${NOTCH}) 0, 100% 50%, calc(100% - ${NOTCH}) 100%, 0 100%)`,
  middle: `polygon(0 0, calc(100% - ${NOTCH}) 0, 100% 50%, calc(100% - ${NOTCH}) 100%, 0 100%, ${NOTCH} 50%)`,
  last: `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${NOTCH} 50%)`,
  only: 'none',
}

const roundedEnds: Record<PathItemPosition, string> = {
  first: 'rounded-l-full',
  middle: '',
  last: 'rounded-r-full',
  only: 'rounded-full',
}

const statusClasses: Record<PathItemStatus, string> = {
  completed: 'bg-vt-information-mid text-vt-dark-text',
  current: 'bg-vt-information text-vt-light-text',
  incomplete: 'bg-vt-secondary-2 text-vt-dark-text hover:bg-vt-information-mid',
}

const focusFilter =
  '[filter:drop-shadow(0_0_1px_var(--vt-information))_drop-shadow(0_0_1px_var(--vt-information))_drop-shadow(0_0_1px_var(--vt-information))]'

interface PathItemProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  label: string
  status?: PathItemStatus
  position?: PathItemPosition
  visualState?: 'default' | 'hover' | 'focus'
}

function PathItem({
  label,
  status = 'incomplete',
  position = 'middle',
  visualState = 'default',
  className,
  ...props
}: PathItemProps) {
  const overlap = position === 'first' || position === 'only' ? '' : '-ml-3'
  return (
    <li
      className={cn('flex min-w-0 flex-1', overlap, 'has-[:focus-visible]:z-10', `has-[:focus-visible]:${focusFilter}`, visualState === 'focus' && `z-10 ${focusFilter}`)}
    >
      <button
        type="button"
        aria-current={status === 'current' ? 'step' : undefined}
        data-status={status}
        style={{ clipPath: clipPaths[position] }}
        className={cn(
          'h-[34px] w-full min-w-0 truncate font-heading text-base leading-6 font-medium outline-none transition-colors',
          position === 'first' && 'pr-4 pl-3',
          position === 'middle' && 'px-5',
          position === 'last' && 'pr-3 pl-5',
          position === 'only' && 'px-4',
          roundedEnds[position],
          statusClasses[status],
          visualState === 'hover' && status !== 'current' && 'bg-vt-information-mid',
          className,
        )}
        {...props}
      >
        {label}
      </button>
    </li>
  )
}

interface PathProps {
  steps: string[]
  current?: number
  defaultCurrent?: number
  onStepChange?: (index: number) => void
  showPaging?: boolean
  showAdvance?: boolean
  advanceLabel?: string
  onAdvance?: () => void
  className?: string
}

function Path({
  steps,
  current,
  defaultCurrent = 0,
  onStepChange,
  showPaging,
  showAdvance,
  advanceLabel = 'Advance',
  onAdvance,
  className,
}: PathProps) {
  const [internal, setInternal] = React.useState(defaultCurrent)
  const active = current ?? internal
  const go = (index: number) => {
    const next = Math.min(Math.max(index, 0), steps.length - 1)
    setInternal(next)
    onStepChange?.(next)
  }

  return (
    <div data-slot="path" className={cn('flex w-full flex-col items-center gap-4 bg-vt-surface py-6', className)}>
      {showPaging && (
        <div aria-hidden className="flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <span
              key={step}
              className={cn('size-2.5 rounded-full', index === active ? 'bg-vt-information' : 'bg-vt-secondary-2')}
            />
          ))}
        </div>
      )}
      <div className="flex w-full items-center gap-2 px-2">
        {showPaging && (
          <button
            type="button"
            aria-label="Previous step"
            disabled={active === 0}
            onClick={() => go(active - 1)}
            className="grid size-8 shrink-0 place-items-center rounded outline-none hover:bg-vt-information-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring disabled:pointer-events-none disabled:text-vt-empty"
          >
            <Icon name="chevron-left" size={16} />
          </button>
        )}
        <ol className="flex min-w-0 flex-1" aria-label="Progress">
          {steps.map((label, index) => (
            <PathItem
              key={label}
              label={label}
              status={index < active ? 'completed' : index === active ? 'current' : 'incomplete'}
              position={steps.length === 1 ? 'only' : index === 0 ? 'first' : index === steps.length - 1 ? 'last' : 'middle'}
              onClick={() => go(index)}
            />
          ))}
        </ol>
        {showPaging && (
          <button
            type="button"
            aria-label="Next step"
            disabled={active === steps.length - 1}
            onClick={() => go(active + 1)}
            className="grid size-8 shrink-0 place-items-center rounded outline-none hover:bg-vt-information-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring disabled:pointer-events-none disabled:text-vt-empty"
          >
            <Icon name="chevron-right" size={16} />
          </button>
        )}
        {showAdvance && (
          <button
            type="button"
            onClick={() => (onAdvance ? onAdvance() : go(active + 1))}
            className="shrink-0 rounded px-3 py-1 font-heading text-base leading-6 font-medium text-vt-primary-1 outline-none hover:bg-vt-success-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
          >
            {advanceLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export { Path, PathItem }
export type { PathItemPosition, PathItemStatus }
