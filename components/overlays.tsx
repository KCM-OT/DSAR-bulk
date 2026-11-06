'use client'

import * as React from 'react'
import { SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Toast as VitreusToast } from '@/components/ui/toast'
import { useStore, type Toast as StoreToast } from '@/lib/store'
import { cn } from '@/lib/utils'

/** Drives the Vitreus Toast progress bar from 0 to 1 over one second (completed bulk actions). */
function useOneSecondProgress(enabled: boolean) {
  const [value, setValue] = React.useState(0)
  React.useEffect(() => {
    if (!enabled) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const next = Math.min(1, (now - start) / 1000)
      setValue(next)
      if (next < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [enabled])
  return enabled ? value : undefined
}

function ToastEntry({ toast: t }: { toast: StoreToast }) {
  const { dismissToast, setOpenJobId, jobs } = useStore()
  const progress = useOneSecondProgress(Boolean(t.progress))
  // Vitreus defines Success and Error toasts only, so every non-success outcome uses Error.
  const type = t.tone === 'success' ? 'success' : 'error'
  const title = t.title ?? (t.tone === 'success' ? 'Success' : t.tone === 'warning' ? 'Completed with issues' : t.tone === 'info' ? 'Note' : 'Error')
  const canOpen = t.jobId && jobs.some((j) => j.id === t.jobId)
  return (
    <VitreusToast
      type={type}
      title={title}
      // The store controls dismissal; a frozen progress value (or none) keeps the Vitreus timer off.
      duration={t.progress ? 1000 : null}
      progress={progress}
      onClose={() => dismissToast(t.id)}
      className="vt-toast-enter"
      description={
        <>
          {t.text}
          {canOpen && (
            <button
              type="button"
              className="ml-1 text-vt-information hover:underline"
              onClick={() => {
                setOpenJobId(t.jobId!)
                dismissToast(t.id)
              }}
            >
              View details
            </button>
          )}
        </>
      }
    />
  )
}

/** Toasts use the Vitreus Toast component; they stack in the bottom-right corner above the jobs tray. */
export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="flex w-full flex-col gap-2">
      {toasts.map((t) => (
        <ToastEntry key={t.id} toast={t} />
      ))}
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
