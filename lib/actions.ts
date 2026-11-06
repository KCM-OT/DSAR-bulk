import { CURRENT_USER, TODAY } from './mock-data'
import type { DsarRequest, Stage } from './types'

export type ActionId =
  | 'assign'
  | 'extend'
  | 'reject'
  | 'close'
  | 'mark-read'
  | 'mark-unread'
  | 'comment'
  | 'complete'
  | 'change-workflow'
  | 'flag-confirmed'
  | 'flag-suspected'
  | 'remove-confirmed'
  | 'remove-suspected'
  | 'move-to-standard'

export type ReplyAs = null | 'completed' | 'rejected' | 'extended'

export type ActionParams = {
  assignee?: string
  reason?: string
  commentKind?: 'public' | 'internal'
  commentText?: string
  replyAs?: ReplyAs
  attachments?: string[]
  /** Target workflow for Change workflow, or the optional workflow on flag actions. */
  workflow?: string | null
  deleteOpenSubtasks?: boolean
  /** True when launched for one request from its details page rather than as a bulk action. */
  single?: boolean
  /** Comment launched as "Bulk public comment": no internal tab. */
  publicOnly?: boolean
}

export const ACTION_LABELS: Record<ActionId, string> = {
  assign: 'Assign',
  extend: 'Extend',
  reject: 'Reject',
  close: 'Close',
  'mark-read': 'Mark as read',
  'mark-unread': 'Mark as unread',
  comment: 'Add comment',
  complete: 'Complete',
  'change-workflow': 'Change workflow',
  'flag-confirmed': 'Flag as confirmed automation',
  'flag-suspected': 'Flag as suspected automation',
  'remove-confirmed': 'Remove confirmed automation flag',
  'remove-suspected': 'Remove suspected automation flag',
  'move-to-standard': 'Move to standard queue',
}

export function jobLabel(action: ActionId, params: ActionParams) {
  if (action === 'comment') {
    if (params.commentKind === 'internal') return 'Bulk internal comment'
    if (params.publicOnly) return params.replyAs ? `Bulk public comment (reply as ${params.replyAs})` : 'Bulk public comment'
    if (params.replyAs) return `Public comment (reply as ${params.replyAs})`
    return 'Add public comment'
  }
  if ((action === 'reject' || action === 'close') && !params.single) return `Bulk ${ACTION_LABELS[action].toLowerCase()}`
  return ACTION_LABELS[action]
}

const PAST_TENSE: Record<ActionId, string> = {
  assign: 'assigned',
  extend: 'extended',
  reject: 'rejected',
  close: 'closed',
  'mark-read': 'marked as read',
  'mark-unread': 'marked as unread',
  comment: 'updated with your comment',
  complete: 'completed',
  'change-workflow': 'moved to the new workflow',
  'flag-confirmed': 'flagged as confirmed automation',
  'flag-suspected': 'flagged as suspected automation',
  'remove-confirmed': 'unflagged',
  'remove-suspected': 'unflagged',
  'move-to-standard': 'moved to the standard queue',
}

/** Toast copy for a completed bulk action, e.g. "2 request(s) successfully rejected." */
export function successMessage(action: ActionId, params: ActionParams, count: number) {
  if (action === 'comment' && params.commentKind === 'public') return `Message successfully sent for ${count.toLocaleString()} request(s).`
  return `${count.toLocaleString()} request(s) successfully ${PAST_TENSE[action]}.`
}

const TERMINAL: Stage[] = ['Complete', 'Rejected', 'Closed', 'Expired']
/** Stages in which the workflow can't be changed (Story 6, AC 4). */
export const WORKFLOW_LOCKED: Stage[] = ['Unverified', 'Rejected', 'Closed', 'Complete', 'Expired']

export type PlanGroup = {
  key: string
  tone: 'success' | 'info' | 'warning'
  count: number
  text: string
  ids: string[]
}

export type Plan = {
  /** Requests the job will process. */
  processIds: string[]
  /** What happens to the processed requests (one or more groups). */
  outcome: PlanGroup[]
  /** Requests left out of the job entirely, grouped by reason. */
  skipped: PlanGroup[]
  skippedCount: number
}

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)
const reqs = (n: number) => `${n.toLocaleString()} ${plural(n, 'request', 'requests')}`
const isAre = (n: number) => plural(n, 'is', 'are')
const hasHave = (n: number) => plural(n, 'has', 'have')

type SkipRule = { key: string; test: (r: DsarRequest) => boolean; text: (n: number) => string }

