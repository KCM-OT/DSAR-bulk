'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

import { Button } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Modal", "❖ Dialog modal" and "❖ Tip modal". Panels are
 * white, 4px radius, 24px padding, with the e5 elevation. Widths are XS 416,
 * SM 598, MD 768, LG 948 and XL 1400. Dialog modals lead with a status icon;
 * tip modals step through an explainer with progress dots.
 */
type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const widths: Record<ModalSize, string> = {
  xs: 'w-[416px]',
  sm: 'w-[598px]',
  md: 'w-[768px]',
  lg: 'w-[948px]',
  xl: 'w-[1400px]',
}

const ModalContext = React.createContext<{ Title: React.ElementType; close?: () => void }>({ Title: 'h2' })

function ModalCloseButton({ onClose, className }: { onClose?: () => void; className?: string }) {
  const { close } = React.useContext(ModalContext)
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClose ?? close}
      className={cn(
        'grid size-8 place-items-center rounded text-vt-dark-text outline-none hover:bg-vt-information-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
        className,
      )}
    >
      <Icon name="xmark" size={16} />
    </button>
  )
}

function ModalShell({
  size,
  className,
  children,
}: {
  size: ModalSize
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="modal"
      className={cn(
        'relative max-w-full rounded bg-vt-surface p-6 font-sans text-vt-dark-text shadow-e5',
        widths[size],
        className,
      )}
    >
      {children}
    </div>
  )
}

interface ModalPanelProps {
  size?: ModalSize
  title: string
  footer?: React.ReactNode
  onClose?: () => void
  children?: React.ReactNode
  className?: string
}

function ModalPanel({ size = 'sm', title, footer, onClose, children, className }: ModalPanelProps) {
  const { Title } = React.useContext(ModalContext)
  return (
    <ModalShell size={size} className={cn('flex flex-col gap-4', className)}>
      <ModalCloseButton onClose={onClose} className="absolute top-4 right-4" />
      <Title className="pr-10 font-heading text-2xl leading-8 font-medium">{title}</Title>
      <div className="text-base leading-6 font-light">{children}</div>
      {footer && <footer className="flex justify-end gap-3 pt-4">{footer}</footer>}
    </ModalShell>
  )
}

const dialogTones = {
  warning: { icon: 'triangle-exclamation', className: 'text-vt-warning' },
  danger: { icon: 'circle-exclamation', className: 'text-vt-error' },
  info: { icon: 'circle-info', className: 'text-vt-information' },
  success: { icon: 'circle-check', className: 'text-vt-status-success' },
} as const satisfies Record<string, { icon: IconName; className: string }>

interface DialogModalProps {
  size?: 'xs' | 'sm'
  tone?: keyof typeof dialogTones
  title: string
  description?: string
  cancelLabel?: string
  submitLabel?: string
  onCancel?: () => void
  onSubmit?: () => void
  onClose?: () => void
  children?: React.ReactNode
  className?: string
}

function DialogModal({
  size = 'sm',
  tone = 'warning',
  title,
  description,
  cancelLabel = 'Cancel',
  submitLabel = 'Submit',
  onCancel,
  onSubmit,
  onClose,
  children,
  className,
}: DialogModalProps) {
  const { Title } = React.useContext(ModalContext)
  const toneConfig = dialogTones[tone]
  return (
    <ModalShell size={size} className={cn('grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 pt-12', className)}>
      <ModalCloseButton onClose={onClose} className="absolute top-4 right-4" />
      <Icon name={toneConfig.icon} variant="filled" size={28} className={cn('mt-0.5', toneConfig.className)} />
      <Title className="font-heading text-2xl leading-8 font-medium">{title}</Title>
      <div className="col-start-2 flex flex-col gap-3 text-base leading-6 font-light">
        {description && <p>{description}</p>}
        {children}
      </div>
      <footer className="col-start-2 flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onCancel ?? onClose}>
          {cancelLabel}
        </Button>
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </footer>
    </ModalShell>
  )
}

interface TipModalProps {
  index: number
  total?: number
  title?: string
  tipTitle: string
  description: string
  linkLabel?: string
  linkHref?: string
  media?: React.ReactNode
  onPrevious?: () => void
  onNext?: () => void
  onClose?: () => void
  className?: string
}

function TipModal({
  index,
  total = 5,
  title = 'Explainer (static)',
  tipTitle,
  description,
  linkLabel = 'Feature pathway',
  linkHref = '#',
  media,
  onPrevious,
  onNext,
  onClose,
  className,
}: TipModalProps) {
  const { Title } = React.useContext(ModalContext)
  const isFirst = index === 0
  const isLast = index === total - 1
  return (
    <ModalShell size="sm" className={cn('flex flex-col gap-4', className)}>
      <ModalCloseButton onClose={onClose} className="absolute top-4 right-4" />
      <div className="flex flex-col gap-3 pt-2">
        <Title className="font-heading text-2xl leading-8 font-medium">{title}</Title>
        <div role="img" aria-label={`Tip ${index + 1} of ${total}`} className="flex items-center gap-2">
          {Array.from({ length: total }, (_, dot) => (
            <span
              key={dot}
              className={cn('size-2 rounded-full', dot === index ? 'bg-vt-information' : 'bg-vt-border')}
            />
          ))}
        </div>
      </div>
      <div className="flex h-[170px] items-center justify-center overflow-hidden rounded-sm bg-[#fff3f3]">{media}</div>
      <div className="flex flex-col gap-2">
        <h3 className="font-heading text-base leading-6 font-medium">{tipTitle}</h3>
        <p className="text-base leading-6 font-light">{description}</p>
        <a
          href={linkHref}
          className="w-fit rounded-sm text-base leading-6 font-light text-vt-information outline-none hover:underline focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
        >
          {linkLabel}
        </a>
      </div>
      <footer className="flex justify-end gap-3 pt-2">
        {!isFirst && (
          <Button variant="secondary" onClick={onPrevious}>
            Previous
          </Button>
        )}
        {isLast ? <Button onClick={onClose}>Close</Button> : <Button onClick={onNext}>Next</Button>}
      </footer>
    </ModalShell>
  )
}

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

/** Wraps any panel in an accessible, centred dialog with an overlay. */
function Modal({ open, onOpenChange, children }: ModalProps) {
  const context = React.useMemo(
    () => ({ Title: DialogPrimitive.Title as React.ElementType, close: () => onOpenChange(false) }),
    [onOpenChange],
  )
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-vt-dark-text/40 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-auto outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
        >
          <ModalContext.Provider value={context}>{children}</ModalContext.Provider>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

const ModalTrigger = DialogPrimitive.Trigger

export { DialogModal, Modal, ModalPanel, ModalTrigger, TipModal }
export type { ModalSize }
