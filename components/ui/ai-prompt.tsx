'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/ui/icon'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

/**
 * Grounded against the "ai-main-prompt" cluster in the AI-driven ROPA
 * management file: heading, ai-assistant-composer, ai-assistant-suggestion
 * chips and the "Assigned to you" action cards. The composer is a 10px radius
 * container with a bordered textarea, an attach control and a dark send button.
 */

interface AIPromptComposerProps {
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  showAttach?: boolean
  tray?: React.ReactNode
  onValueChange?: (value: string) => void
  onSubmit?: (value: string) => void
  onAttach?: () => void
  className?: string
}

function AIPromptComposer({
  value,
  defaultValue = '',
  placeholder = 'I want to onboard a new agent that [does this] for [these people] and uses [this data].',
  disabled,
  showAttach = true,
  tray,
  onValueChange,
  onSubmit,
  onAttach,
  className,
}: AIPromptComposerProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const text = value ?? internal
  const canSend = text.trim().length > 0 && !disabled

  function update(next: string) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }

  function submit() {
    if (!canSend) return
    onSubmit?.(text.trim())
  }

  return (
    <form
      data-slot="ai-prompt-composer"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className={cn(
        'flex w-full flex-col gap-2 rounded-[10px] border border-vt-border bg-vt-surface p-3 font-sans',
        className,
      )}
    >
      {tray}
      <Textarea
        aria-label="Describe what you need to get done"
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        rows={2}
        onChange={(event) => update(event.target.value)}
        onKeyDown={(event) => {
          const composing = event.nativeEvent.isComposing || event.keyCode === 229
          if (event.key === 'Enter' && !event.shiftKey && !composing) {
            event.preventDefault()
            submit()
          }
        }}
        className="min-h-16 border-vt-border font-normal placeholder:text-vt-dark-text"
      />
      <div className="flex items-center justify-between">
        {showAttach ? (
          <button
            type="button"
            aria-label="Attach file"
            disabled={disabled}
            onClick={onAttach}
            className="grid size-8 place-items-center rounded text-vt-dark-text outline-none hover:bg-[#f2f2f2] focus-visible:ring-2 focus-visible:ring-vt-focus-ring disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="paperclip" size={24} />
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          aria-label="Send"
          disabled={!canSend}
          className="grid size-8 place-items-center rounded-[3px] bg-[#262629] text-white outline-none transition-colors hover:bg-[#2e2e2e] focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="paper-plane" variant="filled" size={24} />
        </button>
      </div>
    </form>
  )
}

interface AISuggestionChipProps extends React.ComponentProps<'button'> {
  forceState?: 'hover' | 'focus'
}

function AISuggestionChip({ forceState, className, children, ...props }: AISuggestionChipProps) {
  return (
    <button
      type="button"
      data-slot="ai-suggestion-chip"
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-vt-border bg-vt-surface px-3 py-2 font-sans text-[13px] leading-4 font-medium text-vt-dark-text transition-colors outline-none',
        'hover:bg-[#ededed] focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
        forceState === 'hover' && 'bg-[#ededed]',
        forceState === 'focus' && 'ring-2 ring-vt-focus-ring',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function AISuggestions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="group"
      aria-label="Suggested prompts"
      data-slot="ai-suggestions"
      className={cn('flex flex-wrap items-center justify-center gap-2', className)}
      {...props}
    />
  )
}

const eyebrowIcons = {
  project: 'folder-open',
  assessment: 'clipboard-list',
} as const satisfies Record<string, IconName>

const dueTones = {
  overdue: 'bg-[#fff2f2] text-[#db2626]',
  soon: 'bg-[#fffaeb] text-[#eb590d]',
} as const

interface AIAssignedCardProps {
  eyebrow: keyof typeof eyebrowIcons
  eyebrowLabel?: string
  title: string
  actionLabel: string
  onAction?: () => void
  status?: string
  statusHref?: string
  due?: { label: string; tone: keyof typeof dueTones }
  footer?: string
  className?: string
}

function AIAssignedCard({
  eyebrow,
  eyebrowLabel,
  title,
  actionLabel,
  onAction,
  status,
  statusHref,
  due,
  footer,
  className,
}: AIAssignedCardProps) {
  return (
    <article
      data-slot="ai-assigned-card"
      className={cn(
        'flex w-full flex-col gap-2 rounded-lg border border-vt-border bg-vt-surface p-4 font-sans',
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <span className="grid size-5 place-items-center text-[#646464]">
          <Icon name={eyebrowIcons[eyebrow]} size={24} />
        </span>
        <span className="font-heading text-xs leading-4 text-[#646464]">
          {eyebrowLabel ?? (eyebrow === 'project' ? 'Project' : 'Assessment')}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h3 className="font-heading text-base leading-[22px] font-normal text-vt-dark-text">{title}</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={onAction}
            className="border-vt-border text-[#303030] hover:border-vt-border hover:bg-[#f2f2f2] active:border-vt-border active:bg-[#f2f2f2]"
          >
            {actionLabel}
          </Button>
        </div>
        {(status || due) && (
          <div className="flex flex-wrap items-center gap-1">
            {status &&
              (statusHref ? (
                <a
                  href={statusHref}
                  className="rounded-sm text-sm leading-5 text-[#0a0b12] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
                >
                  {status}
                </a>
              ) : (
                <span className="text-sm leading-5 text-[#0a0b12]">{status}</span>
              ))}
            {due && (
              <span
                className={cn(
                  'inline-flex h-4 items-center rounded-full px-1.5 font-heading text-[10px] leading-3 font-medium whitespace-nowrap',
                  dueTones[due.tone],
                )}
              >
                {due.label}
              </span>
            )}
          </div>
        )}
        {footer && <span className="font-heading text-xs leading-4 text-[#646464]">{footer}</span>}
      </div>
    </article>
  )
}

interface AIPromptClusterProps {
  heading?: string
  placeholder?: string
  suggestions?: string[]
  assigned?: AIAssignedCardProps[]
  initialVisible?: number
  onSubmit?: (prompt: string) => void
  onAttach?: () => void
  className?: string
}

function AIPromptCluster({
  heading = 'What do you need to get done?',
  placeholder,
  suggestions = [],
  assigned = [],
  initialVisible = 2,
  onSubmit,
  onAttach,
  className,
}: AIPromptClusterProps) {
  const [prompt, setPrompt] = React.useState('')
  const [expanded, setExpanded] = React.useState(false)
  const visible = expanded ? assigned : assigned.slice(0, initialVisible)
  const canExpand = assigned.length > initialVisible

  return (
    <div
      data-slot="ai-prompt-cluster"
      className={cn('mx-auto flex w-full max-w-[750px] flex-col items-center gap-6', className)}
    >
      <h2 className="font-heading text-2xl leading-[1.2] font-medium text-balance text-[#303030]">{heading}</h2>
      <div className="flex w-full flex-col items-center gap-12">
        <div className="flex w-full flex-col items-center gap-4">
          <AIPromptComposer
            value={prompt}
            placeholder={placeholder}
            onValueChange={setPrompt}
            onAttach={onAttach}
            onSubmit={(text) => {
              onSubmit?.(text)
              setPrompt('')
            }}
          />
          {suggestions.length > 0 && (
            <AISuggestions>
              {suggestions.map((suggestion) => (
                <AISuggestionChip key={suggestion} onClick={() => setPrompt(suggestion)}>
                  {suggestion}
                </AISuggestionChip>
              ))}
            </AISuggestions>
          )}
        </div>
        {assigned.length > 0 && (
          <section aria-labelledby="ai-assigned-title" className="flex w-full max-w-[544px] flex-col items-center gap-4">
            <h3 id="ai-assigned-title" className="text-sm leading-5 text-[#677087]">
              {`Assigned to you (${assigned.length})`}
            </h3>
            <div className="flex w-full flex-col gap-4">
              {visible.map((card) => (
                <AIAssignedCard key={card.title} {...card} />
              ))}
            </div>
            {canExpand && !expanded && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExpanded(true)}
                className="border-vt-border text-[#303030] hover:border-vt-border hover:bg-[#f2f2f2] active:border-vt-border active:bg-[#f2f2f2]"
              >
                Show more
              </Button>
            )}
          </section>
        )}
      </div>
    </div>
  )
}

export { AIAssignedCard, AIPromptCluster, AIPromptComposer, AISuggestionChip, AISuggestions }
export type { AIAssignedCardProps, AIPromptClusterProps, AIPromptComposerProps }
