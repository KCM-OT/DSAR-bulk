'use client'

import * as React from 'react'

import { Icon } from '@/components/ui/icon'
import { iconData } from '@/components/ui/icon-data'
import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ AI footprint": a single 12/16 row with the blue-to-violet
 * sparkle indicator, a light grey disclaimer that truncates, an optional
 * trailing action (link, external link or button) and an optional "Clear".
 */

interface AIIndicatorProps {
  size?: 16 | 20 | 24
  className?: string
}

function AIIndicator({ size = 16, className }: AIIndicatorProps) {
  const gradientId = `ai-indicator-${React.useId().replace(/:/g, '')}`
  const glyph = iconData.sparkles.filled
  // iconData centres each glyph in a 48-unit artboard, so crop back to the glyph bounds
  // to make the indicator fill its 16/20/24px box exactly as the design specifies.
  const offset = Number(glyph.viewBox.split(' ')[0])
  const glyphExtent = 48 + 2 * offset

  return (
    <svg
      aria-hidden
      data-slot="ai-indicator"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${glyphExtent} ${glyphExtent}`}
      width={size}
      height={size}
      className={cn('shrink-0', className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--vt-ai-start)' }} />
          <stop offset="1" style={{ stopColor: 'var(--vt-ai-end)' }} />
        </linearGradient>
      </defs>
      <path d={glyph.path} fill={`url(#${gradientId})`} />
    </svg>
  )
}

type AIFootprintLink = 'none' | 'link' | 'external' | 'button'

interface AIFootprintProps {
  message: string
  link?: AIFootprintLink
  linkLabel?: string
  href?: string
  onLinkClick?: () => void
  clearable?: boolean
  onClear?: () => void
  className?: string
}

const actionClass =
  'rounded-sm font-sans text-xs leading-4 font-medium whitespace-nowrap text-vt-link-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-offset-2'

function AIFootprint({
  message,
  link = 'none',
  linkLabel,
  href = '#',
  onLinkClick,
  clearable,
  onClear,
  className,
}: AIFootprintProps) {
  return (
    <div
      data-slot="ai-footprint"
      className={cn('flex w-full items-center justify-between gap-8 font-sans', className)}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <AIIndicator size={16} />
        <span className="min-w-0 truncate text-xs leading-4 font-light text-vt-grey-text">{message}</span>
        {link === 'link' && linkLabel ? (
          <a href={href} onClick={onLinkClick} className={actionClass}>
            {linkLabel}
          </a>
        ) : null}
        {link === 'external' && linkLabel ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onLinkClick}
            className={cn(actionClass, 'inline-flex items-center gap-1')}
          >
            {linkLabel}
            <Icon name="external-link" size={12} />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : null}
        {link === 'button' && linkLabel ? (
          <button type="button" onClick={onLinkClick} className={actionClass}>
            {linkLabel}
          </button>
        ) : null}
      </div>
      {clearable ? (
        <button type="button" onClick={onClear} className={actionClass}>
          Clear
        </button>
      ) : null}
    </div>
  )
}

export { AIFootprint, AIIndicator, type AIFootprintProps, type AIFootprintLink }
