'use client'

import * as React from 'react'
import { ChevronDown, FileText, Mail, Pencil } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RichTextEditor } from '@/components/rich-text-editor'
import { StageBadge } from '@/components/common'
import { CURRENT_USER, formatDate, RESPONSE_TEMPLATES } from '@/lib/mock-data'
import { useStore } from '@/lib/store'
import type { DsarRequest, Stage } from '@/lib/types'
import { cn } from '@/lib/utils'

const SUBTASK_NAMES = [
  'Verify identity documents',
  'Search CRM for personal data',
  'Search marketing systems',
  'Compile response package',
]

function SectionHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
      <h3 className="font-heading text-2xl font-medium tracking-[-0.02em]">{title}</h3>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

function NotWired({ label }: { label: string }) {
  const { pushToast } = useStore()
  return (
    <Button variant="secondary" onClick={() => pushToast({ tone: 'info', text: `${label} is not wired up in this prototype.` })}>
      {label}
    </Button>
  )
}

/* ------------------------------------------------------------------ ID verification */

export function IdVerificationTab({ request }: { request: DsarRequest }) {
  const verified = ['In progress', 'Awaiting data', 'Complete'].includes(request.stage)
  return (
    <div>
      <SectionHeader title="ID verification">
        <NotWired label="Add verification" />
      </SectionHeader>
      <Table className="[&_td]:h-12">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Verification methods</TableHead>
            <TableHead align="center">Required</TableHead>
            <TableHead align="center">Results</TableHead>
            <TableHead align="center">Last update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="pl-4 text-vt-information">Email</TableCell>
            <TableCell align="center" className="font-light">
              Yes
            </TableCell>
            <TableCell align="center">
              <Badge size="small" tabIndex={-1} variant={verified ? 'success' : 'default'}>
                {verified ? 'Verified' : 'Unverified'}
              </Badge>
            </TableCell>
            <TableCell align="center" className="font-light">
              {formatDate(request.createdAt)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

/* ------------------------------------------------------------------ Subtasks */

export function SubtasksTab({ request }: { request: DsarRequest }) {
  const rows = Array.from({ length: request.subtasksTotal }, (_, i) => {
    const done = i < request.subtasksDone
    const required = request.requiredSubtaskOpen && i === request.subtasksDone
    return { name: SUBTASK_NAMES[i % SUBTASK_NAMES.length], done, required }
  })
  return (
    <div>
      <SectionHeader title="Subtasks">
        <NotWired label="Refresh" />
        <NotWired label="User subtask" />
        <NotWired label="Add connection" />
      </SectionHeader>
      <Table className="[&_td]:h-12">
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Task</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>System</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Processing in time</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Deadline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="pl-4 text-vt-information">
                {row.name}
                {row.required && <span className="ml-1 text-xs font-light text-vt-error">(required)</span>}
              </TableCell>
              <TableCell className="font-light">User</TableCell>
              <TableCell className="font-light text-vt-grey-text">---</TableCell>
              <TableCell className="font-light uppercase">{request.stage}</TableCell>
              <TableCell>
                <Badge size="small" tabIndex={-1} variant={row.done ? 'success' : 'default'}>
                  {row.done ? 'Completed' : 'Unassigned'}
                </Badge>
              </TableCell>
              <TableCell className="font-light text-vt-grey-text">---</TableCell>
              <TableCell className="font-light text-vt-grey-text">{row.done ? (request.assignee ?? '---') : '---'}</TableCell>
              <TableCell className="font-light text-vt-grey-text">---</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="py-10 text-center text-sm font-light text-vt-grey-text">
                No subtasks on this request
              </td>
            </tr>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

/* ------------------------------------------------------------------ Activity */

type FeedEntry = {
  key: string
  who: string
  verb: string
  at: string
  stage: Stage
  text: string
  attachments: string[]
  internal?: boolean
}

function FeedItem({ entry }: { entry: FeedEntry }) {
  const [open, setOpen] = React.useState(true)
  return (
    <li className="border-t border-vt-border px-16 py-4">
      <div className="flex items-center gap-3">
        <Mail className="size-4 shrink-0 text-vt-dark-text" aria-hidden />
        <p className="min-w-0 flex-1 text-sm">
          <span className="font-heading font-medium">{entry.who}</span> <span className="font-light">{entry.verb}</span>{' '}
          <span className="ml-1 text-xs font-light text-vt-grey-text">{formatDate(entry.at)}</span>
          {entry.internal && (
            <Badge size="small" variant="metadata" tabIndex={-1} className="ml-2 align-middle">
              Internal
            </Badge>
          )}
        </p>
        <StageBadge stage={entry.stage} />
        <button
          type="button"
          aria-label={open ? 'Collapse' : 'Expand'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="grid size-7 place-items-center rounded hover:bg-vt-information-light"
        >
          <ChevronDown className={cn('size-5 transition-transform', !open && '-rotate-90')} />
        </button>
      </div>
      {open && (
        <div className="mt-3 pl-7">
          <p className="text-sm font-light whitespace-pre-wrap">{entry.text}</p>
          {entry.attachments.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1">
              {entry.attachments.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm font-light italic">
                  <FileText className="size-3.5" aria-hidden />
                  {a}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

export function ActivityTab({ request }: { request: DsarRequest }) {
  const { updateRequests, pushToast } = useStore()
  const [kind, setKind] = React.useState<'public' | 'internal'>('internal')
  const [template, setTemplate] = React.useState<string | undefined>()
  const [text, setText] = React.useState('')
  const [attachments, setAttachments] = React.useState<string[]>([])

  const entries: FeedEntry[] = [
    ...request.comments.map((c, i) => ({
      key: `c${i}`,
      who: c.by,
      verb: 'Has submitted a comment',
      at: c.at,
      stage: c.stage ?? request.stage,
      text: c.text,
      attachments: c.attachments,
      internal: c.kind === 'internal',
    })),
    {
      key: 'submitted',
      who: request.name,
      verb: 'Submitted a request',
      at: request.createdAt,
      stage: 'Unverified' as Stage,
      text: request.flag ? `Submitted by ${request.submittedBy}.` : 'Request submitted via the privacy web form.',
      attachments: [],
    },
  ]

  const post = () => {
    const now = new Date().toISOString()
    updateRequests([request.id], (r) => ({
      ...r,
      comments: [{ at: now, by: CURRENT_USER, kind, text, attachments, stage: r.stage }, ...r.comments],
      audit: [{ at: now, by: CURRENT_USER, text: kind === 'public' ? 'Public comment sent to data subject' : 'Internal comment added' }, ...r.audit],
    }))
    setText('')
    setAttachments([])
    setTemplate(undefined)
    pushToast({ tone: 'success', title: 'Success', text: kind === 'public' ? 'Message sent to the data subject.' : 'Internal comment posted.' })
  }

  return (
    <div>
      <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-6">
        <div className="flex items-end justify-between gap-4">
          <Tabs value={kind} onValueChange={(v) => setKind(v as 'public' | 'internal')} className="gap-0">
            <TabsList className="border-b-0">
              <TabsTrigger value="public" className="py-1.5 text-sm">
                Public
              </TabsTrigger>
              <TabsTrigger value="internal" className="py-1.5 text-sm">
                Internal
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="w-60">
            <Select
              value={template}
              onValueChange={(id) => {
                setTemplate(id)
                setText(RESPONSE_TEMPLATES.find((t) => t.id === id)?.body ?? '')
              }}
            >
              <SelectTrigger className="h-7 text-sm">
                <SelectValue placeholder="Select Response(s)" />
              </SelectTrigger>
              <SelectContent>
                {RESPONSE_TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-sm">
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <RichTextEditor
          value={text}
          onChange={setText}
          placeholder="Please enter a message."
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          minHeight="min-h-20"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setAttachments((a) => [...a, `attachment-${a.length + 1}.pdf`])}>
            Attach files
          </Button>
          <Button disabled={!text.trim()} onClick={post}>
            Post
          </Button>
        </div>
      </div>
      <ul>
        {entries.map((e) => (
          <FeedItem key={e.key} entry={e} />
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ History */

export function HistoryTab({ request }: { request: DsarRequest }) {
  const [collapsed, setCollapsed] = React.useState<Set<number>>(new Set())
  const allCollapsed = collapsed.size === request.audit.length && request.audit.length > 0
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div>
        <Button
          variant="secondary"
          onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(request.audit.map((_, i) => i)))}
        >
          {allCollapsed ? 'Expand all' : 'Collapse all'}
        </Button>
      </div>
      <ol className="relative flex flex-col gap-4 border-l border-vt-border pl-6">
        {request.audit.map((a, i) => {
          const open = !collapsed.has(i)
          return (
            <li key={i} className="relative">
              <span className="absolute top-0.5 -left-[33px] grid size-4 place-items-center rounded-sm bg-vt-information text-vt-light-text">
                <Pencil className="size-2.5" aria-hidden />
              </span>
              <button
                type="button"
                onClick={() =>
                  setCollapsed((prev) => {
                    const next = new Set(prev)
                    if (next.has(i)) next.delete(i)
                    else next.add(i)
                    return next
                  })
                }
                className="flex w-full items-center gap-2 text-left text-sm"
              >
                <ChevronDown className={cn('size-4 transition-transform', !open && '-rotate-90')} aria-hidden />
                <span className="font-heading font-medium">{a.by}</span>
                <span className="font-light">made changes</span>
                <span className="ml-auto text-xs font-light text-vt-grey-text">{formatDate(a.at)}</span>
              </button>
              {open && <p className="mt-2 rounded bg-vt-information-light px-4 py-3 text-sm font-light">{a.text}</p>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
