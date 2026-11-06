'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ModalPanel } from '@/components/ui/modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RichTextEditor } from '@/components/rich-text-editor'
import { computePlan, type ActionParams } from '@/lib/actions'
import { REJECT_RESOLUTIONS } from '@/lib/mock-data'
import type { DsarRequest } from '@/lib/types'

/**
 * Bulk reject modal, matching the DSAR Figma file ("Modal", node 4481:53784): a 768px modal with
 * a Resolution select, a "Select response(s)" field aligned right, a Comments rich text editor
 * with Templates, a "Mark as internal comments" checkbox (on by default), and Cancel / Reject.
 * Reject stays disabled until a resolution is chosen.
 */
export function RejectModal({
  selected,
  onClose,
  onConfirm,
}: {
  selected: DsarRequest[]
  onClose: () => void
  onConfirm: (params: ActionParams, ids: string[], skipped: number) => void
}) {
  const [resolutionId, setResolutionId] = React.useState<string | undefined>()
  const [responseId, setResponseId] = React.useState<string | undefined>()
  const [text, setText] = React.useState('')
  const [attachments, setAttachments] = React.useState<string[]>([])
  const [internal, setInternal] = React.useState(true)

  const resolution = REJECT_RESOLUTIONS.find((r) => r.id === resolutionId)
  const plan = React.useMemo(() => computePlan('reject', {}, selected), [selected])

  const submit = () => {
    if (!resolution) return
    onConfirm(
      {
        reason: resolution.label,
        commentText: text,
        commentKind: internal ? 'internal' : 'public',
        attachments,
      },
      plan.processIds,
      plan.skippedCount,
    )
  }

  return (
    <ModalPanel
      size="md"
      title="Reject request(s)"
      onClose={onClose}
    >
      <div className="-mt-2 flex flex-col gap-4">
        <p className="text-base leading-6 font-light">This action will reject the selected request(s)</p>

        <div className="flex flex-col gap-1">
          <Label className="font-sans text-sm font-light">Resolution</Label>
          <Select
            value={resolutionId}
            onValueChange={(id) => {
              setResolutionId(id)
              setResponseId(undefined)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a resolution" />
            </SelectTrigger>
            <SelectContent>
              {REJECT_RESOLUTIONS.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <div className="flex w-[290px] flex-col gap-1">
            <Label className="font-sans text-sm font-light">Select response(s)</Label>
            <Select
              value={responseId ?? ''}
              onValueChange={(id) => {
                setResponseId(id)
                const body = resolution?.responses.find((r) => r.id === id)?.body
                if (body) setText(body)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                {(!resolution || resolution.responses.length === 0) && (
                  <SelectItem value="__none" disabled>
                    {resolution ? 'No saved responses for this resolution' : 'Select a resolution first'}
                  </SelectItem>
                )}
                {resolution?.responses.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="font-heading text-sm font-medium">Comments</Label>
          <RichTextEditor
            value={text}
            onChange={setText}
            placeholder="Enter reason for rejecting request here."
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            minHeight="min-h-40"
          />
        </div>

        {plan.skippedCount > 0 && (
          <p className="-mt-2 text-xs font-light text-vt-grey-text">
            {plan.processIds.length.toLocaleString()} of {selected.length.toLocaleString()} selected can be rejected.{' '}
            {plan.skippedCount.toLocaleString()} already complete, rejected, closed or expired will be skipped.
          </p>
        )}

        {/* Checkbox and buttons share the last row, as in the design. */}
        <div className="flex items-end justify-between gap-4">
          <div className="flex min-h-9 items-center">
            <Checkbox label="Mark as internal comments" checked={internal} onCheckedChange={(v) => setInternal(v === true)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={!resolution || plan.processIds.length === 0} onClick={submit}>
              Reject
            </Button>
          </div>
        </div>
      </div>
    </ModalPanel>
  )
}
