import * as React from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Progress Indicator": two to eight steps on a 64px
 * rhythm. Completed steps are a filled #1470a9 dot with a check, the current
 * step a white-centred ring, and upcoming steps a small #dddddd dot. The line
 * is blue up to the current step and #dddddd after it.
 */
interface ProgressIndicatorProps {
  steps: number
  current: number
  labels?: string[]
  showLabels?: boolean
  className?: string
}

function ProgressIndicator({ steps, current, labels, showLabels, className }: ProgressIndicatorProps) {
  const count = Math.min(Math.max(steps, 2), 8)
  return (
    <ol
      data-slot="progress-indicator"
      aria-label={`Step ${current + 1} of ${count}`}
      className={cn('flex font-sans', className)}
    >
      {Array.from({ length: count }, (_, index) => {
        const status = index < current ? 'completed' : index === current ? 'current' : 'upcoming'
        const label = labels?.[index] ?? `Step ${index + 1}`
        return (
          <li
            key={index}
            aria-current={status === 'current' ? 'step' : undefined}
            className="relative flex w-16 flex-col items-center gap-2"
          >
            {index < count - 1 && (
              <span
                aria-hidden
                className={cn(
                  'absolute top-[7px] left-1/2 h-0.5 w-full',
                  index < current ? 'bg-vt-information' : 'bg-[#dddddd]',
                )}
              />
            )}
            <span className="relative z-10 grid h-4 place-items-center">
              {status === 'completed' && (
                <span className="grid size-3.5 place-items-center rounded-full bg-vt-information text-vt-light-text">
                  <Icon name="check" size={8} />
                </span>
              )}
              {status === 'current' && <span className="size-4 rounded-full border-4 border-vt-information bg-vt-surface" />}
              {status === 'upcoming' && <span className="size-2 rounded-full bg-[#dddddd]" />}
            </span>
            {showLabels ? (
              <span className={cn('text-base leading-6 whitespace-nowrap text-vt-dark-text', status === 'current' ? 'font-medium' : 'font-light')}>
                {label}
              </span>
            ) : (
              <span className="sr-only">{label}</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export { ProgressIndicator }
