'use client'

import * as React from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Toasts": a 360px bordered 4px-radius surface with a
 * 24px type icon, a medium-weight title, an optional description indented 32px
 * under the title and a 24px close button. Success and Error are the only
 * types in code. A title-only toast is timed: a 4px progress bar runs along
 * the top edge and the toast dismisses after 6 seconds. Adding a description
 * makes it persistent until dismissed. Success announces politely
 * (role=status) and Error assertively (role=alert). Toasts never take focus,
 * Escape closes the focused one, and the timer pauses on hover and focus.
 */

type ToastType = 'success' | 'error'

const DEFAULT_DURATION = 6000
const MAX_VISIBLE = 5
const EXIT_DURATION = 200

const typeStyles = {
  success: {
    surface: 'border-vt-status-success bg-vt-toast-success-bg',
    icon: 'text-vt-status-success',
    track: 'bg-vt-status-success/20',
    fill: 'bg-vt-status-success',
    role: 'status',
  },
  error: {
    surface: 'border-vt-error bg-vt-toast-error-bg',
    icon: 'text-vt-error',
    track: 'bg-vt-error/20',
    fill: 'bg-vt-error',
    role: 'alert',
  },
} as const

interface ToastProps extends Omit<React.ComponentProps<'div'>, 'title' | 'role'> {
  type?: ToastType
  title: React.ReactNode
  description?: React.ReactNode
  /** Milliseconds before auto-dismiss. Defaults to 6000 for title-only toasts and `null` (persistent) with a description. */
  duration?: number | null
  /** Freezes the progress bar at a 0-1 value and disables the timer. Used for static documentation. */
  progress?: number
  onClose?: () => void
  leaving?: boolean
}

function Toast({
  type = 'success',
  title,
  description,
  duration,
  progress,
  onClose,
  leaving = false,
  className,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: ToastProps) {
  const styles = typeStyles[type]
  const resolvedDuration = duration === undefined ? (description ? null : DEFAULT_DURATION) : duration
  const [paused, setPaused] = React.useState(false)

  const onCloseRef = React.useRef(onClose)
  React.useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const remaining = React.useRef(resolvedDuration ?? 0)
  React.useEffect(() => {
    remaining.current = resolvedDuration ?? 0
  }, [resolvedDuration])

  React.useEffect(() => {
    if (resolvedDuration == null || progress !== undefined || paused || leaving) return
    const startedAt = performance.now()
    const timeout = window.setTimeout(() => onCloseRef.current?.(), remaining.current)
    return () => {
      window.clearTimeout(timeout)
      remaining.current = Math.max(0, remaining.current - (performance.now() - startedAt))
    }
  }, [resolvedDuration, progress, paused, leaving])

  return (
    <div
      role={styles.role}
      data-slot="toast"
      data-type={type}
      data-persistent={resolvedDuration == null || undefined}
      onMouseEnter={(event) => {
        setPaused(true)
        onMouseEnter?.(event)
      }}
      onMouseLeave={(event) => {
        setPaused(false)
        onMouseLeave?.(event)
      }}
      onFocus={(event) => {
        setPaused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setPaused(false)
        onBlur?.(event)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.key === 'Escape' && onClose) onClose()
      }}
      className={cn(
        'pointer-events-auto flex w-full max-w-[360px] flex-col overflow-hidden rounded border font-sans shadow-vt-toast',
        styles.surface,
        className,
      )}
      {...props}
    >
      {resolvedDuration != null ? (
        <div aria-hidden="true" className={cn('h-1 w-full shrink-0', styles.track)}>
          <div
            className={cn('h-full w-full origin-left', styles.fill)}
            style={
              progress !== undefined
                ? { transform: `scaleX(${Math.min(1, Math.max(0, progress))})` }
                : {
                    animation: `vt-toast-progress ${resolvedDuration}ms linear forwards`,
                    animationPlayState: paused ? 'paused' : 'running',
                  }
            }
          />
        </div>
      ) : null}

      <div className="flex flex-col p-3">
        <div className={cn('flex gap-2', description ? 'items-start' : 'items-center')}>
          <Icon
            name={type === 'success' ? 'circle-check' : 'circle-xmark'}
            size={24}
            className={styles.icon}
          />
          <div className="flex min-h-6 min-w-0 flex-1 items-center">
            <span className="text-sm leading-5 font-medium text-pretty text-vt-dark-text">{title}</span>
          </div>
          {onClose ? (
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={onClose}
              className={cn(
                'inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-vt-dark-text outline-none transition-colors hover:bg-black/5',
                'focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-offset-2',
              )}
            >
              <Icon name="xmark" size={24} />
            </button>
          ) : null}
        </div>
        {description ? (
          <p className="px-8 text-sm leading-5 font-light text-pretty text-vt-dark-text">{description}</p>
        ) : null}
      </div>
    </div>
  )
}

interface ToastItem {
  id: string
  type: ToastType
  title: React.ReactNode
  description?: React.ReactNode
  duration?: number | null
  leaving: boolean
}

type ToastOptions = Pick<ToastItem, 'description' | 'duration'>

const EMPTY: ToastItem[] = []
let toasts: ToastItem[] = EMPTY
let nextId = 0
const listeners = new Set<() => void>()

function setToasts(next: ToastItem[]) {
  toasts = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return toasts
}

function getServerSnapshot() {
  return EMPTY
}

function show(type: ToastType, title: React.ReactNode, options?: ToastOptions) {
  const id = `toast-${++nextId}`
  setToasts([...toasts, { id, type, title, leaving: false, ...options }].slice(-MAX_VISIBLE))
  return id
}

function dismiss(id?: string) {
  const targets = toasts.filter((item) => !item.leaving && (id === undefined || item.id === id)).map((item) => item.id)
  if (targets.length === 0) return
  setToasts(toasts.map((item) => (targets.includes(item.id) ? { ...item, leaving: true } : item)))
  window.setTimeout(() => {
    setToasts(toasts.filter((item) => !targets.includes(item.id)))
  }, EXIT_DURATION)
}

const toast = {
  success: (title: React.ReactNode, options?: ToastOptions) => show('success', title, options),
  error: (title: React.ReactNode, options?: ToastOptions) => show('error', title, options),
  dismiss,
}

/** Mount once near the root of the app. Stacks toasts at the bottom-right, or bottom-left in RTL. */
function Toaster({ className }: { className?: string }) {
  const items = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <div
      data-slot="toaster"
      className={cn(
        'pointer-events-none fixed end-4 bottom-4 z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2',
        className,
      )}
    >
      {items.map((item) => (
        <Toast
          key={item.id}
          type={item.type}
          title={item.title}
          description={item.description}
          duration={item.duration}
          leaving={item.leaving}
          onClose={() => dismiss(item.id)}
          className={item.leaving ? 'vt-toast-exit pointer-events-none' : 'vt-toast-enter'}
        />
      ))}
    </div>
  )
}

export { Toast, Toaster, toast, type ToastProps, type ToastType, type ToastOptions }
