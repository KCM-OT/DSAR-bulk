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

export function Toasts() {
  const { toasts, dismissToast, setOpenJobId, jobs } = useStore()
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-[480px] -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => {
        const icon = { success: 'circle-check', warning: 'triangle-exclamation', error: 'circle-xmark', info: 'circle-info' }[t.tone] as
          | 'circle-check'
          | 'triangle-exclamation'
          | 'circle-xmark'
          | 'circle-info'
        const color = { success: 'text-vt-status-success', warning: 'text-vt-warning', error: 'text-vt-error', info: 'text-vt-information' }[t.tone]
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded border border-vt-border bg-vt-surface p-3 shadow-e4 animate-in fade-in-0 slide-in-from-bottom-2"
          >
            <Icon name={icon} variant="filled" size={20} className={color} />
            <p className="flex-1 text-sm">{t.text}</p>
            {t.jobId && jobs.some((j) => j.id === t.jobId) && (
              <button
                type="button"
                className="text-sm text-vt-information hover:underline"
                onClick={() => {
                  setOpenJobId(t.jobId!)
                  dismissToast(t.id)
                }}
              >
                View details
              </button>
            )}
            <button type="button" aria-label="Dismiss" onClick={() => dismissToast(t.id)} className="text-vt-grey-text hover:text-vt-dark-text">
              <Icon name="xmark" size={14} />
            </button>
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