function partition(requests: DsarRequest[], rules: SkipRule[]) {
  const skipped = new Map<string, { rule: SkipRule; ids: string[] }>()
  const kept: DsarRequest[] = []
  for (const r of requests) {
    const rule = rules.find((candidate) => candidate.test(r))
    if (rule) {
      const bucket = skipped.get(rule.key) ?? { rule, ids: [] }
      bucket.ids.push(r.id)
      skipped.set(rule.key, bucket)
    } else kept.push(r)
  }
  const groups: PlanGroup[] = [...skipped.values()].map(({ rule, ids }) => ({
    key: rule.key,
    tone: 'warning',
    count: ids.length,
    text: rule.text(ids.length),
    ids,
  }))
  return { kept, skipped: groups }
}

const stageRule = (stages: Stage[], key = 'stage'): SkipRule => ({
  key,
  test: (r) => stages.includes(r.stage),
  text: (n) => `${reqs(n)} aren't eligible due to their current stage, hence skipped`,
})

function flagName(flag: 'confirmed' | 'suspected') {
  return flag === 'confirmed' ? 'confirmed automation' : 'suspected automation'
}

export function computePlan(action: ActionId, params: ActionParams, selected: DsarRequest[]): Plan {
  let rules: SkipRule[] = []
  let outcome: (kept: DsarRequest[]) => PlanGroup[] = (kept) => [
    { key: 'ok', tone: 'success', count: kept.length, text: `${reqs(kept.length)} will be updated`, ids: kept.map((r) => r.id) },
  ]

  switch (action) {
    case 'assign':
      rules = [
        {
          key: 'same',
          test: (r) => r.assignee === params.assignee,
          text: (n) => `${reqs(n)} ${isAre(n)} already assigned to ${params.assignee}, hence skipped`,
        },
      ]
      outcome = (kept) => [ok(kept, `will be assigned to ${params.assignee ?? '...'}`)]
      break
    case 'extend':
      rules = [
        { key: 'extended', test: (r) => r.extended, text: (n) => `${reqs(n)} ${hasHave(n)} already been extended, hence skipped` },
        stageRule([...TERMINAL, 'Unverified']),
      ]
      outcome = (kept) => [ok(kept, 'will have their deadline extended by 45 days')]
      break
    case 'reject':
      rules = [stageRule(TERMINAL)]
      outcome = (kept) => [ok(kept, 'will be rejected')]
      break
    case 'close':
      rules = [stageRule(TERMINAL)]
      outcome = (kept) => [ok(kept, 'will be closed')]
      break
    case 'mark-read':
      rules = [{ key: 'read', test: (r) => !r.unread, text: (n) => `${reqs(n)} ${isAre(n)} already read, hence skipped` }]
      outcome = (kept) => [ok(kept, 'will be marked as read')]
      break
    case 'mark-unread':
      rules = [{ key: 'unread', test: (r) => r.unread, text: (n) => `${reqs(n)} ${isAre(n)} already unread, hence skipped` }]
      outcome = (kept) => [ok(kept, 'will be marked as unread')]
      break
    case 'comment':
      if (params.commentKind === 'internal') {
        outcome = (kept) => [ok(kept, 'will receive this internal comment')]
        break
      }
      rules = [
        {
          key: 'unverified',
          test: (r) => r.stage === 'Unverified' || r.stage === 'Expired',
          text: (n) => `${reqs(n)} ${isAre(n)} in Unverified or Expired stage, hence skipped`,
        },
      ]
      if (params.replyAs === 'completed') {
        rules.push(
          { key: 'subtasks', test: (r) => r.requiredSubtaskOpen, text: (n) => `${reqs(n)} ${hasHave(n)} incomplete required subtasks, hence skipped` },
          stageRule(['Complete', 'Rejected', 'Closed']),
        )
      } else if (params.replyAs === 'rejected') {
        rules.push(stageRule(['Complete', 'Rejected', 'Closed']))
      } else if (params.replyAs === 'extended') {
        rules.push(
          { key: 'extended', test: (r) => r.extended, text: (n) => `${reqs(n)} ${hasHave(n)} already been extended, hence skipped` },
          stageRule(['Complete', 'Rejected', 'Closed']),
        )
      }
      outcome = (kept) => [
        ok(kept, params.replyAs ? `will receive this message and be marked ${params.replyAs}` : 'will receive this message'),
      ]
      break
    case 'complete':
      rules = [
        { key: 'already', test: (r) => r.stage === 'Complete', text: (n) => `${reqs(n)} ${isAre(n)} already complete, hence skipped` },
        stageRule(['Unverified', 'Rejected', 'Closed', 'Expired']),
        { key: 'subtasks', test: (r) => r.requiredSubtaskOpen, text: (n) => `${reqs(n)} ${hasHave(n)} incomplete required subtasks, hence skipped` },
      ]
      outcome = (kept) => [ok(kept, 'will move to the Complete stage')]
      break
    case 'change-workflow':
      rules = [
        stageRule(WORKFLOW_LOCKED),
        {
          key: 'same-wf',
          test: (r) => r.workflow === params.workflow,
          text: (n) => `${reqs(n)} ${isAre(n)} already in ${params.workflow}, hence skipped`,
        },
      ]
      outcome = (kept) => [ok(kept, `will move to ${params.workflow ?? '...'}`)]
      break
    case 'flag-confirmed':
    case 'flag-suspected': {
      const flag = action === 'flag-confirmed' ? 'confirmed' : 'suspected'
      const other = flag === 'confirmed' ? 'suspected' : 'confirmed'
      rules = [
        {
          key: 'has-flag',
          test: (r) => r.flag === flag,
          text: (n) => `${reqs(n)} already ${hasHave(n)} the ${flagName(flag)} flag, hence skipped`,
        },
      ]
      outcome = (kept) => {
        const groups = workflowSplit(kept, params.workflow, `will be flagged as ${flagName(flag)}`)
        const replacing = kept.filter((r) => r.flag === other).length
        if (replacing > 0)
          groups.push({
            key: 'replace',
            tone: 'info',
            count: replacing,
            text: `${reqs(replacing)} currently ${hasHave(replacing)} the ${flagName(other)} flag, which will be replaced`,
            ids: kept.filter((r) => r.flag === other).map((r) => r.id),
          })
        return groups
      }
      break
    }
    case 'remove-confirmed':
    case 'remove-suspected': {
      const flag = action === 'remove-confirmed' ? 'confirmed' : 'suspected'
      rules = [
        {
          key: 'no-flag',
          test: (r) => r.flag !== flag,
          text: (n) => `${reqs(n)} don't have the ${flagName(flag)} flag, hence skipped`,
        },
      ]
      outcome = (kept) => workflowSplit(kept, params.workflow, `will have the ${flagName(flag)} flag removed and move to Standard requests`)
      break
    }
    case 'move-to-standard':
      rules = [
        {
          key: 'standard',
          test: (r) => r.flag === null,
          text: (n) => `${reqs(n)} ${isAre(n)} already in Standard requests, hence skipped`,
        },
      ]
      outcome = (kept) => workflowSplit(kept, params.workflow, 'will have their automation flag removed and move to Standard requests')
      break
  }

  const { kept, skipped } = partition(selected, rules)
  return {
    processIds: kept.map((r) => r.id),
    outcome: kept.length ? outcome(kept) : [],
    skipped,
    skippedCount: skipped.reduce((sum, g) => sum + g.count, 0),
  }
}

