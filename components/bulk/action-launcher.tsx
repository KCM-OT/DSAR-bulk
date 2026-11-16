'use client'

import * as React from 'react'
import { Bold, ImageIcon, Italic, Link2, List, ListOrdered, Paperclip, Underline } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { Modal, ModalPanel } from '@/components/ui/modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChangeWorkflowModal, ProgressConfirmStep } from '@/components/bulk/change-workflow-modal'
import { InlineNotification } from '@/components/bulk/inline-notification'
import { CONFIRM_PANEL } from '@/components/bulk/modal-styles'
import { PlanSummary } from '@/components/bulk/plan-summary'
import { RejectModal } from '@/components/bulk/reject-modal'
import {
  ACTION_LABELS,
  computePlan,
  flagCounts,
  flagMenuItem,
  submissionName,
  type ActionId,
  type ActionParams,
  type Flag,
  type FlagPlan,
  type FlagState,
  type FlagTarget,
  type Plan,
  type ReplyAs,
} from '@/lib/actions'
import { ASSIGNEES, RESPONSE_TEMPLATES, WORKFLOWS } from '@/lib/mock-data'
import { BATCH_SIZE, useStore } from '@/lib/store'
import { Loading } from '@/components/ui/loading'
import type { DsarRequest } from '@/lib/types'
import { cn } from '@/lib/utils'

export type PendingAction = { action: ActionId; ids: string[]; single?: boolean; commentMode?: 'public' | 'internal'; flag?: Flag }

const KEEP = '__keep'
const REASONS = ['Duplicate request', 'Unable to verify identity', 'Submitted by an unauthorized agent', 'Request withdrawn', 'Other']

const n = (count: number) => `${count.toLocaleString()} ${count === 1 ? 'request' : 'requests'}`

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="font-heading text-sm font-medium">{label}</Label>
      {children}
      {hint && <span className="text-xs font-light text-vt-grey-text">{hint}</span>}
    </div>
  )
}

function Note({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'warning' }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded border px-3 py-2 text-sm leading-5',
        tone === 'info' ? 'border-vt-secondary-2 bg-vt-information-light' : 'border-vt-warning bg-vt-warning-light',
      )}
    >
      <Icon
        name={tone === 'info' ? 'circle-info' : 'triangle-exclamation'}
        variant="filled"
        className={cn('mt-0.5', tone === 'info' ? 'text-vt-information' : 'text-vt-warning')}
      />
      <div>{children}</div>
    </div>
  )
}

