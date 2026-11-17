'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { ModalPanel } from '@/components/ui/modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CONFIRM_PANEL } from '@/components/bulk/modal-styles'
import { GroupBox } from '@/components/bulk/plan-summary'
import { computePlan, type ActionParams, type Plan } from '@/lib/actions'
import { WORKFLOWS } from '@/lib/mock-data'
import type { DsarRequest } from '@/lib/types'

const n = (count: number) => `${count.toLocaleString()} ${count === 1 ? 'request' : 'requests'}`

/** The subtitle under a progress-flow title: 14/20 light, 8px below the title. */
export function Subtitle({ children }: { children: React.ReactNode }) {
  return <p className="-mt-2 text-sm leading-5 font-light text-vt-dark-text">{children}</p>
}

/**
 * Confirm step of a bulk action (Figma, "Confirm: change workflow"): what will happen,
 * a box with the skipped requests, and a note that the action runs in the background.
 */
export function ProgressConfirmStep({
  title,
  summary,
  submitLabel,
  plan,
  destructive,
  onBack,
  onCancel,
  onSubmit,
}: {
  title: string
  summary: React.ReactNode
  submitLabel: string
  plan: Plan
  destructive?: boolean
  /** Omitted when there was no earlier step to go back to. */
  onBack?: () => void
  onCancel: () => void
  onSubmit: () => void
}) {
  const none = plan.processIds.length === 0
  return (
    <ModalPanel
      size="sm"
      className={CONFIRM_PANEL}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              Back
            </Button>
          )}
          <Button variant={destructive ? 'destructive' : 'default'} disabled={none} onClick={onSubmit}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Subtitle>{none ? 'None of the selected requests are eligible for this action.' : summary}</Subtitle>
        {/* Actions with more than one outcome (flags, optional workflow) list each one. */}
        {!none && plan.outcome.length > 1 && <GroupBox title="What will happen" groups={plan.outcome} />}
        {plan.skippedCount > 0 ? (
          <GroupBox title={`${n(plan.skippedCount)} will be skipped`} groups={plan.skipped} filterable />
        ) : (
          plan.outcome.length <= 1 && <GroupBox title="No requests will be skipped" groups={plan.outcome} />
        )}
        <p className="text-xs leading-4 font-light text-vt-dark-text">
          The action runs in the background. You can close the progress window without stopping it.
        </p>
      </div>
    </ModalPanel>
  )
}

/**
 * Change workflow, per the Figma progress flow: choose a workflow (and whether to delete open
 * subtasks), confirm with the skipped requests, then hand off to the progress modal.
 */
export function ChangeWorkflowModal({
  selected,
  single,
  onClose,
  onStart,
}: {
  selected: DsarRequest[]
  single?: boolean
  onClose: () => void
  onStart: (params: ActionParams, plan: Plan) => void
}) {
  const [params, setParams] = React.useState<ActionParams>({ workflow: null, deleteOpenSubtasks: false })
  const [confirming, setConfirming] = React.useState(false)
  const plan = React.useMemo(() => computePlan('change-workflow', params, selected), [params, selected])

  if (confirming && params.workflow) {
    return (
      <ProgressConfirmStep
        title="Confirm: change workflow"
        summary={
          <>
            Change the workflow to <strong className="font-medium">{params.workflow}</strong> for{' '}
            <strong className="font-medium">{n(plan.processIds.length)}</strong>.
            {params.deleteOpenSubtasks && ' Open subtasks on these requests will be deleted.'}
          </>
        }
        submitLabel="Change workflow"
        plan={plan}
        onBack={() => setConfirming(false)}
        onCancel={onClose}
        onSubmit={() => onStart(params, plan)}
      />
    )
  }

  return (
    <ModalPanel
      size="sm"
      className={CONFIRM_PANEL}
      title="Change workflow"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!params.workflow} onClick={() => setConfirming(true)}>
            Continue
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Subtitle>
          {single ? 'Choose the workflow to apply to this request.' : `Choose the workflow to apply to ${selected.length.toLocaleString()} selected requests.`}
        </Subtitle>
        <Select value={params.workflow ?? undefined} onValueChange={(v) => setParams((p) => ({ ...p, workflow: v }))}>
          <SelectTrigger aria-label="Workflow">
            <SelectValue placeholder="Select workflow" />
          </SelectTrigger>
          <SelectContent>
            {WORKFLOWS.map((wf) => {
              const allIn = selected.length > 0 && selected.every((r) => r.workflow === wf)
              return (
                <SelectItem
                  key={wf}
                  value={wf}
                  disabled={allIn}
                  description={allIn ? (single ? 'The request is already in this workflow' : 'All selected requests are already in this workflow') : undefined}
                >
                  {wf}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <Switch
          label="Delete subtasks currently open on request"
          description="Open subtasks are removed when the workflow changes."
          checked={Boolean(params.deleteOpenSubtasks)}
          onCheckedChange={(checked) => setParams((p) => ({ ...p, deleteOpenSubtasks: checked }))}
        />
      </div>
    </ModalPanel>
  )
}