function ok(kept: DsarRequest[], suffix: string): PlanGroup {
  return { key: 'ok', tone: 'success', count: kept.length, text: `${reqs(kept.length)} ${suffix}`, ids: kept.map((r) => r.id) }
}

export function canChangeWorkflow(r: DsarRequest, target: string | null | undefined) {
  return Boolean(target) && !WORKFLOW_LOCKED.includes(r.stage) && r.workflow !== target
}

function workflowSplit(kept: DsarRequest[], workflow: string | null | undefined, verb: string): PlanGroup[] {
  if (!workflow) return [ok(kept, verb)]
  const both = kept.filter((r) => canChangeWorkflow(r, workflow))
  const flagOnly = kept.filter((r) => !canChangeWorkflow(r, workflow))
  const groups: PlanGroup[] = []
  if (both.length)
    groups.push({
      key: 'both',
      tone: 'success',
      count: both.length,
      text: `${reqs(both.length)} ${verb} and move to ${workflow}`,
      ids: both.map((r) => r.id),
    })
  if (flagOnly.length)
    groups.push({
      key: 'flag-only',
      tone: 'info',
      count: flagOnly.length,
      text: `${reqs(flagOnly.length)} ${verb}, but keep their current workflow (already in ${workflow}, or in a stage where the workflow can't change)`,
      ids: flagOnly.map((r) => r.id),
    })
  return groups
}

function audit(r: DsarRequest, text: string): DsarRequest {
  return { ...r, audit: [{ at: new Date().toISOString(), by: CURRENT_USER, text: `${text} (bulk action)` }, ...r.audit] }
}

function changeWorkflow(r: DsarRequest, workflow: string, deleteOpen: boolean): DsarRequest {
  const next = { ...r, workflow }
  if (deleteOpen) {
    next.subtasksTotal = r.subtasksDone
    next.requiredSubtaskOpen = false
  }
  return next
}

/** Applies a bulk action to one request. Mirrors the single-request behaviour described in the PRD. */
export function applyAction(r: DsarRequest, action: ActionId, params: ActionParams): DsarRequest {
  const next = applyActionInner(r, action, params)
  if (!params.single) return next
  const added = next.audit.length - r.audit.length
  return {
    ...next,
    audit: next.audit.map((a, i) => (i < added ? { ...a, text: a.text.replace(' (bulk action)', '') } : a)),
  }
}

