'use client'

import * as React from 'react'
import { SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const TONE = {
  success: { icon: 'circle-check', color: 'text-vt-status-success', bar: 'bg-vt-status-success', title: 'Success' },
  warning: { icon: 'triangle-exclamation', color: 'text-vt-warning', bar: 'bg-vt-warning', title: 'Warning' },
  error: { icon: 'circle-xmark', color: 'text-vt-error', bar: 'bg-vt-error', title: 'Error' },
  info: { icon: 'circle-info', color: 'text-vt-information', bar: 'bg-vt-information', title: 'Info' },
} as const

/** Fills from 0 to 100% over one second after mounting. */
function ToastProgress({ className }: { className: string }) {
  const [full, setFull] = React.useState(false)
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setFull(true))
    return () => cancelAnimationFrame(frame)
  }, [])
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={full ? 100 : 0} className="h-1 w-full bg-[#e5e5e5]">
      <div className={cn('h-full transition-[width] duration-1000 ease-linear', className)} style={{ width: full ? '100%' : '0%' }} />
    </div>
  )
}

/**
 * Toast, matching the DSAR Figma file ("Toast", node 4485:55026): 360px wide, a 24px status icon,
 * a bold title over a 14px description, and a small close button.
 */
export function Toasts() {
  const { toasts, dismissToast, setOpenJobId, jobs } = useStore()
  return (
    <div className="flex w-full flex-col gap-2">
      {toasts.map((t) => {
        const tone = TONE[t.tone]
        const canOpen = t.jobId && jobs.some((j) => j.id === t.jobId)
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto overflow-hidden rounded border border-vt-border bg-vt-surface shadow-e4 animate-in fade-in-0 slide-in-from-bottom-2"
          >
            {t.progress && <ToastProgress className={tone.bar} />}
            <div className="flex flex-col gap-0 p-3">
              <div className="flex items-center gap-2">
                <Icon name={tone.icon} variant="filled" size={24} className={tone.color} />
                <p className="min-w-0 flex-1 font-heading text-base leading-5 font-medium">{t.title ?? tone.title}</p>
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => dismissToast(t.id)}
                  className="grid size-6 place-items-center rounded text-vt-dark-text hover:bg-vt-information-light"
                >
                  <Icon name="xmark" size={14} />
                </button>
              </div>
              <div className="pr-8 pl-8">
                <p className="text-sm leading-5 font-light">{t.text}</p>
                {canOpen && (
                  <button
                    type="button"
                    className="mt-1 text-sm text-vt-information hover:underline"
                    onClick={() => {
                      setOpenJobId(t.jobId!)
                      dismissToast(t.id)
                    }}
                  >
                    View details
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Not part of the product: lets reviewers force the outcome states described in Stories 7 to 9. */
export function DemoControls() {
  const { settings, setSettings, resetData } = useStore()
  const [open, setOpen] = React.useState(false)
  return (
    <div className="fixed bottom-4 left-4 z-30">
      {open && (
        <div className="mb-2 flex w-80 flex-col gap-4 rounded border border-vt-border bg-vt-surface p-4 shadow-e4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-base font-medium">Prototype controls</h2>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="grid size-6 place-items-center rounded hover:bg-vt-information-light">
              <Icon name="xmark" size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-medium">Per-request failure rate</Label>
            <Select value={String(settings.failureRate)} onValueChange={(v) => setSettings((s) => ({ ...s, failureRate: Number(v) }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0%: every request succeeds</SelectItem>
                <SelectItem value="0.04">4%: occasional failures</SelectItem>
                <SelectItem value="0.2">20%: many failures</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-sm font-medium">Processing speed</Label>
            <Select value={settings.speed} onValueChange={(v) => setSettings((s) => ({ ...s, speed: v as typeof s.speed }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow (good for trying Abort)</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="fast">Fast</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Switch
            label="Next action fails to start"
            description="Shows the Failed state with Retry."
            checked={settings.failNextJob}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, failNextJob: v }))}
          />
          <Switch
            label="Drop the connection during the next action"
            description="The modal recovers the true status on reconnect."
            checked={settings.dropConnectionNextJob}
            onCheckedChange={(v) => setSettings((s) => ({ ...s, dropConnectionNextJob: v }))}
          />
          <Button variant="secondary" onClick={resetData}>
            Reset mock data
          </Button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex h-8 items-center gap-2 rounded-full border border-vt-graphic-8 bg-vt-surface px-3 font-heading text-xs font-medium text-vt-graphic-8 shadow-e2 hover:bg-[#faebf2]',
        )}
      >
        <SlidersHorizontal className="size-3.5" />
        Prototype controls
      </button>
    </div>
  )
}
