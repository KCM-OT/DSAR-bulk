'use client'

import * as React from 'react'
import { AlignCenter, AlignLeft, AlignRight, Bold, ImageIcon, Italic, Link2, List, Underline } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { RESPONSE_TEMPLATES } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

function ToolButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-7 place-items-center rounded text-vt-dark-text outline-none hover:bg-vt-information-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring [&_svg]:size-4"
    >
      {children}
    </button>
  )
}

const Divider = () => <span aria-hidden className="mx-1 h-4 w-px bg-vt-border" />

/**
 * Rich text editor as drawn in the DSAR Figma modals: a grey toolbar (bold, italic, underline |
 * alignment | list, image, link) with a Templates menu on the right, above a plain text area.
 * Formatting buttons are visual only in the prototype; image and link add an attachment chip.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  attachments,
  onAttachmentsChange,
  className,
  minHeight = 'min-h-40',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  attachments: string[]
  onAttachmentsChange: (next: string[]) => void
  className?: string
  minHeight?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded border border-vt-control-border focus-within:border-vt-focus-ring focus-within:ring-1 focus-within:ring-vt-focus-ring',
        className,
      )}
    >
      <div className="flex items-center gap-0.5 border-b border-vt-border bg-vt-table-header px-2 py-1">
        <ToolButton label="Bold">
          <Bold />
        </ToolButton>
        <ToolButton label="Italic">
          <Italic />
        </ToolButton>
        <ToolButton label="Underline">
          <Underline />
        </ToolButton>
        <Divider />
        <ToolButton label="Align left">
          <AlignLeft />
        </ToolButton>
        <ToolButton label="Align center">
          <AlignCenter />
        </ToolButton>
        <ToolButton label="Align right">
          <AlignRight />
        </ToolButton>
        <Divider />
        <ToolButton label="Bulleted list">
          <List />
        </ToolButton>
        <ToolButton label="Insert image" onClick={() => onAttachmentsChange([...attachments, `image-${attachments.length + 1}.png`])}>
          <ImageIcon />
        </ToolButton>
        <ToolButton label="Attach link or file" onClick={() => onAttachmentsChange([...attachments, `attachment-${attachments.length + 1}.pdf`])}>
          <Link2 />
        </ToolButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-auto inline-flex h-7 items-center gap-1.5 rounded px-2 font-sans text-sm font-light text-vt-dark-text outline-none hover:bg-vt-information-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
            >
              Templates
              <Icon name="chevron-down" size={14} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72">
            {RESPONSE_TEMPLATES.map((t) => (
              <DropdownMenuItem key={t.id} onSelect={() => onChange(t.body)} className="text-sm leading-5">
                {t.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full resize-y bg-vt-surface px-3 py-3 font-sans text-sm leading-5 font-light text-vt-dark-text outline-none placeholder:text-vt-grey-text placeholder:italic',
          minHeight,
        )}
      />
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-vt-border p-2">
          {attachments.map((a) => (
            <Badge key={a} closable onClose={() => onAttachmentsChange(attachments.filter((x) => x !== a))}>
              {a}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
