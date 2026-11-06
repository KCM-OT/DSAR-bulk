'use client'

import * as React from 'react'

import { applyAction, FAILURE_REASONS, jobLabel, type ActionId, type ActionParams } from './actions'
import { generateRequests } from './mock-data'
import type { DsarRequest } from './types'

export const BATCH_SIZE = 20
export const MAX_SELECTION = 500

export type JobStatus = 'queued' | 'running' | 'aborting' | 'success' | 'partial' | 'aborted' | 'failed'

export type Job = {
  id: string
  action: ActionId
  params: ActionParams
  label: string
  ids: string[]
  total: number
  skippedCount: number
  status: JobStatus
  processed: number
  succeeded: number
  failed: { id: string; reason: string }[]
  notProcessed: number
  createdAt: number
  finishedAt?: number
  error?: string
  /** While true the UI has lost its connection and shows the last known values. */
  reconnecting?: boolean
  frozen?: { processed: number; succeeded: number; failed: number }
  retryOf?: string
}

export type DemoSettings = {
  failureRate: number
  speed: 'slow' | 'normal' | 'fast'
  failNextJob: boolean
  dropConnectionNextJob: boolean
}

export type Toast = { id: string; tone: 'success' | 'warning' | 'error' | 'info'; text: string; jobId?: string }
export type Notification = { id: string; text: string; at: number; jobId?: string; read: boolean }

type Store = {
  requests: DsarRequest[]
  byId: Map<string, DsarRequest>
  updateRequests: (ids: string[], fn: (r: DsarRequest) => DsarRequest) => void
  jobs: Job[]
  startJob: (action: ActionId, params: ActionParams, ids: string[], skippedCount: number, retryOf?: string) => string
  requestAbort: (jobId: string) => void
  retryFailed: (jobId: string) => void
  retryJob: (jobId: string) => void
  dismissJob: (jobId: string) => void
  openJobId: string | null
  setOpenJobId: (id: string | null) => void
  refreshToken: number
  refresh: () => void
  settings: DemoSettings
  setSettings: React.Dispatch<React.SetStateAction<DemoSettings>>
  toasts: Toast[]
  pushToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  notifications: Notification[]
  markNotificationsRead: () => void
  resetData: () => void
}

const StoreContext = React.createContext<Store | null>(null)

export function useStore() {
  const store = React.useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}

const SPEED_MS = { slow: 1400, normal: 650, fast: 220 } as const

