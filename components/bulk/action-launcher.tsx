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
import { PlanSummary } from '@/components/bulk/plan-summary'
import { ACTION_LABELS, computePlan, type ActionId, type ActionParams, type ReplyAs } from '@/lib/actions'
import { ASSIGNEES, RESPONSE_TEMPLATES, WORKFLOWS } from '@/lib/mock-data'
import { useStore } from '@/lib/store'
import type { DsarRequest } from '@/lib/types'
import { cn } from '@/lib/utils'

export type PendingAction = { action: ActionId; ids: string[]; single?: boolean }

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

  const needsInput = (action === 'assign' && !params.assignee) || (action === 'change-workflow' && !params.workflow)
  const isFlag = action.startsWith('flag') || action.startsWith('remove')
  const flagName = action.endsWith('confirmed') ? 'Confirmed automation' : 'Suspected automation'

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
            variant={action === 'reject' ? 'destructive' : 'default'}
            disabled={needsInput || plan.processIds.length === 0}
            onClick={() => onConfirm(params, plan.processIds, plan.skippedCount)}
          >
            {ACTION_LABELS[action]}
            {plan.processIds.length > 0 && !needsInput ? ` (${plan.processIds.length})` : ''}
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

        {action === 'change-workflow' && <WorkflowFields params={params} setParams={setParams} selected={selected} optional={false} />}

        {isFlag && (
          <>
            <Note>
              {action.startsWith('flag')
                ? `Flagged requests move to the ${flagName} view the next time the list refreshes. Stage, assignee, submitter data and due date don't change.`
                : `Requests move from the ${flagName} view to Standard requests the next time the list refreshes. Stage, assignee, submitter data and due date don't change.`}
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

function CommentModal({
  selected,
  onClose,
  onConfirm,
}: {
  selected: DsarRequest[]
  onClose: () => void
  onConfirm: (params: ActionParams, ids: string[], skipped: number) => void
}) {
  const [kind, setKind] = React.useState<'public' | 'internal'>('public')
  const [text, setText] = React.useState('')
  const [template, setTemplate] = React.useState<string | undefined>()
  const [attachments, setAttachments] = React.useState<string[]>([])
  const [replyAs, setReplyAs] = React.useState<ReplyAs>(null)
  const [confirming, setConfirming] = React.useState(false)

  const params: ActionParams = { commentKind: kind, commentText: text, replyAs: kind === 'public' ? replyAs : null, attachments }
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
        size="sm"
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
            <Note tone="warning">
              This message will be sent to the data subject of {n(plan.processIds.length)}
              {replyAs ? `, and those requests will be marked ${replyAs}` : ''}. Data subjects are notified by email, the same as for a single
              public comment.
            </Note>
          ) : (
            <Note>This internal comment will be added to {n(plan.processIds.length)}. Data subjects won&apos;t see it.</Note>
          )}
          <PlanSummary plan={plan} selectedCount={selected.length} />
        </div>
      </ModalPanel>
    )
  }

  return (
    <ModalPanel size="md" title={`Add comment: ${n(selected.length)} selected`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Tabs value={kind} onValueChange={(v) => setKind(v as 'public' | 'internal')}>
          <TabsList>
            <TabsTrigger value="public">Public comment</TabsTrigger>
            <TabsTrigger value="internal">Internal comment</TabsTrigger>
          </TabsList>
        </Tabs>

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

export function ActionLauncher({
  pending,
  onClose,
  onStarted,
}: {
  pending: PendingAction
  onClose: () => void
  onStarted: () => void
}) {
  const { byId, startJob } = useStore()
  // Freeze the selection when the modal opens so the summary doesn't shift underneath the user.
  const [selected] = React.useState(() => pending.ids.map((id) => byId.get(id)).filter((r): r is DsarRequest => Boolean(r)))

  const confirm = (params: ActionParams, ids: string[], skipped: number) => {
    startJob(pending.action, { ...params, single: pending.single }, ids, skipped)
    onStarted()
  }

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      {pending.action === 'comment' ? (
        <CommentModal selected={selected} onClose={onClose} onConfirm={confirm} />
      ) : (
        <StandardActionModal pending={pending} selected={selected} onClose={onClose} onConfirm={confirm} />
      )}
    </Modal>
  )
}
