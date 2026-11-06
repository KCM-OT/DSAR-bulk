'use client'

import * as React from 'react'
import { Minimize2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Modal, ModalPanel } from '@/components/ui/modal'
import { ProgressBar } from '@/components/common'
import { BATCH_SIZE, useStore, type Job } from '@/lib/store'
import { cn } from '@/lib/utils'

const n = (count: number) => `${count.toLocaleString()} ${count === 1 ? 'request' : 'requests'}`

function Stat({ label, value, tone }: { label: string; value: number; tone: 'success' | 'error' | 'neutral' | 'warning' }) {
  return (
    <div className="flex flex-1 flex-col rounded border border-vt-border px-3 py-2">
      <span className="text-xs font-light text-vt-grey-text">{label}</span>
      <span
        className={cn(
          'font-heading text-2xl font-medium tabular-nums',
          tone === 'success' && 'text-vt-status-success',
          tone === 'error' && 'text-vt-error',
          tone === 'warning' && 'text-vt-warning',
        )}
      >
        {value.toLocaleString()}
      </span>
    </div>
  )
}

function Outcome({ icon, tone, title, children }: { icon: 'circle-check' | 'triangle-exclamation' | 'circle-xmark' | 'circle-info'; tone: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon name={icon} variant="filled" size={28} className={tone} />
      <div className="flex flex-col gap-1">
        <p className="font-heading text-lg font-medium">{title}</p>
        {children && <div className="text-sm font-light">{children}</div>}
      </div>
    </div>
  )
}

