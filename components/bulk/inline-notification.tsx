import * as React from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Figma "Inline notification" (DSAR 4632:18526, code: vt-notification), medium density:
 * min-h 40, padding 8x16, 16px gaps, 24px filled icon, caption text (12/16 light).
 * Vitreus in this prototype has no notification component yet, so it lives here.
 * Colors follow the confirmation modal frame (4632:18775); the borders are raw hex in Vitreus too.
 */
const tones = {
  info: { icon: 'circle-info', iconClass: 'text-vt-information', box: 'border-[#c2dbe9] bg-[#f3f8fb]' },
  warning: { icon: 'triangle-exclamation', iconClass: 'text-vt-warning', box: 'border-[#f4dab6] bg-[#fffcf2]' },
  success: { icon: 'circle-check', iconClass: 'text-vt-status-success', box: 'border-[#c4e3cc] bg-[#f2faf4]' },
  error: { icon: 'circle-exclamation', iconClass: 'text-vt-error', box: 'border-[#f5c2c2] bg-[#fff5f5]' },
} as const

export function InlineNotification({
  tone = 'info',
  children,
  className,
}: {
  tone?: keyof typeof tones
  children: React.ReactNode
  className?: string
}) {
  const t = tones[tone]
  return (
    <div
      role={tone === 'warning' || tone === 'error' ? 'alert' : 'status'}
      className={cn('flex min-h-10 items-center gap-4 rounded border px-4 py-2', t.box, className)}
    >
      <Icon name={t.icon} variant="filled" size={24} className={cn('shrink-0', t.iconClass)} />
      <p className="flex-1 text-xs leading-4 font-light text-vt-dark-text">{children}</p>
    </div>
  )
}
