'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Loading": a three-quarter ring that spins. Default uses
 * Primary 2 over a #e6efe9 track; the AI type uses the blue-to-violet gradient
 * with the same gradient at 35% opacity as the track. Sizes are 18, 45 and 100px.
 */
const spinnerSizes = { sm: 18, md: 45, lg: 100 } as const

interface LoadingProps {
  size?: keyof typeof spinnerSizes
  type?: 'default' | 'ai'
  showMessage?: boolean
  message?: string
  className?: string
}

function Loading({ size = 'md', type = 'default', showMessage, message = 'Loading...', className }: LoadingProps) {
  const gradientId = `loading-${React.useId().replace(/:/g, '')}`
  const diameter = spinnerSizes[size]
  const strokeWidth = Math.max(2, Math.round(diameter * 0.1))
  const radius = (diameter - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const isAi = type === 'ai'
  const stroke = isAi ? `url(#${gradientId})` : undefined

  return (
    <div
      role="status"
      aria-live="polite"
      data-slot="loading"
      className={cn('inline-flex flex-col items-center justify-center gap-2 p-2', className)}
    >
      <svg
        aria-hidden
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        className="animate-spin motion-reduce:animate-none"
      >
        {isAi && (
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" style={{ stopColor: 'var(--vt-ai-start)' }} />
              <stop offset="1" style={{ stopColor: 'var(--vt-ai-end)' }} />
            </linearGradient>
          </defs>
        )}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={stroke}
          opacity={isAi ? 0.35 : undefined}
          className={isAi ? undefined : 'stroke-[#e6efe9]'}
        />
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={stroke}
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          transform={`rotate(-90 ${diameter / 2} ${diameter / 2})`}
          className={isAi ? undefined : 'stroke-vt-primary-2'}
        />
      </svg>
      {showMessage ? (
        <span className="font-sans text-sm leading-5 font-light text-vt-grey-text">{message}</span>
      ) : (
        <span className="sr-only">{message}</span>
      )}
    </div>
  )
}

export { Loading }