function FailedList({ job }: { job: Job }) {
  const { byId } = useStore()
  if (job.failed.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-heading text-sm font-medium">Failed requests ({job.failed.length})</h3>
      <div className="max-h-48 overflow-auto rounded border border-vt-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-vt-table-header text-left">
            <tr>
              <th className="px-2 py-1.5 font-medium">ID</th>
              <th className="px-2 py-1.5 font-medium">Name</th>
              <th className="px-2 py-1.5 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {job.failed.map((f) => (
              <tr key={f.id} className="border-t border-vt-border">
                <td className="px-2 py-1.5 font-medium text-vt-information">{f.id}</td>
                <td className="px-2 py-1.5 font-light">{byId.get(f.id)?.name}</td>
                <td className="px-2 py-1.5 font-light text-vt-grey-text">{f.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProgressContent({ job }: { job: Job }) {
  const { jobs, requestAbort, retryFailed, retryJob, setOpenJobId, dismissJob } = useStore()
  const [confirmAbort, setConfirmAbort] = React.useState(false)

  const view = job.reconnecting && job.frozen ? job.frozen : { processed: job.processed, succeeded: job.succeeded, failed: job.failed.length }
  const pct = job.total ? (view.processed / job.total) * 100 : 0
  const batches = Math.ceil(job.total / BATCH_SIZE)
  const batch = Math.min(batches, Math.floor(view.processed / BATCH_SIZE) + 1)
  const running = job.status === 'running' || job.status === 'aborting'
  const finished = !running && job.status !== 'queued'
  const blocking = jobs.find((j) => j.status === 'running' || j.status === 'aborting')
  const retryOf = job.retryOf ? jobs.find((j) => j.id === job.retryOf) : undefined

  const minimize = () => setOpenJobId(null)
  const close = () => (finished ? dismissJob(job.id) : minimize())

  let footer: React.ReactNode
  if (confirmAbort && (running || job.status === 'queued')) {
    footer = (
      <>
        <Button variant="ghost" onClick={() => setConfirmAbort(false)}>
          Keep running
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            requestAbort(job.id)
            setConfirmAbort(false)
          }}
        >
          Abort
        </Button>
      </>
    )
  } else if (running || job.status === 'queued') {
    footer = (
      <>
        <Button variant="secondary" disabled={job.status === 'aborting'} onClick={() => setConfirmAbort(true)}>
          {job.status === 'queued' ? 'Cancel' : 'Abort'}
        </Button>
        <Button onClick={minimize}>
          <Minimize2 /> Minimize
        </Button>
      </>
    )
  } else {
    footer = (
      <>
        {(job.status === 'partial' || job.status === 'aborted') && job.failed.length > 0 && (
          <Button variant="secondary" onClick={() => retryFailed(job.id)}>
            <Icon name="refresh" /> Retry failed ({job.failed.length})
          </Button>
        )}
        {job.status === 'failed' && (
          <Button variant="secondary" onClick={() => retryJob(job.id)}>
            <Icon name="refresh" /> Retry
          </Button>
        )}
        <Button onClick={close}>Close</Button>
      </>
    )
  }

  return (
    <ModalPanel size="sm" title={job.label} onClose={close} footer={footer}>
      <div className="flex flex-col gap-4">
        <p className="text-sm font-light text-vt-grey-text">
          {n(job.total)}
          {job.skippedCount > 0 && ` · ${job.skippedCount.toLocaleString()} skipped before starting`}
          {retryOf && (job.total === retryOf.total ? ' · Retry' : ' · Retry of failed requests')}
        </p>

        {job.status === 'queued' && (
          <Outcome icon="circle-info" tone="text-vt-information" title="Queued">
            Waiting for &ldquo;{blocking?.label ?? 'another bulk action'}&rdquo; to finish. Bulk actions that may touch the same requests run one
            after another.
          </Outcome>
        )}

        {running && (
          <div className="flex flex-col gap-2">
            {job.reconnecting && (
              <div className="flex items-center gap-2 rounded border border-vt-warning bg-vt-warning-light px-3 py-2 text-sm">
                <span className="size-3 animate-spin rounded-full border-2 border-vt-warning border-t-transparent" />
                Connection lost. Reconnecting... The action keeps running on the server.
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <span className="font-heading text-base font-medium tabular-nums" aria-live="polite">
                {view.processed.toLocaleString()} of {job.total.toLocaleString()} processed
              </span>
              <span className="text-xs font-light text-vt-grey-text tabular-nums">
                Batch {batch} of {batches} · {BATCH_SIZE} per batch
              </span>
            </div>
            <ProgressBar value={pct} tone={job.reconnecting ? 'warning' : 'info'} />
            <div className="flex gap-4 text-sm font-light">
              <span>
                <span className="font-medium text-vt-status-success tabular-nums">{view.succeeded}</span> succeeded
              </span>
              <span>
                <span className={cn('font-medium tabular-nums', view.failed > 0 && 'text-vt-error')}>{view.failed}</span> failed
              </span>
            </div>
            {job.status === 'aborting' ? (
              <p className="text-sm font-light">Aborting... the current batch will finish, then the remaining requests won&apos;t be processed.</p>
            ) : (
              <p className="text-xs font-light text-vt-grey-text">
                You can close this window or leave the page. The action keeps running and you&apos;ll be notified when it finishes.
              </p>
            )}
          </div>
        )}

        {confirmAbort && (running || job.status === 'queued') && (
          <div className="rounded border border-vt-error bg-vt-error-light px-3 py-2 text-sm">
            <p className="font-medium">Are you sure you want to abort?</p>
            <p className="font-light">
              The current batch finishes first. Requests already processed are not rolled back, and the remaining requests won&apos;t be
              processed.
            </p>
          </div>
        )}

        {job.status === 'success' && (
          <Outcome icon="circle-check" tone="text-vt-status-success" title="Success">
            {job.total === 1 ? 'The request was processed.' : `All ${n(job.total)} were processed.`}
            {job.skippedCount > 0 && ` ${job.skippedCount.toLocaleString()} ineligible ${job.skippedCount === 1 ? "request was" : "requests were"} skipped before starting.`}
          </Outcome>
        )}

        {job.status === 'partial' && (
          <>
            <Outcome icon="triangle-exclamation" tone="text-vt-warning" title="Completed with errors">
              Some requests couldn&apos;t be processed. You can retry just the failed ones.
            </Outcome>
            <div className="flex gap-2">
              <Stat label="Succeeded" value={job.succeeded} tone="success" />
              <Stat label="Failed" value={job.failed.length} tone="error" />
              <Stat label="Skipped" value={job.skippedCount} tone="neutral" />
            </div>
            <FailedList job={job} />
          </>
        )}

        {job.status === 'aborted' && (
          <>
            <Outcome icon="circle-info" tone="text-vt-information" title="Aborted">
              Requests processed before the abort were not rolled back.
            </Outcome>
            <div className="flex gap-2">
              <Stat label="Succeeded" value={job.succeeded} tone="success" />
              <Stat label="Failed" value={job.failed.length} tone="error" />
              <Stat label="Not processed" value={job.notProcessed} tone="warning" />
            </div>
            <FailedList job={job} />
          </>
        )}

        {job.status === 'failed' && (
          <Outcome icon="circle-xmark" tone="text-vt-error" title="Failed">
            {job.error ?? "The action couldn't run."} Try again, and contact support if it keeps happening.
          </Outcome>
        )}
      </div>
    </ModalPanel>
  )
}

export function ProgressModal() {
  const { jobs, openJobId, setOpenJobId } = useStore()
  const job = jobs.find((j) => j.id === openJobId)
  return (
    <Modal open={Boolean(job)} onOpenChange={(open) => !open && setOpenJobId(null)}>
      {job && <ProgressContent key={job.id} job={job} />}
    </Modal>
  )
}

/** Minimized jobs, shown bottom-right so a running action stays visible after the modal closes. */
export function JobsTray() {
  const { jobs, openJobId, setOpenJobId, dismissJob } = useStore()
  const visible = jobs.filter((j) => j.id !== openJobId && !j.watched)
  if (visible.length === 0) return null
  return (
    <div className="pointer-events-auto flex w-full flex-col gap-2">
      {visible.map((job) => {
        const running = job.status === 'running' || job.status === 'aborting'
        const pct = job.total ? (job.processed / job.total) * 100 : 0
        const statusText = {
          queued: 'Queued',
          running: `${job.processed} of ${job.total} processed`,
          aborting: 'Aborting...',
          success: 'Success',
          partial: `Completed with errors · ${job.failed.length} failed`,
          aborted: `Aborted · ${job.notProcessed} not processed`,
          failed: 'Failed',
        }[job.status]
        const tone = job.status === 'success' ? 'success' : job.status === 'failed' ? 'error' : job.status === 'partial' || job.status === 'aborted' ? 'warning' : 'info'
        return (
          <div key={job.id} className="rounded border border-vt-border bg-vt-surface p-3 shadow-e4">
            <div className="flex items-start gap-2">
              <button type="button" onClick={() => setOpenJobId(job.id)} className="min-w-0 flex-1 text-left">
                <p className="truncate font-heading text-sm font-medium">{job.label}</p>
                <p className="text-xs font-light text-vt-grey-text">{statusText}</p>
              </button>
              {!running && job.status !== 'queued' && (
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => dismissJob(job.id)}
                  className="grid size-6 place-items-center rounded hover:bg-vt-information-light"
                >
                  <Icon name="xmark" size={12} />
                </button>
              )}
            </div>
            <div className="mt-2">
              <ProgressBar value={job.status === 'queued' ? 0 : running ? pct : 100} tone={tone} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
