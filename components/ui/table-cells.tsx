import * as React from 'react'

import { Avatar, type AvatarTone } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Cell content primitives for the "Table cell" type matrix. Drop them inside
 * <TableCell> (set `align` there for the center/right variants).
 */

function CellEmpty({ className }: { className?: string }) {
  return (
    <span aria-label="No value" className={cn('whitespace-nowrap tracking-widest text-vt-dark-text', className)}>
      - - - -
    </span>
  )
}

function CellAvatarName({
  name,
  subtext,
  tone,
}: {
  name: string
  subtext?: string
  tone?: AvatarTone
}) {
  return (
    <span className="flex items-center gap-2">
      <Avatar name={name} tone={tone} />
      <span className="flex flex-col">
        <span>{name}</span>
        {subtext ? <span className="text-xs leading-4 text-vt-grey-text">{subtext}</span> : null}
      </span>
    </span>
  )
}

function CellLink({
  children,
  icon,
  href,
  secondary,
  onClick,
}: {
  children: React.ReactNode
  icon?: IconName
  href?: string
  secondary?: boolean
  onClick?: () => void
}) {
  const classes = cn(
    'inline-flex items-center gap-1 rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
    secondary ? 'text-vt-information' : 'text-vt-link-text',
  )
  const content = (
    <>
      {icon ? <Icon name={icon} aria-hidden /> : null}
      {children}
    </>
  )
  return href ? (
    <a href={href} className={classes}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  )
}

function CellNumber({ children }: { children: React.ReactNode }) {
  return <span className="tabular-nums">{children}</span>
}

function CellIconMessage({
  tone,
  label,
}: {
  tone: 'error' | 'warning'
  label: string
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn('inline-flex', tone === 'error' ? 'text-vt-error' : 'text-vt-warning')}
    >
      <Icon name={tone === 'error' ? 'circle-exclamation' : 'triangle-exclamation'} variant="filled" size={20} />
    </span>
  )
}

function CellExpand({
  expanded,
  onToggle,
  label = 'Toggle row details',
}: {
  expanded: boolean
  onToggle: () => void
  label?: string
}) {
  return (
    <Button variant="ghost" size="icon" aria-expanded={expanded} aria-label={label} onClick={onToggle}>
      <Icon name={expanded ? 'chevron-down' : 'chevron-right'} aria-hidden />
    </Button>
  )
}

function CellAction({ label }: { label: string }) {
  return (
    <Button variant="ghost" size="icon" aria-label={label}>
      <Icon name="ellipsis" aria-hidden />
    </Button>
  )
}

function CellQuickView({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center justify-between gap-2">
      <CellLink>{children}</CellLink>
      <CellAction label={label} />
    </span>
  )
}

function CellSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className="inline-block size-4 animate-spin rounded-full border-2 border-vt-grey-text border-t-transparent"
    />
  )
}

export {
  CellEmpty,
  CellAvatarName,
  CellLink,
  CellNumber,
  CellIconMessage,
  CellExpand,
  CellAction,
  CellQuickView,
  CellSpinner,
}