function WorkflowFields({
  params,
  setParams,
  selected,
  optional,
}: {
  params: ActionParams
  setParams: React.Dispatch<React.SetStateAction<ActionParams>>
  selected: DsarRequest[]
  optional: boolean
}) {
  return (
    <>
      <Field
        label={optional ? 'Change workflow (optional)' : 'Target workflow'}
        hint={optional ? 'Eligible requests also move to this workflow. Others keep their current workflow.' : undefined}
      >
        <Select
          value={params.workflow ?? (optional ? KEEP : undefined)}
          onValueChange={(v) => setParams((p) => ({ ...p, workflow: v === KEEP ? null : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a workflow" />
          </SelectTrigger>
          <SelectContent>
            {optional && <SelectItem value={KEEP}>Keep current workflow</SelectItem>}
            {WORKFLOWS.map((wf) => {
              const allIn = selected.length > 0 && selected.every((r) => r.workflow === wf)
              return (
                <SelectItem
                  key={wf}
                  value={wf}
                  disabled={allIn}
                  description={allIn ? 'All selected requests are already in this workflow' : undefined}
                >
                  {wf}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </Field>
      {params.workflow && (
        <Switch
          label="Delete subtasks currently open on request"
          description="Open subtasks from the current workflow are deleted when the workflow changes."
          checked={Boolean(params.deleteOpenSubtasks)}
          onCheckedChange={(checked) => setParams((p) => ({ ...p, deleteOpenSubtasks: checked }))}
        />
      )}
    </>
  )
}

function StandardActionModal({
  pending,
  selected,
  onClose,
  onConfirm,
}: {
  pending: PendingAction
  selected: DsarRequest[]
  onClose: () => void
  onConfirm: (params: ActionParams, ids: string[], skipped: number) => void
}) {
  const { action } = pending
  const [params, setParams] = React.useState<ActionParams>(() => ({
    workflow: null,
    assignee: action === 'assign' ? undefined : undefined,
  }))
  const plan = React.useMemo(() => computePlan(action, params, selected), [action, params, selected])

  const needsInput = action === 'assign' && !params.assignee

  const title = pending.single ? ACTION_LABELS[action] : `${ACTION_LABELS[action]}: ${n(selected.length)} selected`

  return (
    <ModalPanel
      size="sm"
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={action === 'reject' && pending.single ? 'destructive' : 'default'}
            disabled={needsInput || plan.processIds.length === 0}
            onClick={() => onConfirm(params, plan.processIds, plan.skippedCount)}
          >
            {pending.single ? ACTION_LABELS[action] : 'Continue'}
            {pending.single && plan.processIds.length > 0 && !needsInput ? ` (${plan.processIds.length})` : ''}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {action === 'assign' && (
          <Field label="Assignee">
            <Select value={params.assignee} onValueChange={(v) => setParams((p) => ({ ...p, assignee: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user or group" />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNEES.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        {action === 'extend' && (
          <>
            <Note>Each eligible request&apos;s deadline is extended by 45 days and the data subject is notified, as with a single extension.</Note>
            <Field label="Reason for extension (optional)">
              <Textarea
                className="min-h-20"
                value={params.reason ?? ''}
                onChange={(e) => setParams((p) => ({ ...p, reason: e.target.value }))}
              />
            </Field>
          </>
        )}

        {(action === 'reject' || action === 'close') && (
          <Field label="Reason">
            <Select value={params.reason} onValueChange={(v) => setParams((p) => ({ ...p, reason: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        {action === 'complete' && (
          <Note>
            Completing works like the &ldquo;Change workflow stage&rdquo; rule: subtasks of skipped stages are skipped, system updates and data
            subject notifications are sent, and downstream automation runs. Assignee, submitter data and flags are kept.
          </Note>
        )}

        {action === 'move-to-standard' && (
          <>
            <Note>
              The confirmed or suspected automated submission flag is removed, and requests move to Standard requests the next time the list
              refreshes. Stage, assignee, submitter data and due date don&apos;t change.
            </Note>
            <WorkflowFields params={params} setParams={setParams} selected={selected} optional />
          </>
        )}

        {(action === 'mark-read' || action === 'mark-unread') && (
          <p className="text-sm">The read state changes only for you.</p>
        )}

        {!needsInput && <PlanSummary plan={plan} selectedCount={selected.length} />}
      </div>
    </ModalPanel>
  )
}

const STATE_NAMES: Record<FlagState, string> = {
  none: 'Standard',
  confirmed: 'Confirmed automated submission',
  suspected: 'Suspected automated submission',
}

/** Options for one group of a mixed selection, worded from that group's current state. */
function targetOptions(from: FlagState): { value: FlagTarget; label: string }[] {
  const opts: { value: FlagTarget; label: string }[] = [
    { value: 'keep', label: from === 'none' ? 'Leave as standard' : `Keep as ${submissionName(from)}` },
  ]
  for (const to of ['confirmed', 'suspected'] as Flag[])
    if (to !== from) opts.push({ value: to, label: from === 'none' ? `Flag as ${submissionName(to)}` : `Change to ${submissionName(to)}` })
  if (from !== 'none') opts.push({ value: 'none', label: 'Remove flag (move to standard queue)' })
  return opts
}

/**
 * Flag, change or remove the automated submission flag. A uniform selection goes straight to
 * the outcome; a mixed one lists each current state with its own choice, pre-set from the menu item.
 */
function FlagModal({
  flag,
  selected,
  single,
  onClose,
  onConfirm,
}: {
  flag: Flag
  selected: DsarRequest[]
  single?: boolean
  onClose: () => void
  onConfirm: (params: ActionParams, ids: string[], skipped: number) => void
}) {
  const item = React.useMemo(() => flagMenuItem(flag, selected), [flag, selected])
  const counts = React.useMemo(() => flagCounts(selected), [selected])
  const [flagPlan, setFlagPlan] = React.useState<FlagPlan>(item.plan)
  const [params, setParams] = React.useState<ActionParams>({ workflow: null })
  const full: ActionParams = { ...params, flagPlan }
  const plan = React.useMemo(
    () => computePlan('set-flag', full, selected),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flagPlan, params, selected],
  )
  const groups = (['none', 'confirmed', 'suspected'] as FlagState[]).filter((s) => counts[s] > 0)
  const title = item.label.replace(/…$/, '')

  return (
    <ModalPanel
      size="sm"
      title={single ? title : `${title}: ${n(selected.length)} selected`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={plan.processIds.length === 0} onClick={() => onConfirm(full, plan.processIds, plan.skippedCount)}>
            {!single ? 'Continue' : item.mixed ? 'Apply' : title}
            {single && plan.processIds.length > 0 ? ` (${plan.processIds.length})` : ''}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Note>
          Requests move between the Standard, Confirmed and Suspected automated submission views the next time the list refreshes. Stage,
          assignee, submitter data and due date don&apos;t change.
        </Note>
        {item.mixed && (
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              The selected requests don&apos;t all have the same automated submission flag. Choose what happens to each group.
            </p>
            {groups.map((from) => (
              <Field key={from} label={`${STATE_NAMES[from]} (${n(counts[from])})`}>
                <Select value={flagPlan[from]} onValueChange={(v) => setFlagPlan((fp) => ({ ...fp, [from]: v as FlagTarget }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targetOptions(from).map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ))}
          </div>
        )}
        <WorkflowFields params={params} setParams={setParams} selected={selected} optional />
        <PlanSummary plan={plan} selectedCount={selected.length} />
      </div>
    </ModalPanel>
  )
}

function CommentModal({
  selected,
  mode,
  onClose,
  onConfirm,
}: {
  selected: DsarRequest[]
  mode?: 'public' | 'internal'
  onClose: () => void
  onConfirm: (params: ActionParams, ids: string[], skipped: number) => void
}) {
  const [kind, setKind] = React.useState<'public' | 'internal'>(mode ?? 'public')
  const publicOnly = mode === 'public'
  const [text, setText] = React.useState('')
  const [template, setTemplate] = React.useState<string | undefined>()
  const [attachments, setAttachments] = React.useState<string[]>([])
  const [replyAs, setReplyAs] = React.useState<ReplyAs>(null)
  const [confirming, setConfirming] = React.useState(false)

  const params: ActionParams = { commentKind: kind, commentText: text, replyAs: kind === 'public' ? replyAs : null, attachments, publicOnly }
  const plan = React.useMemo(
    () => computePlan('comment', params, selected),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kind, replyAs, selected],
  )
  const preview = React.useMemo(() => computePlan('comment', { commentKind: kind, replyAs: null }, selected), [kind, selected])

  const send = (as: ReplyAs) => {
    setReplyAs(as)
    setConfirming(true)
  }

  if (confirming) {
    const isPublic = kind === 'public'
    return (
      <ModalPanel
        size="md"
        className={CONFIRM_PANEL}
        title={isPublic ? 'Send message to data subjects?' : 'Add internal comment?'}
        onClose={onClose}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Back
            </Button>
            <Button disabled={plan.processIds.length === 0} onClick={() => onConfirm(params, plan.processIds, plan.skippedCount)}>
              {isPublic ? `Send to ${n(plan.processIds.length)}` : `Add to ${n(plan.processIds.length)}`}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {isPublic ? (
            <InlineNotification tone="warning">
              This message will be sent to the data subject of {n(plan.processIds.length)}
              {replyAs ? `, and those requests will be marked ${replyAs}` : ''}. Data subjects are notified by email, the same as for a single
              public comment.
            </InlineNotification>
          ) : (
            <InlineNotification>
              This internal comment will be added to {n(plan.processIds.length)}. Data subjects won&apos;t see it.
            </InlineNotification>
          )}
          <PlanSummary plan={plan} selectedCount={selected.length} />
        </div>
      </ModalPanel>
    )
  }

  return (
    <ModalPanel
      size="md"
      title={`${mode === 'public' ? 'Bulk public comment' : mode === 'internal' ? 'Bulk internal comment' : 'Add comment'}: ${n(selected.length)} selected`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        {mode ? (
          <p className="text-sm font-light text-vt-grey-text">
            {mode === 'public'
              ? 'This message is sent to the data subject of each eligible request.'
              : "This comment is added to each selected request. Data subjects won't see it."}
          </p>
        ) : (
          <Tabs value={kind} onValueChange={(v) => setKind(v as 'public' | 'internal')}>
            <TabsList>
              <TabsTrigger value="public">Public comment</TabsTrigger>
              <TabsTrigger value="internal">Internal comment</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <Field label="Response template">
          <Select
            value={template}
            onValueChange={(id) => {
              setTemplate(id)
              setText(RESPONSE_TEMPLATES.find((t) => t.id === id)?.body ?? '')
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {RESPONSE_TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex flex-col rounded border border-vt-control-border focus-within:border-vt-focus-ring">
          <div className="flex items-center gap-1 border-b border-vt-border px-2 py-1 text-vt-grey-text">
            {[Bold, Italic, Underline, List, ListOrdered, Link2].map((I, i) => (
              <button key={i} type="button" className="grid size-7 place-items-center rounded hover:bg-vt-information-light" aria-label="Format">
                <I className="size-4" />
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-vt-border" />
            <button
              type="button"
              aria-label="Insert image"
              onClick={() => setAttachments((a) => [...a, `image-${a.length + 1}.png`])}
              className="grid size-7 place-items-center rounded hover:bg-vt-information-light"
            >
              <ImageIcon className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Attach file"
              onClick={() => setAttachments((a) => [...a, `attachment-${a.length + 1}.pdf`])}
              className="grid size-7 place-items-center rounded hover:bg-vt-information-light"
            >
              <Paperclip className="size-4" />
            </button>
          </div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={kind === 'public' ? 'Write a message to the data subjects' : 'Write an internal comment'}
            className="min-h-40 rounded-none border-0 focus-visible:border-0 focus-visible:p-2 p-2"
          />
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-vt-border p-2">
              {attachments.map((a) => (
                <Badge key={a} closable onClose={() => setAttachments((list) => list.filter((x) => x !== a))}>
                  {a}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs font-light text-vt-grey-text">
          Merge fields such as {'{{SubjectFirstName}}'} and {'{{RequestId}}'} are filled in for each request.
        </p>

        <div className="flex items-center justify-between gap-4 border-t border-vt-border pt-4">
          <span className="text-sm font-light text-vt-grey-text">
            {kind === 'public'
              ? `Will be sent to ${preview.processIds.length} of ${selected.length} selected${preview.skippedCount ? ` (${preview.skippedCount} unverified or expired will be skipped)` : ''}`
              : `Will be added to all ${selected.length} selected`}
          </span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {kind === 'public' ? (
              <div className="flex">
                <Button className="rounded-r-none" disabled={!text.trim()} onClick={() => send(null)}>
                  Reply
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      disabled={!text.trim()}
                      className={buttonVariants({ size: 'icon', className: 'rounded-l-none border-l border-l-vt-primary-1' })}
                      aria-label="More reply options"
                    >
                      <Icon name="chevron-down" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => send('completed')}>Reply as completed</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => send('rejected')}>Reply as rejected</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => send('extended')}>Reply as extended</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button disabled={!text.trim()} onClick={() => send(null)}>
                Add comment
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalPanel>
  )
}

/** Bulk actions with nothing to choose open straight on the confirm step. */
const NO_INPUT: ActionId[] = ['mark-read', 'mark-unread', 'complete']
/** Actions whose modal already has its own confirm step (Figma), so they go straight to progress. */
const OWN_CONFIRM: ActionId[] = ['change-workflow', 'comment']

const b = (text: React.ReactNode) => <strong className="font-medium">{text}</strong>

/** Title, summary and button for the confirm step, per the Figma "Confirm: change workflow" frame. */
function confirmCopy(pending: PendingAction, params: ActionParams, selected: DsarRequest[], count: number) {
  const reqs = b(n(count))
  switch (pending.action) {
    case 'reject':
      return {
        title: 'Confirm: reject',
        submitLabel: 'Reject',
        destructive: true,
        summary: (
          <>
            Reject {reqs}
            {params.reason && <> with the resolution {b(params.reason)}</>}.
            {params.commentText?.trim() &&
              (params.commentKind === 'public'
                ? ' Your comment is sent to each data subject.'
                : ' Your comment is added to each request as an internal comment.')}
          </>
        ),
      }
    case 'close':
      return {
        title: 'Confirm: close',
        // "Close" alone reads like closing this window.
        submitLabel: 'Close requests',
        summary: (
          <>
            Close {reqs}
            {params.reason && <> with the reason {b(params.reason)}</>}.
          </>
        ),
      }
    case 'mark-read':
    case 'mark-unread':
      return {
        title: `Confirm: ${ACTION_LABELS[pending.action].toLowerCase()}`,
        submitLabel: ACTION_LABELS[pending.action],
        summary: (
          <>
            Mark {reqs} as {pending.action === 'mark-read' ? 'read' : 'unread'}. The read state changes only for you.
          </>
        ),
      }
    case 'complete':
      return {
        title: 'Confirm: complete',
        submitLabel: 'Complete',
        summary: (
          <>
            Move {reqs} to the {b('Complete')} stage. Subtasks of skipped stages are skipped, data subjects are notified and downstream
            automation runs.
          </>
        ),
      }
    case 'move-to-standard':
      return {
        title: 'Confirm: move to standard queue',
        submitLabel: 'Move to standard queue',
        summary: (
          <>
            Remove the automated submission flag from {reqs} and move them to {b('Standard requests')}
            {params.workflow && <>. Eligible requests also move to {b(params.workflow)}</>}
            {params.workflow && params.deleteOpenSubtasks && ', and their open subtasks are deleted'}.
          </>
        ),
      }
    case 'set-flag': {
      const item = flagMenuItem(pending.flag ?? 'confirmed', selected)
      const label = item.label.replace(/…$/, '')
      return {
        title: `Confirm: ${label[0].toLowerCase()}${label.slice(1)}`,
        submitLabel: item.mixed ? 'Apply' : label,
        summary: (
          <>
            Update the automated submission flag on {reqs}
            {params.workflow && <>. Eligible requests also move to {b(params.workflow)}</>}.
          </>
        ),
      }
    }
    case 'assign':
      return { title: 'Confirm: assign', submitLabel: 'Assign', summary: <>Assign {reqs} to {b(params.assignee)}.</> }
    case 'extend':
      return { title: 'Confirm: extend', submitLabel: 'Extend', summary: <>Extend the deadline of {reqs} by 45 days.</> }
    default:
      return {
        title: `Confirm: ${ACTION_LABELS[pending.action].toLowerCase()}`,
        submitLabel: ACTION_LABELS[pending.action],
        summary: <>Update {reqs}.</>,
      }
  }
}

export function ActionLauncher({
  pending,
  onClose,
  onStarted,
}: {
  pending: PendingAction
  onClose: () => void
  onStarted: () => void
}) {
  const { byId, jobs, startJob, watchJob, setOpenJobId, dismissJob } = useStore()
  // Freeze the selection when the modal opens so the summary doesn't shift underneath the user.
  const [selected] = React.useState(() => pending.ids.map((id) => byId.get(id)).filter((r): r is DsarRequest => Boolean(r)))
  const [jobId, setJobId] = React.useState<string | null>(null)
  const job = jobId ? jobs.find((j) => j.id === jobId) : undefined

  // After submit the modal stays open with a loader until the job finishes. Success closes it
  // (the store shows a toast); any other outcome opens the progress modal's result view.
  React.useEffect(() => {
    if (!job) return
    if (job.status === 'queued' || job.status === 'running' || job.status === 'aborting') return
    watchJob(job.id, false)
    if (job.status === 'success') dismissJob(job.id)
    else setOpenJobId(job.id)
    onStarted()
  }, [job, watchJob, setOpenJobId, dismissJob, onStarted])

  // Bulk actions (and Change workflow anywhere) follow the Figma progress flow: confirm, then a
  // progress modal with Minimize and Abort, then a completion summary. Single-request actions
  // keep the in-modal loader and success toast.
  const progressFlow = !pending.single || pending.action === 'change-workflow'
  const noInput = progressFlow && NO_INPUT.includes(pending.action)
  const [confirmParams, setConfirmParams] = React.useState<ActionParams | null>(() => (noInput ? {} : null))
  const confirmPlan = React.useMemo(
    () => (confirmParams ? computePlan(pending.action, confirmParams, selected) : null),
    [confirmParams, pending.action, selected],
  )

  const startWithProgress = (params: ActionParams, plan: Plan) => {
    startJob(pending.action, { ...params, single: pending.single }, plan.processIds, plan.skippedCount, undefined, { skipped: plan.skipped })
    onStarted()
  }

  const confirm = (params: ActionParams, ids: string[], skipped: number) => {
    if (progressFlow) {
      if (OWN_CONFIRM.includes(pending.action)) startWithProgress(params, computePlan(pending.action, params, selected))
      else setConfirmParams(params)
      return
    }
    const id = startJob(pending.action, { ...params, single: pending.single }, ids, skipped, undefined, { openModal: false })
    watchJob(id, true)
    setJobId(id)
  }

  // Closing while the job runs leaves it running in the background (Story 7, AC 5).
  const close = () => {
    if (jobId) {
      watchJob(jobId, false)
      onStarted()
    } else onClose()
  }

  const count = job?.total ?? 0
  const processed = job?.processed ?? 0

  return (
    <Modal open onOpenChange={(open) => !open && close()}>
      <div className="relative">
        {confirmParams && confirmPlan && (
          <ProgressConfirmStep
            {...confirmCopy(pending, confirmParams, selected, confirmPlan.processIds.length)}
            plan={confirmPlan}
            onBack={noInput ? undefined : () => setConfirmParams(null)}
            onCancel={close}
            onSubmit={() => startWithProgress(confirmParams, confirmPlan)}
          />
        )}
        {/* Kept mounted (hidden) during the confirm step, so Back returns to the user's choices. */}
        {!noInput && (
          <div className={cn(confirmParams && 'hidden')}>
            {pending.action === 'change-workflow' ? (
              <ChangeWorkflowModal selected={selected} single={pending.single} onClose={close} onStart={startWithProgress} />
            ) : pending.action === 'comment' ? (
              <CommentModal selected={selected} mode={pending.commentMode} onClose={close} onConfirm={confirm} />
            ) : pending.action === 'set-flag' ? (
              <FlagModal flag={pending.flag ?? 'confirmed'} selected={selected} single={pending.single} onClose={close} onConfirm={confirm} />
            ) : pending.action === 'reject' ? (
              <RejectModal selected={selected} single={pending.single} onClose={close} onConfirm={confirm} />
            ) : (
              <StandardActionModal pending={pending} selected={selected} onClose={close} onConfirm={confirm} />
            )}
          </div>
        )}
        {jobId && (
          <div
            aria-busy
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 rounded bg-vt-surface/85 backdrop-blur-[1px] animate-in fade-in-0"
          >
            <button
              type="button"
              aria-label="Close and keep running"
              title="Close. The action keeps running."
              onClick={close}
              className="absolute top-4 right-4 grid size-8 place-items-center rounded text-vt-dark-text hover:bg-vt-information-light"
            >
              <Icon name="xmark" />
            </button>
            <Loading size="md" />
            <p className="font-heading text-base font-medium" aria-live="polite">
              Processing {count.toLocaleString()} request(s)...
            </p>
            {count > BATCH_SIZE && (
              <p className="text-sm font-light text-vt-grey-text tabular-nums">
                {processed.toLocaleString()} of {count.toLocaleString()} processed
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
