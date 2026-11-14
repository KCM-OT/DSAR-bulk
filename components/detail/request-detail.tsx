'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
import { StageBadge, Tooltip } from '@/components/common'
import { flagMenuItem, type ActionId } from '@/lib/actions'
import { CURRENT_USER, formatTableDate } from '@/lib/mock-data'
import { MAX_SUBMISSION_SCORE, subjectDetails } from '@/lib/subject-details'
import { useStore } from '@/lib/store'
import type { Stage } from '@/lib/types'
import { cn } from '@/lib/utils'

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

/** Left-column field, per Figma DSAR 4633:21868: 14/20 label over a light 14/20 value, divider below. */
function SideField({ label, children, info }: { label: string; children: React.ReactNode; info?: string }) {
  return (
    <div className="flex min-h-[69px] flex-col gap-[11px] border-b border-vt-border pt-[9px] pb-2 text-sm leading-5">
      <dt className="flex items-center gap-0.5 font-normal whitespace-nowrap">
        {label}
        {info && (
          <Tooltip content={info}>
            <button type="button" aria-label={`About ${label.replace(/:$/, '').toLowerCase()}`} className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-vt-focus-ring">
              <Icon name="circle-info" size={16} />
            </button>
          </Tooltip>
        )}
      </dt>
      <dd className="font-light">{children}</dd>
    </div>
  )
}

/** Main-column detail row: a 190px bold label, 110px gap, light value, 40px tall. */
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-10 items-center gap-[110px] text-base leading-6">
      <dt className="w-[190px] shrink-0 font-medium">{label}</dt>
      <dd className="min-w-0 font-light">{children}</dd>
    </div>
  )
}

const DASHES = '----'

const FLAG_LABEL = { confirmed: 'Confirmed', suspected: 'Suspected' } as const

export function RequestDetail({ id }: { id: string }) {
  const { byId, updateRequests, pushToast } = useStore()
  const router = useRouter()
  const request = byId.get(id)
  // The address block starts open; "show less" collapses it to its divider line.
  const [addressOpen, setAddressOpen] = React.useState(true)
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
  const d = subjectDetails(r)
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
      <header className="flex items-start justify-between gap-8 border-b border-[#a9a9a9] bg-vt-surface p-6">
        <div className="min-w-0">
          <Breadcrumb items={[{ label: 'Requests', href: '/', onClick: () => router.push('/') }, { label: r.id }]} className="[&_a]:text-vt-information" />
          <div className="flex flex-wrap items-center gap-2 py-2">
            <h1 className="font-heading text-2xl leading-8 font-semibold">Requests</h1>
            <StageBadge stage={r.stage} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-stretch">
          <Button variant="secondary" disabled>
            Results summary
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="More actions"
                className={buttonVariants({ variant: 'outline', size: 'icon' })}
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
              <DropdownMenuLabel>Automated submission</DropdownMenuLabel>
              {/* Same items as the bulk menu: Flag as / Change to / Remove, worded for this request's flag. */}
              {(['confirmed', 'suspected'] as const).map((flag) => (
                <DropdownMenuItem key={flag} inGroup onSelect={() => setPending({ action: 'set-flag', ids: [r.id], single: true, flag })}>
                  {flagMenuItem(flag, [r]).label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left details column */}
        <aside className="w-[188px] shrink-0 overflow-y-auto [scrollbar-width:none] bg-vt-surface px-[9px] text-vt-dark-text">
          <dl>
            <SideField label="Hours worked:">{d.hoursWorked}</SideField>
            <SideField label="Total cost:">{d.totalCost}</SideField>
            <SideField label="Preferred language:">{d.language}</SideField>
            <SideField label="Workflow:">{r.workflow}</SideField>
            <SideField label="Approver:">{r.assignee ?? DASHES}</SideField>
            <SideField label="Managing organization:">{r.organization}</SideField>
            <SideField label="Date opened:">{formatTableDate(r.createdAt)}</SideField>
            <SideField label="Extended:">{r.extended ? 'Yes' : 'No'}</SideField>
            <SideField label="Deadline:">{terminal ? DASHES : formatTableDate(r.deadline)}</SideField>
            <SideField label="Resolution:">{r.resolution ?? DASHES}</SideField>
            <SideField label="Web form (version):">{d.webForm}</SideField>
            <SideField label="Last portal access:" info="When the data subject last signed in to the privacy portal.">
              {DASHES}
            </SideField>
            <SideField label="Automated submission" info="Indicates if the request was submitted through an automated process.">
              {r.flag ? FLAG_LABEL[r.flag] : DASHES}
            </SideField>
            <SideField label="Submission Score" info="How likely the request is to come from an automated process, scored when it was submitted.">
              {d.submissionScore} out of {MAX_SUBMISSION_SCORE}
            </SideField>
          </dl>
        </aside>

        {/* Main column */}
        <main className="min-w-0 flex-1 overflow-y-auto border-l border-vt-border bg-vt-surface text-vt-dark-text">
          <dl className="pt-4 pb-10 pl-6">
            <InfoRow label="Request type:">{r.requestType}</InfoRow>
            <InfoRow label="Subject type:">{r.subjectType}</InfoRow>
            <InfoRow label="Email:">{r.email}</InfoRow>
            <InfoRow label="Country:">{d.country}</InfoRow>
          </dl>

          <div className={cn('relative border-t border-vt-border pl-6', addressOpen ? 'pt-4 pb-10' : 'pb-3')}>
            <button
              type="button"
              aria-expanded={addressOpen}
              aria-controls="subject-address"
              onClick={() => setAddressOpen((o) => !o)}
              className="absolute top-0 right-0 inline-flex -translate-y-1/2 items-center bg-vt-surface px-2 text-base leading-6 font-light outline-none hover:text-vt-information focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
            >
              {addressOpen ? 'show less' : 'show more'}
              <Icon name="caret-down" variant="filled" size={24} className={addressOpen ? '' : '-rotate-90'} />
            </button>
            <dl id="subject-address" hidden={!addressOpen}>
              <InfoRow label="Address:">{d.address}</InfoRow>
              <InfoRow label="City:">{d.city}</InfoRow>
              <InfoRow label="Zip:">{d.zip}</InfoRow>
            </dl>
          </div>

          <section className="flex justify-center border-y border-vt-border py-[47px]">
            <div className="flex w-full max-w-[818px] items-center gap-2 px-4">
              <Path steps={PATH_STEPS} current={index} className="flex-1 py-0 [&_button]:text-sm [&_button]:leading-5 [&_li]:flex-auto [&>div]:px-0"
              />
              <Button variant="ghost" onClick={advance} disabled={terminal} className="shrink-0">
                Advance
              </Button>
            </div>
          </section>

          <Tabs value={tab} onValueChange={setTab} className="gap-0 pt-[60px]">
            <TabsList className="justify-center">
              <TabsTrigger value="id-verification">Id verification</TabsTrigger>
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
