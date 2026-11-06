'use client'

import * as React from 'react'

import { AIIndicator } from '@/components/ui/ai-footprint'
import { Icon, type IconName } from '@/components/ui/icon'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Banner": a 4px radius bar with a bordered white surface,
 * or, with AI on, the blue-to-violet 8% wash and #d4daf5 border plus a sparkle
 * indicator. Notification banners are a single header row; container banners
 * add a 32px expand control, a content slot and a footer slot with a top
 * border. Small, medium and large step the title through 12/16, 14/20 and
 * 16/24 and the indicator through 16, 20 and 24.
 */

type BannerType = 'notification' | 'container'
type BannerSize = 'small' | 'medium' | 'large'

const sizeStyles = {
  small: { title: 'text-xs leading-4', link: 'text-xs leading-4', indicator: 16, notificationPad: 'py-1' },
  medium: { title: 'text-sm leading-5', link: 'text-sm leading-5', indicator: 20, notificationPad: 'py-2' },
  large: { title: 'text-base leading-6', link: 'text-base leading-6', indicator: 24, notificationPad: 'py-2' },
} as const

interface BannerProps {
  type?: BannerType
  size?: BannerSize
  ai?: boolean
  title: React.ReactNode
  linkLabel?: string
  linkHref?: string
  onLinkClick?: () => void
  toggleLabel?: string
  toggleChecked?: boolean
  defaultToggleChecked?: boolean
  onToggleChange?: (checked: boolean) => void
  onRefresh?: () => void
  onMore?: () => void
  onClose?: () => void
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  content?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

function BannerIconButton({
  icon,
  label,
  onClick,
  size = 24,
  className,
}: {
  icon: IconName
  label: string
  onClick?: () => void
  size?: number
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-vt-dark-text outline-none transition-colors hover:bg-black/5',
        'focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-offset-2',
        className,
      )}
    >
      <Icon name={icon} size={size} />
    </button>
  )
}

function Banner({
  type = 'notification',
  size = 'medium',
  ai = false,
  title,
  linkLabel,
  linkHref,
  onLinkClick,
  toggleLabel,
  toggleChecked,
  defaultToggleChecked = false,
  onToggleChange,
  onRefresh,
  onMore,
  onClose,
  expanded,
  defaultExpanded = true,
  onExpandedChange,
  content,
  footer,
  className,
}: BannerProps) {
  const ids = React.useId()
  const titleId = `${ids}-title`
  const bodyId = `${ids}-body`
  const toggleId = `${ids}-toggle`
  const styles = sizeStyles[size]
  const isContainer = type === 'container'

  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded)
  const isExpanded = expanded ?? internalExpanded

  function toggleExpanded() {
    const next = !isExpanded
    if (expanded === undefined) setInternalExpanded(next)
    onExpandedChange?.(next)
  }

  const linkClass = cn(
    'rounded-sm font-sans font-medium whitespace-nowrap text-vt-link-text outline-none hover:underline',
    'focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-offset-2',
    styles.link,
  )

  return (
    <section
      aria-labelledby={titleId}
      data-slot="banner"
      data-type={type}
      data-ai={ai || undefined}
      className={cn(
        'flex w-full flex-col gap-2 rounded border px-4 font-sans',
        isContainer ? 'py-2' : styles.notificationPad,
        ai
          ? 'border-vt-ai-border bg-[linear-gradient(to_left,rgb(7_136_247/0.08)_25%,rgb(151_111_230/0.08)_100%)]'
          : 'border-vt-border bg-vt-surface',
        className,
      )}
    >
      <div className={cn('flex flex-wrap items-center gap-x-8 gap-y-2', isContainer ? 'min-h-8' : 'min-h-6')}>
        <div className="flex min-w-40 flex-1 items-center gap-2">
          {isContainer ? (
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={bodyId}
              aria-label={isExpanded ? 'Collapse banner' : 'Expand banner'}
              onClick={toggleExpanded}
              className={cn(
                'inline-flex size-8 shrink-0 items-center justify-center rounded-sm text-vt-dark-text outline-none transition-colors hover:bg-black/5',
                'focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-offset-2',
              )}
            >
              <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={24} />
            </button>
          ) : null}
          {ai ? <AIIndicator size={styles.indicator} /> : null}
          <span id={titleId} className={cn('min-w-0 truncate font-light text-vt-dark-text', styles.title)}>
            {title}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {linkLabel ? (
            <a href={linkHref ?? '#'} onClick={onLinkClick} className={linkClass}>
              {linkLabel}
            </a>
          ) : null}
          {toggleLabel ? (
            <div className="flex items-center gap-2">
              <label htmlFor={toggleId} className="cursor-pointer text-sm leading-5 font-light text-vt-dark-text">
                {toggleLabel}
              </label>
              <Switch
                id={toggleId}
                checked={toggleChecked}
                defaultChecked={toggleChecked === undefined ? defaultToggleChecked : undefined}
                onCheckedChange={onToggleChange}
              />
            </div>
          ) : null}
          {onRefresh ? <BannerIconButton icon="refresh" label="Refresh" onClick={onRefresh} /> : null}
          {onMore ? <BannerIconButton icon="ellipsis" label="More actions" onClick={onMore} /> : null}
          {onClose ? <BannerIconButton icon="xmark" label="Dismiss banner" onClick={onClose} /> : null}
        </div>
      </div>

      {isContainer ? (
        <div id={bodyId} hidden={!isExpanded} className="flex flex-col gap-2">
          <div className="min-h-12 text-sm leading-5 font-light text-vt-dark-text">{content}</div>
          {footer ? (
            <div className="border-t border-vt-border py-2 text-sm leading-5 font-light text-vt-dark-text">
              {footer}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export { Banner, type BannerProps, type BannerType, type BannerSize }
