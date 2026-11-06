'use client'

import * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Card", "❖ KPI card", "❖ Navigation card",
 * "❖ Selection card" and "❖ Action card". Cards are 4px radius, white, with
 * the e1 elevation. Hover and active tint to #f0f6f1 with a Primary 2 border;
 * selected deepens to #e7f0ea; attention uses the warning tones.
 */
type CardState = 'default' | 'hover' | 'active' | 'selected' | 'attention' | 'disabled'
type CardPadding = 'compact' | 'comfortable'

const stateClasses: Record<CardState, string> = {
  default: 'border-transparent',
  hover: 'border-vt-primary-2 bg-[#f0f6f1]',
  active: 'border-vt-primary-2 bg-[#f0f6f1] shadow-none',
  selected: 'border-vt-primary-2 bg-[#e7f0ea]',
  attention: 'border-vt-warning bg-vt-warning-light',
  disabled: 'border-vt-border bg-[#f5f5f5] text-[#898989]',
}

const paddingClasses: Record<CardPadding, string> = {
  compact: 'p-5',
  comfortable: 'p-6',
}

interface CardProps extends React.ComponentProps<'div'> {
  state?: CardState
  borderLeft?: boolean
  interactive?: boolean
}

function Card({ state = 'default', borderLeft, interactive, className, children, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-state={state}
      className={cn(
        'relative flex flex-col overflow-hidden rounded border bg-vt-surface font-sans text-vt-dark-text shadow-e1 transition-colors',
        stateClasses[state],
        interactive &&
          state === 'default' &&
          'cursor-pointer hover:border-vt-primary-2 hover:bg-[#f0f6f1] active:shadow-none',
        className,
      )}
      {...props}
    >
      {borderLeft && <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-vt-primary-1" />}
      {children}
    </div>
  )
}

const kpiTones = {
  success: { icon: 'circle-check', className: 'text-vt-status-success' },
  warning: { icon: 'triangle-exclamation', className: 'text-vt-warning' },
  danger: { icon: 'circle-exclamation', className: 'text-vt-error' },
  info: { icon: 'circle-info', className: 'text-vt-information' },
} as const satisfies Record<string, { icon: IconName; className: string }>

interface KPICardProps {
  value: React.ReactNode
  label: string
  tone?: keyof typeof kpiTones | 'none'
  meta?: string
  className?: string
}

function KPICard({ value, label, tone = 'none', meta, className }: KPICardProps) {
  const toneConfig = tone === 'none' ? undefined : kpiTones[tone]
  return (
    <Card className={cn('min-w-36 gap-1 px-6 py-4', className)}>
      <div className="flex items-center gap-3">
        <span className="font-heading text-4xl leading-[44px] font-medium text-vt-dark-text">{value}</span>
        {toneConfig && meta && (
          <span className="inline-flex items-center gap-1.5 text-sm leading-5 font-light text-vt-grey-text">
            <Icon name={toneConfig.icon} variant="filled" size={16} className={toneConfig.className} />
            {meta}
          </span>
        )}
      </div>
      <span className="text-base leading-6 font-light text-vt-dark-text">{label}</span>
    </Card>
  )
}

interface NavigationCardProps {
  title: string
  description?: string
  href?: string
  padding?: CardPadding
  showActions?: boolean
  actions?: React.ReactNode
  state?: 'default' | 'hover' | 'active' | 'focus'
  className?: string
}

/** The whole card is one link; the actions button sits above the stretched link hit area. */
function NavigationCard({
  title,
  description,
  href = '#',
  padding = 'compact',
  showActions,
  actions,
  state = 'default',
  className,
}: NavigationCardProps) {
  return (
    <div
      data-slot="navigation-card"
      className={cn(
        'group/nav relative flex flex-col gap-2 rounded bg-vt-surface font-sans shadow-e1 transition-colors',
        'hover:bg-vt-information-light active:bg-vt-information-light active:shadow-none',
        'focus-within:ring-2 focus-within:ring-vt-focus-ring',
        state === 'hover' && 'bg-vt-information-light',
        state === 'active' && 'bg-vt-information-light shadow-none',
        state === 'focus' && 'ring-2 ring-vt-focus-ring',
        paddingClasses[padding],
        className,
      )}
    >
      {showActions && (
        <div className="relative z-10 -mt-2 -mr-2 flex justify-end">
          {actions ?? (
            <button
              type="button"
              aria-label="More actions"
              className="grid size-8 place-items-center rounded text-vt-dark-text outline-none hover:bg-vt-surface/70 focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
            >
              <Icon name="ellipsis" size={16} />
            </button>
          )}
        </div>
      )}
      <a
        href={href}
        className="flex flex-col gap-0.5 outline-none after:absolute after:inset-0 after:content-['']"
      >
        <span className="font-heading text-lg leading-6 font-light text-vt-dark-text">{title}</span>
        {description && <span className="text-sm leading-5 font-light text-vt-grey-text">{description}</span>}
      </a>
    </div>
  )
}

interface SelectionCardProps {
  type?: 'single' | 'multiple'
  title: string
  description?: string
  indicators?: React.ReactNode
  padding?: CardPadding
  name?: string
  value?: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  forceHover?: boolean
  focused?: boolean
  className?: string
}

function SelectionCard({
  type = 'single',
  title,
  description,
  indicators,
  padding = 'compact',
  name,
  value,
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
  forceHover,
  focused,
  className,
}: SelectionCardProps) {
  return (
    <label
      data-slot="selection-card"
      className={cn(
        'relative flex cursor-pointer flex-col gap-2 rounded border-2 border-transparent bg-vt-surface font-sans shadow-e1 transition-colors',
        'hover:bg-vt-information-light has-[input:checked]:border-vt-primary-2',
        'has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-vt-focus-ring',
        'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-[#f5f5f5] has-[input:disabled]:text-[#898989]',
        forceHover && 'bg-vt-information-light',
        focused && 'ring-2 ring-vt-focus-ring',
        paddingClasses[padding],
        className,
      )}
    >
      <span className="flex items-center gap-2">
        <input
          type={type === 'single' ? 'radio' : 'checkbox'}
          name={name}
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={(event) => onCheckedChange?.(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={cn(
            'grid size-4 shrink-0 place-items-center border border-vt-control-border bg-vt-surface',
            type === 'single' ? 'rounded-full' : 'rounded-sm',
            type === 'single'
              ? 'peer-checked:border-vt-primary-2 [&>*]:opacity-0 peer-checked:[&>*]:opacity-100'
              : 'peer-checked:border-vt-primary-2 peer-checked:bg-vt-primary-2 [&>*]:opacity-0 peer-checked:[&>*]:opacity-100',
          )}
        >
          {type === 'single' ? (
            <span className="size-2 rounded-full bg-vt-primary-2" />
          ) : (
            <Icon name="check" size={12} className="text-vt-light-text" />
          )}
        </span>
        <span className="flex-1" />
        {indicators}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="font-heading text-base leading-6 font-light text-vt-dark-text">{title}</span>
        {description && <span className="text-sm leading-5 font-light text-vt-grey-text">{description}</span>}
      </span>
    </label>
  )
}

const actionTitleSizes = {
  small: 'text-base leading-6 font-light',
  medium: 'text-base leading-6 font-medium',
  large: 'text-xl leading-7 font-light',
} as const

interface ActionCardProps {
  title: string
  titleSize?: keyof typeof actionTitleSizes
  padding?: CardPadding
  expandable?: boolean
  defaultOpen?: boolean
  additionalInfo?: string
  indicators?: React.ReactNode
  actions?: React.ReactNode
  footerStart?: React.ReactNode
  footerEnd?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

function ActionCard({
  title,
  titleSize = 'small',
  padding = 'compact',
  expandable,
  defaultOpen = true,
  additionalInfo,
  indicators,
  actions,
  footerStart,
  footerEnd,
  children,
  className,
}: ActionCardProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const bodyId = React.useId()
  const expanded = !expandable || open
  const hasFooter = Boolean(footerStart || footerEnd)

  return (
    <Card data-slot="action-card" className={cn('gap-2', paddingClasses[padding], className)}>
      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {expandable && (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={bodyId}
              aria-label={open ? 'Collapse' : 'Expand'}
              onClick={() => setOpen((current) => !current)}
              className="grid size-8 shrink-0 place-items-center rounded outline-none hover:bg-vt-information-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
            >
              <Icon name="chevron-down" size={16} className={cn('transition-transform', !open && '-rotate-90')} />
            </button>
          )}
          <h3 className={cn('font-heading text-vt-dark-text', actionTitleSizes[titleSize])}>{title}</h3>
          {additionalInfo && (
            <Icon name="circle-info" size={16} title={additionalInfo} className="text-vt-grey-text" />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {indicators && <div className="flex items-center gap-2">{indicators}</div>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </header>
      {expanded && (
        <>
          <div id={bodyId} className="flex-1">
            {children}
          </div>
          {hasFooter && (
            <footer className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">{footerStart}</div>
              <div className="flex items-center gap-2">{footerEnd}</div>
            </footer>
          )}
        </>
      )}
    </Card>
  )
}

export { ActionCard, Card, KPICard, NavigationCard, SelectionCard }
export type { CardPadding, CardState }
