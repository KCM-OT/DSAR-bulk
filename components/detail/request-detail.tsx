'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Info, Pencil } from 'lucide-react'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button, buttonVariants } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Path } from '@/components/ui/path'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ActionLauncher, type PendingAction } from '@/components/bulk/action-launcher'
import { ActivityTab, HistoryTab, IdVerificationTab, SubtasksTab } from '@/components/detail/detail-tabs'
import { FlagBadge, StageBadge } from '@/components/common'
import type { ActionId } from '@/lib/actions'
import { CURRENT_USER, formatDate } from '@/lib/mock-data'
import { useStore } from '@/lib/store'
import type { DsarRequest, Stage } from '@/lib/types'

/** Workflow path shown on the request, as in the QA detail page. */
const PATH_STEPS = ['NEW', 'VERIFYING IDENTITY', 'IN PROGRESS', 'COMPLETE']
const PATH_STAGE: Stage[] = ['New', 'Verifying identity', 'In progress', 'Complete']

function pathIndex(stage: Stage) {
  switch (stage) {
    case 'New':
    case 'Unverified':
      return 0
    case 'Verifying identity':
      return 1
    case 'In progress':
    case 'Awaiting data':
      return 2
    default:
      return 3
  }
}

const STAGE_GUIDANCE: Partial<Record<Stage, string>> = {
  New: "Review the request and confirm it's complete. Assign it to a team member, then advance it when you're ready to verify the requester's identity.",
  Unverified:
    "The requester hasn't confirmed their email address yet. The request moves forward automatically once they do, or you can advance it manually.",
  'Verifying identity':
    "You should make sure the person making this request is the individual to whom the personal data actually relates. If you have reasonable doubts concerning the identity of the person making this request, you may request additional information from the person in order to verify his/her identity. You can do so by using the chat box under the 'Public' tab below and upload any associated attachment by clicking the icon under the chat box. Before moving to the next step, we suggest you include a brief comment under the 'Internal' tab to document the reasons that allowed you to complete this step.",
  'In progress':
    "Gather the requested personal data from your systems and complete the subtasks below. Use the 'Public' tab to update the data subject and the 'Internal' tab to document your work.",
  'Awaiting data':
    'Waiting on data from connected systems or subtask owners. Check the Subtasks tab for anything still open.',
  Complete: 'This request is complete. Any response sent to the data subject appears in the activity below.',
  Rejected: 'This request was rejected. No further action is needed.',
  Closed: 'This request was closed. No further action is needed.',
  Expired: 'This request expired before it was completed.',
}

function SideField({ label, children, editable, info }: { label: string; children: React.ReactNode; editable?: boolean; info?: boolean }) {
  return (
    <div className="flex flex-col gap-1 border-b border-vt-border py-3">
      <dt className="flex items-center gap-1 font-heading text-xs font-medium">
        {label}
        {info && <Info className="size-3" aria-hidden />}
      </dt>
      <dd className="flex items-center gap-2 text-xs font-light">
        {children}
        {editable && (
          <button type="button" aria-label={`Edit ${label.toLowerCase()}`} className="text-vt-dark-text hover:text-vt-information">
            <Pencil className="size-3.5" />
          </button>
        )}
      </dd>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_2fr] gap-4 py-2 text-sm">
      <dt className="font-heading font-medium">{label}</dt>
      <dd className="font-light">{children}</dd>
    </div>
  )
}

const DASHES = <span className="text-vt-grey-text">- - - -</span>

function countryFor(r: DsarRequest) {
  const countries = ['United States', 'United States', 'United Kingdom', 'Germany', 'France', 'Canada']
  return countries[r.id.charCodeAt(0) % countries.length]
}

