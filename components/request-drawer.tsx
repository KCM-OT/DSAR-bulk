'use client'

import * as React from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Drawer } from '@/components/ui/drawer'
import { Icon } from '@/components/ui/icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FlagBadge, StageBadge } from '@/components/common'
import type { ActionId } from '@/lib/actions'
import { daysLeft, formatDate } from '@/lib/mock-data'
import { useStore } from '@/lib/store'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-1.5 text-sm">
      <dt className="font-light text-vt-grey-text">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  )
}

export function RequestDrawer({
  requestId,
  onClose,
  onAction,
}: {
  requestId: string | null
  onClose: () => void
  onAction: (action: ActionId, id: string) => void
}) {
  const { byId } = useStore()
  const r = requestId ? byId.get(requestId) : undefined

  return (
    <Drawer open={Boolean(r)} onOpenChange={(open) => !open && onClose()} size="medium" title={r ? `Request ${r.id}` : 'Request'}>
      {r && (
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-2">
            <StageBadge stage={r.stage} />
            <FlagBadge flag={r.flag} />
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={buttonVariants({ variant: 'secondary' })}>
                    Actions <Icon name="chevron-down" size={12} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72">
                  <DropdownMenuLabel>Automation flag</DropdownMenuLabel>
                  {/* Only the action that matches the current flag state is offered (Stories 4 and 5, AC 2). */}
                  {r.flag === null && (
                    <>
                      <DropdownMenuItem inGroup onSelect={() => onAction('flag-confirmed', r.id)}>
                        Flag as confirmed automation
                      </DropdownMenuItem>
                      <DropdownMenuItem inGroup onSelect={() => onAction('flag-suspected', r.id)}>
                        Flag as suspected automation
                      </DropdownMenuItem>
                    </>
                  )}
                  {r.flag === 'confirmed' && (
                    <DropdownMenuItem inGroup onSelect={() => onAction('remove-confirmed', r.id)}>
                      Remove confirmed automation flag
                    </DropdownMenuItem>
                  )}
                  {r.flag === 'suspected' && (
                    <DropdownMenuItem inGroup onSelect={() => onAction('remove-suspected', r.id)}>
                      Remove suspected automation flag
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem inGroup onSelect={() => onAction('change-workflow', r.id)}>
                    Change workflow
                  </DropdownMenuItem>
                  <DropdownMenuItem inGroup onSelect={() => onAction('assign', r.id)}>
                    Assign
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <dl className="rounded border border-vt-border px-4 py-2">
            <Row label="Name">{r.name}</Row>
            <Row label="Email">{r.email}</Row>
            <Row label="Submitted by">{r.submittedBy}</Row>
            <Row label="Request type">{r.requestType}</Row>
            <Row label="Subject type">{r.subjectType}</Row>
            <Row label="Workflow">{r.workflow}</Row>
            <Row label="Assignee">{r.assignee ?? 'Unassigned'}</Row>
            <Row label="Date created">{formatDate(r.createdAt)}</Row>
            <Row label="Days left">{daysLeft(r) ?? '---'}</Row>
            <Row label="Extended">{r.extended ? 'Yes' : 'No'}</Row>
            <Row label="Subtasks">
              {r.subtasksDone} / {r.subtasksTotal} complete{r.requiredSubtaskOpen ? ' (required subtask open)' : ''}
            </Row>
          </dl>

          {r.comments.length > 0 && (
            <section>
              <h3 className="mb-2 font-heading text-base font-medium">Comments</h3>
              <ul className="flex flex-col gap-2">
                {r.comments.map((c, i) => (
                  <li key={i} className="rounded border border-vt-border p-3 text-sm">
                    <div className="mb-1 flex items-center gap-2 text-xs text-vt-grey-text">
                      <span className="font-medium text-vt-dark-text">{c.by}</span>
                      <span>{c.kind === 'public' ? 'Public' : 'Internal'}</span>
                      <span>{formatDate(c.at)}</span>
                    </div>
                    <p className="font-light whitespace-pre-wrap">{c.text}</p>
                    {c.attachments.length > 0 && (
                      <p className="mt-1 text-xs text-vt-information">{c.attachments.join(', ')}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="mb-2 font-heading text-base font-medium">Audit log</h3>
            <ol className="flex flex-col border-l border-vt-border">
              {r.audit.map((a, i) => (
                <li key={i} className="relative pb-3 pl-4 text-sm">
                  <span className="absolute top-1.5 -left-1 size-2 rounded-full bg-vt-information" />
                  <p className="font-light">{a.text}</p>
                  <p className="text-xs text-vt-grey-text">
                    {a.by} · {formatDate(a.at)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </Drawer>
  )
}