function applyActionInner(r: DsarRequest, action: ActionId, params: ActionParams): DsarRequest {
  switch (action) {
    case 'assign':
      return audit({ ...r, assignee: params.assignee ?? null }, `Assigned to ${params.assignee}`)
    case 'extend':
      return audit(
        { ...r, extended: true, deadline: new Date(new Date(r.deadline).getTime() + 45 * 86400000).toISOString() },
        'Deadline extended by 45 days',
      )
    case 'reject': {
      let next = audit(
        { ...r, stage: 'Rejected' as Stage, resolution: params.reason },
        `Request rejected${params.reason ? `: ${params.reason}` : ''}`,
      )
      if (params.commentText?.trim()) {
        const kind = params.commentKind ?? 'internal'
        next = audit(
          {
            ...next,
            comments: [
              {
                at: new Date().toISOString(),
                by: CURRENT_USER,
                kind,
                stage: r.stage,
                text: params.commentText.replaceAll('{{RequestId}}', r.id).replaceAll('{{SubjectFirstName}}', r.name.split(' ')[0]),
                attachments: params.attachments ?? [],
              },
              ...next.comments,
            ],
          },
          kind === 'public' ? 'Rejection message sent to data subject' : 'Internal comment added',
        )
      }
      return next
    }
    case 'close':
      return audit({ ...r, stage: 'Closed' }, `Request closed${params.reason ? `: ${params.reason}` : ''}`)
    case 'mark-read':
      return { ...r, unread: false }
    case 'mark-unread':
      return { ...r, unread: true }
    case 'comment': {
      const kind = params.commentKind ?? 'public'
      let next: DsarRequest = {
        ...r,
        comments: [
          {
            at: new Date().toISOString(),
            by: CURRENT_USER,
            kind,
            stage: r.stage,
            text: (params.commentText ?? '').replaceAll('{{RequestId}}', r.id).replaceAll('{{SubjectFirstName}}', r.name.split(' ')[0]),
            attachments: params.attachments ?? [],
          },
          ...r.comments,
        ],
      }
      next = audit(next, kind === 'public' ? 'Public comment sent to data subject' : 'Internal comment added')
      if (params.replyAs === 'completed') next = audit({ ...next, stage: 'Complete', requiredSubtaskOpen: false }, 'Stage changed to Complete')
      if (params.replyAs === 'rejected') next = audit({ ...next, stage: 'Rejected' }, 'Stage changed to Rejected')
      if (params.replyAs === 'extended')
        next = audit(
          { ...next, extended: true, deadline: new Date(new Date(r.deadline).getTime() + 45 * 86400000).toISOString() },
          'Deadline extended by 45 days',
        )
      return next
    }
    case 'complete':
      return audit({ ...r, stage: 'Complete', requiredSubtaskOpen: false }, 'Stage changed to Complete')
    case 'change-workflow':
      return audit(
        changeWorkflow(r, params.workflow!, Boolean(params.deleteOpenSubtasks)),
        `Workflow changed from ${r.workflow} to ${params.workflow}${params.deleteOpenSubtasks ? '; open subtasks deleted' : ''}`,
      )
    case 'move-to-standard': {
      let next: DsarRequest = r.flag ? audit({ ...r, flag: null }, `${cap(flagName(r.flag))} flag removed; moved to Standard requests`) : r
      if (canChangeWorkflow(r, params.workflow)) {
        next = audit(
          changeWorkflow(next, params.workflow!, Boolean(params.deleteOpenSubtasks)),
          `Workflow changed from ${r.workflow} to ${params.workflow}${params.deleteOpenSubtasks ? '; open subtasks deleted' : ''}`,
        )
      }
      return next
    }
    case 'flag-confirmed':
    case 'flag-suspected':
    case 'remove-confirmed':
    case 'remove-suspected': {
      const adding = action.startsWith('flag')
      const flag = action.endsWith('confirmed') ? 'confirmed' : 'suspected'
      let next: DsarRequest = adding
        ? audit({ ...r, flag }, r.flag ? `${cap(flagName(r.flag))} flag replaced with ${flagName(flag)} flag` : `Flagged as ${flagName(flag)}`)
        : audit({ ...r, flag: null }, `${cap(flagName(flag))} flag removed`)
      if (canChangeWorkflow(r, params.workflow)) {
        next = audit(
          changeWorkflow(next, params.workflow!, Boolean(params.deleteOpenSubtasks)),
          `Workflow changed from ${r.workflow} to ${params.workflow}${params.deleteOpenSubtasks ? '; open subtasks deleted' : ''}`,
        )
      }
      return next
    }
  }
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

export const FAILURE_REASONS = [
  'The request was updated by another user while this action ran.',
  'Timed out while saving the request.',
  'The workflow service returned an error.',
]

export function isOverdue(r: DsarRequest) {
  return new Date(r.deadline).getTime() < TODAY.getTime()
}