export function RequestDetail({ id }: { id: string }) {
  const { byId, updateRequests, pushToast } = useStore()
  const router = useRouter()
  const request = byId.get(id)
  const [showMore, setShowMore] = React.useState(false)
  const [tab, setTab] = React.useState('activity')
  const [pending, setPending] = React.useState<PendingAction | null>(null)

  // Opening a request marks it as read, as in the product.
  React.useEffect(() => {
    if (request?.unread) updateRequests([id], (r) => ({ ...r, unread: false }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const closeLauncher = React.useCallback(() => setPending(null), [])

  if (!request) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-16 text-center">
        <p className="font-heading text-xl font-medium">Request not found</p>
        <p className="text-sm font-light text-vt-grey-text">The request {id} doesn&apos;t exist in this prototype&apos;s data.</p>
        <Link href="/" className={buttonVariants({ variant: 'secondary' })}>
          Back to requests
        </Link>
      </div>
    )
  }

  const r = request
  const terminal = ['Complete', 'Rejected', 'Closed', 'Expired'].includes(r.stage)
  const index = pathIndex(r.stage)
  const notWired = (label: string) => pushToast({ tone: 'info', text: `${label} is not wired up in this prototype.` })
  const launch = (action: ActionId) => setPending({ action, ids: [r.id], single: true })

  const advance = () => {
    if (terminal) return
    const nextStage = PATH_STAGE[Math.min(index + 1, PATH_STAGE.length - 1)]
    if (nextStage === 'Complete' && r.requiredSubtaskOpen) {
      pushToast({ tone: 'error', title: "Can't advance", text: 'Complete the required subtasks before completing this request.' })
      return
    }
    updateRequests([r.id], (req) => ({
      ...req,
      stage: nextStage,
      requiredSubtaskOpen: nextStage === 'Complete' ? false : req.requiredSubtaskOpen,
      audit: [{ at: new Date().toISOString(), by: CURRENT_USER, text: `Stage changed from ${req.stage} to ${nextStage}` }, ...req.audit],
    }))
    pushToast({ tone: 'success', title: 'Success', text: `Request moved to ${nextStage}.` })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 border-b border-vt-border bg-vt-surface px-6 pt-2 pb-3">
        <div className="min-w-0">
          <Breadcrumb items={[{ label: 'Requests', href: '/', onClick: () => router.push('/') }, { label: r.id }]} className="[&_a]:text-vt-information" />
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl leading-8 font-medium tracking-[-0.03em]">Data subject request details</h1>
            <StageBadge stage={r.stage} />
            {r.flag && <FlagBadge flag={r.flag} />}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-4">
          <Button variant="secondary" onClick={() => notWired('Results summary')}>
            Results summary
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More actions"
                className={buttonVariants({ variant: 'outline', size: 'icon', className: 'border-vt-control-border' })}
              >
                <Icon name="ellipsis" size={24} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-[75vh] w-72 overflow-y-auto">
              <DropdownMenuItem
                onSelect={() => {
                  updateRequests([r.id], (req) => ({ ...req, unread: !req.unread }))
                  pushToast({ tone: 'success', title: 'Success', text: r.unread ? 'Marked as read.' : 'Marked as unread.' })
                }}
              >
                {r.unread ? 'Mark as read' : 'Mark as unread'}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => notWired('Resend email confirmation')}>Resend email confirmation...</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => notWired('Pause deadline')}>Pause deadline</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => notWired('Export')}>Export</DropdownMenuItem>
              <DropdownMenuItem disabled={terminal || r.extended} onSelect={() => launch('extend')}>
                Extend deadline
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => notWired('Link requests')}>Link requests</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => launch('change-workflow')}>Change workflow</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => notWired('Revoke data subject access')}>Revoke data subject access</DropdownMenuItem>
              <DropdownMenuItem disabled={terminal} onSelect={() => launch('reject')}>
                Reject
              </DropdownMenuItem>
              <DropdownMenuItem disabled={terminal} onSelect={() => launch('close')}>
                Close
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => notWired('Delete')}>Delete</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Automation flag</DropdownMenuLabel>
              {/* Only the action that matches the current flag state is offered (Stories 4 and 5, AC 2). */}
              {r.flag === null && (
                <>
                  <DropdownMenuItem inGroup onSelect={() => launch('flag-confirmed')}>
                    Flag as confirmed automation
                  </DropdownMenuItem>
                  <DropdownMenuItem inGroup onSelect={() => launch('flag-suspected')}>
                    Flag as suspected automation
                  </DropdownMenuItem>
                </>
              )}
              {r.flag === 'confirmed' && (
                <DropdownMenuItem inGroup onSelect={() => launch('remove-confirmed')}>
                  Remove confirmed automation flag
                </DropdownMenuItem>
              )}
              {r.flag === 'suspected' && (
                <DropdownMenuItem inGroup onSelect={() => launch('remove-suspected')}>
                  Remove suspected automation flag
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left details column */}
        <aside className="w-[200px] shrink-0 overflow-y-auto border-r border-vt-border bg-vt-surface px-3">
          <dl>
            <SideField label="Preferred language:" editable>
              English
            </SideField>
            <SideField label="Workflow:">{r.workflow}</SideField>
            <SideField label="Approver:" editable>
              {DASHES}
            </SideField>
            <SideField label="Assignee:" editable>
              {r.assignee ?? DASHES}
            </SideField>
            <SideField label="Managing organization:" editable>
              {r.organization}
            </SideField>
            <SideField label="Date opened:">{formatDate(r.createdAt)}</SideField>
            <SideField label="Extended:">{r.extended ? 'Yes' : 'No'}</SideField>
            <SideField label="Deadline:">{terminal ? DASHES : formatDate(r.deadline)}</SideField>
            <SideField label="Resolution:">{r.resolution ?? '---'}</SideField>
            <SideField label="Web Form (Version):">{r.flag ? 'Authorized Agent Form (V1)' : 'Global Web Form (V2)'}</SideField>
            <SideField label="Last portal access" info>
              {DASHES}
            </SideField>
          </dl>
        </aside>

        {/* Main column */}
        <main className="min-w-0 flex-1 overflow-y-auto bg-vt-surface">
          <section className="border-b border-vt-border px-3 py-4">
            <h2 className="font-heading text-lg font-medium">{r.name}</h2>
            <dl className="mt-2 max-w-3xl">
              <InfoRow label="Request ID:">{r.id}</InfoRow>
              <InfoRow label="Request type:">{r.requestType}</InfoRow>
              <InfoRow label="Subject type:">{r.subjectType}</InfoRow>
              <InfoRow label="Email:">{r.email}</InfoRow>
              <InfoRow label="Country:">{countryFor(r)}</InfoRow>
            </dl>
            <div className="mt-2 flex justify-end border-t border-vt-border pt-3">
              <button
                type="button"
                aria-expanded={showMore}
                onClick={() => setShowMore((s) => !s)}
                className="inline-flex items-center gap-1 font-heading text-sm font-medium hover:text-vt-information"
              >
                {showMore ? 'Show less' : 'Show more'}
                <Icon name={showMore ? 'caret-down' : 'caret-up'} variant="filled" size={12} className={showMore ? '' : 'rotate-90'} />
              </button>
            </div>
            {showMore && (
              <dl className="mt-2 max-w-3xl">
                <InfoRow label="State:">{countryFor(r) === 'United States' ? 'California' : '---'}</InfoRow>
                <InfoRow label="Which would you like to receive?:">
                  {r.requestType === 'Deletion' ? 'Delete the personal information you hold about me' : 'The categories of personal information that we collected about you'}
                </InfoRow>
                <InfoRow label="Submitted by:">{r.submittedBy}</InfoRow>
                <InfoRow label="Automation flag:">
                  <FlagBadge flag={r.flag} />
                </InfoRow>
              </dl>
            )}
          </section>

          <section className="flex items-center gap-4 border-b border-vt-border px-3">
            <Path steps={PATH_STEPS} current={index} className="flex-1 py-6" />
            <button
              type="button"
              onClick={advance}
              disabled={terminal}
              className="shrink-0 rounded px-3 py-1 font-heading text-base font-medium text-vt-primary-1 outline-none hover:bg-vt-success-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring disabled:text-vt-empty"
            >
              Advance
            </button>
          </section>

          <section className="px-3 py-4">
            <h2 className="font-heading text-xl font-medium uppercase">{r.stage}</h2>
            <p className="mt-1 max-w-4xl text-sm font-light">{STAGE_GUIDANCE[r.stage]}</p>
          </section>

          <Tabs value={tab} onValueChange={setTab} className="gap-0">
            <TabsList className="justify-center">
              <TabsTrigger value="id-verification">ID verification</TabsTrigger>
              <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </Tabs>
          {tab === 'id-verification' && <IdVerificationTab request={r} />}
          {tab === 'subtasks' && <SubtasksTab request={r} />}
          {tab === 'activity' && <ActivityTab request={r} />}
          {tab === 'history' && <HistoryTab request={r} />}
        </main>
      </div>

      {pending && <ActionLauncher pending={pending} onClose={closeLauncher} onStarted={closeLauncher} />}
    </div>
  )
}