let counter = 0
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = React.useState<DsarRequest[]>(() => generateRequests())
  const [jobs, setJobs] = React.useState<Job[]>([])
  const [openJobId, setOpenJobId] = React.useState<string | null>(null)
  const [refreshToken, setRefreshToken] = React.useState(0)
  const [settings, setSettings] = React.useState<DemoSettings>({
    failureRate: 0.04,
    speed: 'normal',
    failNextJob: false,
    dropConnectionNextJob: false,
  })
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const abortRequested = React.useRef(new Set<string>())

  // Refs give the timer-driven runner the latest values without restarting it.
  const requestsRef = React.useRef(requests)
  requestsRef.current = requests
  const settingsRef = React.useRef(settings)
  settingsRef.current = settings
  const openJobRef = React.useRef(openJobId)
  openJobRef.current = openJobId

  const byId = React.useMemo(() => new Map(requests.map((r) => [r.id, r])), [requests])

  const updateRequests = React.useCallback((ids: string[], fn: (r: DsarRequest) => DsarRequest) => {
    const set = new Set(ids)
    setRequests((prev) => prev.map((r) => (set.has(r.id) ? fn(r) : r)))
  }, [])

  const pushToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = uid('toast')
    setToasts((prev) => [...prev, { ...toast, id }])
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 7000)
  }, [])

  const dismissToast = React.useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])

  const patchJob = React.useCallback((id: string, patch: Partial<Job> | ((job: Job) => Partial<Job>)) => {
    setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, ...(typeof patch === 'function' ? patch(job) : patch) } : job)))
  }, [])

  const startJob = React.useCallback<Store['startJob']>((action, params, ids, skippedCount, retryOf) => {
    const id = uid('job')
    setJobs((prev) => [
      ...prev,
      {
        id,
        action,
        params,
        label: jobLabel(action, params),
        ids,
        total: ids.length,
        skippedCount,
        status: 'queued',
        processed: 0,
        succeeded: 0,
        failed: [],
        notProcessed: 0,
        createdAt: Date.now(),
        retryOf,
      },
    ])
    setOpenJobId(id)
    return id
  }, [])

  const requestAbort = React.useCallback(
    (jobId: string) => {
      abortRequested.current.add(jobId)
      setJobs((prev) =>
        prev.map((job) => {
          if (job.id !== jobId) return job
          // A queued job never started, so nothing was processed.
          if (job.status === 'queued') return { ...job, status: 'aborted', notProcessed: job.total, finishedAt: Date.now() }
          return { ...job, status: 'aborting' }
        }),
      )
    },
    [],
  )

  const retryFailed = React.useCallback(
    (jobId: string) => {
      const job = jobs.find((j) => j.id === jobId)
      if (!job || job.failed.length === 0) return
      startJob(job.action, job.params, job.failed.map((f) => f.id), 0, job.id)
    },
    [jobs, startJob],
  )

  const retryJob = React.useCallback(
    (jobId: string) => {
      const job = jobs.find((j) => j.id === jobId)
      if (!job) return
      startJob(job.action, job.params, job.ids, job.skippedCount, job.id)
    },
    [jobs, startJob],
  )

  const dismissJob = React.useCallback((jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId))
    setOpenJobId((current) => (current === jobId ? null : current))
  }, [])

  const notifyDone = React.useCallback(
    (job: Job, status: JobStatus, succeeded: number, failed: number, notProcessed: number) => {
      const text =
        status === 'success'
          ? `${job.label}: ${job.total === 1 ? 'request processed' : `all ${job.total.toLocaleString()} requests processed`}`
          : status === 'partial'
            ? `${job.label}: completed with errors (${succeeded} succeeded, ${failed} failed)`
            : status === 'aborted'
              ? `${job.label}: aborted (${succeeded} succeeded, ${notProcessed} not processed)`
              : `${job.label}: failed to run`
      setNotifications((prev) => [{ id: uid('n'), text, at: Date.now(), jobId: job.id, read: false }, ...prev])
      if (openJobRef.current !== job.id) {
        pushToast({
          tone: status === 'success' ? 'success' : status === 'failed' ? 'error' : 'warning',
          text,
          jobId: job.id,
        })
      }
    },
    [pushToast],
  )

  // The runner: one job at a time (overlapping jobs are queued), processed in batches.
  // It lives outside React's effect lifecycle so status changes don't cancel it.
  const runnerBusy = React.useRef(false)
  const nextQueued = jobs.find((j) => j.status === 'queued')

  const runJob = React.useCallback(
    (job: Job) => {
      runnerBusy.current = true
      const finish = () => {
        runnerBusy.current = false
        // Wake the effect so the next queued job (if any) starts.
        setJobs((prev) => [...prev])
      }

      if (settingsRef.current.failNextJob) {
        setSettings((s) => ({ ...s, failNextJob: false }))
        patchJob(job.id, { status: 'running' })
        window.setTimeout(() => {
          patchJob(job.id, {
            status: 'failed',
            finishedAt: Date.now(),
            notProcessed: job.total,
            error: "The bulk action service couldn't start this job. No requests were changed.",
          })
          notifyDone(job, 'failed', 0, 0, job.total)
          finish()
        }, 1200)
        return
      }

      const dropAt = settingsRef.current.dropConnectionNextJob ? Math.max(1, Math.floor(job.total * 0.35)) : -1
      if (dropAt >= 0) setSettings((s) => ({ ...s, dropConnectionNextJob: false }))
      patchJob(job.id, { status: 'running' })

      let processed = 0
      let succeeded = 0
      const failed: Job['failed'] = []
      let dropped = false

      const tick = () => {
        const batch = job.ids.slice(processed, processed + BATCH_SIZE)
        const ok: string[] = []
        for (const id of batch) {
          if (Math.random() < settingsRef.current.failureRate) {
            failed.push({ id, reason: FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)] })
          } else ok.push(id)
        }
        if (ok.length) updateRequests(ok, (r) => applyAction(r, job.action, job.params))
        processed += batch.length
        succeeded += ok.length

        if (!dropped && dropAt >= 0 && processed >= dropAt) {
          dropped = true
          patchJob(job.id, { reconnecting: true, frozen: { processed, succeeded, failed: failed.length } })
          window.setTimeout(() => patchJob(job.id, { reconnecting: false, frozen: undefined }), 3200)
        }

        const done = processed >= job.total
        const aborting = abortRequested.current.has(job.id)
        if (done || aborting) {
          const status: JobStatus = aborting && !done ? 'aborted' : failed.length ? 'partial' : 'success'
          const notProcessed = job.total - processed
          // Keep the "reconnecting" overlay until it clears on its own, so the recovery is visible.
          patchJob(job.id, { status, processed, succeeded, failed: [...failed], notProcessed, finishedAt: Date.now() })
          abortRequested.current.delete(job.id)
          notifyDone(job, status, succeeded, failed.length, notProcessed)
          setRefreshToken((t) => t + 1)
          finish()
          return
        }
        patchJob(job.id, { processed, succeeded, failed: [...failed] })
        window.setTimeout(tick, SPEED_MS[settingsRef.current.speed])
      }

      window.setTimeout(tick, 500)
    },
    [notifyDone, patchJob, updateRequests],
  )

  React.useEffect(() => {
    if (runnerBusy.current || !nextQueued) return
    runJob(nextQueued)
  }, [jobs, nextQueued, runJob])

  const value: Store = {
    requests,
    byId,
    updateRequests,
    jobs,
    startJob,
    requestAbort,
    retryFailed,
    retryJob,
    dismissJob,
    openJobId,
    setOpenJobId,
    refreshToken,
    refresh: () => setRefreshToken((t) => t + 1),
    settings,
    setSettings,
    toasts,
    pushToast,
    dismissToast,
    notifications,
    markNotificationsRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    resetData: () => {
      setRequests(generateRequests())
      setJobs([])
      setOpenJobId(null)
      setNotifications([])
      setRefreshToken((t) => t + 1)
    },
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
