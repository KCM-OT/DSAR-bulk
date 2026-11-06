'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Drawer": 400, 600 or 800px wide panels with a 48px
 * header (title in Antique Legacy Medium 18px), light (#ffffff) and dark
 * (#333333) themes, ltr/rtl direction, and an optional pin control. Pinned
 * drawers are non-modal so the page behind stays interactive.
 */
type DrawerSize = 'small' | 'medium' | 'large'
type DrawerTheme = 'light' | 'dark'
type DrawerPin = 'off' | 'unpinned' | 'pinned'

const widths: Record<DrawerSize, string> = {
  small: 'w-[400px]',
  medium: 'w-[600px]',
  large: 'w-[800px]',
}

const DrawerContext = React.createContext<{ Title: React.ElementType; close?: () => void }>({ Title: 'h2' })

function PinIcon({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden width={16} height={16} viewBox="0 0 24 24" className="shrink-0">
      <path
        d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface DrawerPanelProps {
  size?: DrawerSize
  theme?: DrawerTheme
  direction?: 'ltr' | 'rtl'
  pin?: DrawerPin
  title: string
  onClose?: () => void
  onPinChange?: (pinned: boolean) => void
  children?: React.ReactNode
  className?: string
}

function DrawerPanel({
  size = 'small',
  theme = 'light',
  direction = 'ltr',
  pin = 'off',
  title,
  onClose,
  onPinChange,
  children,
  className,
}: DrawerPanelProps) {
  const { Title, close } = React.useContext(DrawerContext)
  const dark = theme === 'dark'
  const buttonClasses = cn(
    'grid size-8 shrink-0 place-items-center rounded outline-none focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
    dark ? 'hover:bg-vt-surface/10' : 'hover:bg-vt-information-light',
  )

  return (
    <div
      dir={direction}
      data-slot="drawer"
      data-theme={theme}
      className={cn(
        'flex h-full max-w-full flex-col shadow-[0_0_10px_rgba(46,58,89,0.4)]',
        dark ? 'bg-[#333333] text-vt-light-text' : 'bg-vt-surface text-vt-dark-text',
        widths[size],
        className,
      )}
    >
      <header className="flex items-center gap-2 px-2 pt-4">
        <Title className="min-w-0 flex-1 truncate px-2 font-heading text-lg leading-6 font-medium tracking-[-0.02em]">
          {title}
        </Title>
        <div className="flex items-center gap-1">
          {pin !== 'off' && (
            <button
              type="button"
              aria-label={pin === 'pinned' ? 'Unpin drawer' : 'Pin drawer'}
              aria-pressed={pin === 'pinned'}
              onClick={() => onPinChange?.(pin !== 'pinned')}
              className={buttonClasses}
            >
              <PinIcon filled={pin === 'pinned'} />
            </button>
          )}
          <button type="button" aria-label="Close drawer" onClick={onClose ?? close} className={buttonClasses}>
            <Icon name="xmark" size={16} />
          </button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  )
}

interface DrawerProps extends Omit<DrawerPanelProps, 'onClose'> {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Drawer({ open, onOpenChange, ...panelProps }: DrawerProps) {
  const pinned = panelProps.pin === 'pinned'
  const rtl = panelProps.direction === 'rtl'
  const context = React.useMemo(
    () => ({ Title: DialogPrimitive.Title as React.ElementType, close: () => onOpenChange(false) }),
    [onOpenChange],
  )

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} modal={!pinned}>
      <DialogPrimitive.Portal>
        {!pinned && (
          <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-vt-dark-text/40 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        )}
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onInteractOutside={(event) => pinned && event.preventDefault()}
          className={cn(
            'fixed inset-y-0 z-50 max-w-full outline-none duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in',
            rtl
              ? 'left-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
              : 'right-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          )}
        >
          <DrawerContext.Provider value={context}>
            <DrawerPanel {...panelProps} />
          </DrawerContext.Provider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

const DrawerTrigger = DialogPrimitive.Trigger

export { Drawer, DrawerPanel, DrawerTrigger }
export type { DrawerPin, DrawerSize, DrawerTheme }
