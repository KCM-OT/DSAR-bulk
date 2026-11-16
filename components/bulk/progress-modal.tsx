'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Modal, ModalPanel } from '@/components/ui/modal'
import { ProgressBar } from '@/components/common'
import { Subtitle } from '@/components/bulk/change-workflow-modal'
import { InlineNotification } from '@/components/bulk/inline-notification'
import { CONFIRM_PANEL } from '@/components/bulk/modal-styles'
import { GroupBox } from '@/components/bulk/plan-summary'
import { useStore, type Job } from '@/lib/store'

const n = (count: number) => `${count.toLocaleString()} ${count === 1 ? 'request' : 'requests'}`

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

/** Figma progress bar: a 6px track outlined in Information blue, filled from the left. */
function ProgressTrack({ value }: { value: number }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className="h-1.5 w-full overflow-hidden rounded-full border border-vt-information bg-vt-surface"
    >
      <div className="h-full rounded-full bg-vt-information transition-[width] duration-500 ease-out" style={{ width: `${value}%` }} />
    </div>
  )
}

/** A Vitreus Card with the count above its label (Figma completion view). */
function CountCard({ value, label }: { value: number; label: string }) {
  return (
    <Card className="flex-1 gap-1 px-4 py-3">
      <span className="font-heading text-2xl leading-8 font-medium tabular-nums">{value.toLocaleString()}</span>
      <span className="text-sm leading-5 font-light whitespace-nowrap">{label}</span>
    </Card>
  )
}

/**
 * Progress and completion for every bulk action, per the Figma Change workflow frames:
 * a bar with Minimize and Abort while running, then a titled summary with count cards.
 */
function ProgressFlowContent({ job }: { job: Job }) {
  const { requestAbort, retryFailed, retryJob, setOpenJobId, dismissJob } = useStore()
  const [confirmAbort, setConfirmAbort] = React.useState(false)

  const view = job.reconnecting && job.frozen ? job.frozen : { processed: job.processed, succeeded: job.succeeded, failed: job.failed.length }
  const pct = job.total ? (view.processed / job.total) * 100 : 0
  const running = job.status === 'running' || job.status === 'aborting' || job.status === 'queued'
  const minimize = () => setOpenJobId(null)
  const close = () => (running ? minimize() : dismissJob(job.id))

  const subtitle = `${n(job.total)}${job.skippedCount > 0 ? `, ${job.skippedCount.toLocaleString()} skipped` : ''}`
  const suffix = { success: 'complete', partial: 'complete', aborted: 'aborted', failed: 'failed' } as const
  const title = running ? job.label : `${job.label}: ${suffix[job.status as keyof typeof suffix]}`

  let footer: React.ReactNode
  if (running && confirmAbort && job.status !== 'aborting') {
    footer = (
      <>
        <Button variant="secondary" onClick={() => setConfirmAbort(false)}>
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
  } else if (running) {
    footer = (
      <>
        <Button variant="secondary" onClick={minimize}>
          Minimize
        </Button>
        <Button variant="destructive" disabled={job.status === 'aborting'} onClick={() => setConfirmAbort(true)}>
          {job.status === 'aborting' ? 'Aborting...' : 'Abort'}
        </Button>
      </>
    )
  } else {
    footer = (
      <>
        {(job.status === 'partial' || job.status === 'aborted') && job.failed.length > 0 && (
          <Button variant="secondary" onClick={() => retryFailed(job.id)}>
            Retry failed ({job.failed.length})
          </Button>
        )}
        {job.status === 'failed' && (
          <Button variant="secondary" onClick={() => retryJob(job.id)}>
            Retry
          </Button>
        )}
        <Button onClick={close}>Close</Button>
      </>
    )
  }

  return (
    <ModalPanel size="sm" className={CONFIRM_PANEL} title={title} onClose={close} footer={footer}>
      <div className="flex flex-col gap-4">
        <Subtitle>{subtitle}</Subtitle>

        {running && (
          <>
            {job.reconnecting && (
              <InlineNotification tone="warning">Connection lost. Reconnecting... The action keeps running on the server.</InlineNotification>
            )}
            {job.status === 'queued' && (
              <InlineNotification>Queued. Waiting for another bulk action to finish, because they may touch the same requests.</InlineNotification>
            )}
            <div className="flex flex-col gap-1">
              <ProgressTrack value={pct} />
              <div className="flex justify-between text-xs leading-4 font-light tabular-nums" aria-live="polite">
                <span>
                  {view.processed.toLocaleString()} out of {job.total.toLocaleString()} processed
                </span>
                <span>{Math.round(pct)}%</span>
              </div>
            </div>
            <dl className="grid w-fit grid-cols-[auto_auto] gap-x-2 text-xs leading-4 tabular-nums">
              <dt className="font-medium">Succeeded:</dt>
              <dd className="font-light">{view.succeeded.toLocaleString()}</dd>
              <dt className="font-medium">Failed:</dt>
              <dd className="font-light">{view.failed.toLocaleString()}</dd>
              <dt className="font-medium">Remaining:</dt>
              <dd className="font-light">{(job.total - view.processed).toLocaleString()}</dd>
            </dl>
            {job.status === 'aborting' && (
              <InlineNotification tone="warning">Aborting. The current batch finishes, then the remaining requests won&apos;t be processed.</InlineNotification>
            )}
            {confirmAbort && job.status !== 'aborting' && (
              <InlineNotification tone="warning">
                Abort this action? Requests already processed keep their changes, and the remaining requests won&apos;t be processed.
              </InlineNotification>
            )}
          </>
        )}

        {!running && (
          <>
            {job.status === 'success' && <InlineNotification tone="success">All requests were processed</InlineNotification>}
            {job.status === 'partial' && (
              <InlineNotification tone="warning">
                {n(job.failed.length)} couldn&apos;t be processed. You can retry just the failed ones.
              </InlineNotification>
            )}
            {job.status === 'aborted' && (
              <InlineNotification tone="warning">
                The action was aborted. {n(job.notProcessed)} weren&apos;t processed, and requests processed before the abort keep their changes.
              </InlineNotification>
            )}
            {job.status === 'failed' && (
              <InlineNotification tone="error">{job.error ?? "The action couldn't run."} Try again, and contact support if it keeps happening.</InlineNotification>
            )}
            {job.status !== 'failed' && (
              <div className="flex gap-4">
                <CountCard value={job.succeeded} label="Succeeded" />
                <CountCard value={job.failed.length} label="Failed" />
                {job.status === 'aborted' && <CountCard value={job.notProcessed} label="Not processed" />}
                <CountCard value={job.skippedCount} label="Skipped" />
              </div>
            )}
            <FailedList job={job} />
            {job.skipped && job.skipped.length > 0 && <GroupBox title="Skipped" groups={job.skipped} />}
          </>
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
      {job && <ProgressFlowContent key={job.id} job={job} />}
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
