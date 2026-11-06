'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Upload", "❖ File attachment" and "❖ Upload progress"
 * in the Vitreus UI Kit Form File Upload page. Single-file uploads show a
 * label, a secondary Upload button and helper text; multiple-file uploads
 * show a dashed dropzone (hover tints it #f8f8f8, an active drag turns the
 * border solid). Attachments are #f8f8f8 rows (small = name only, large =
 * name + size + date); progress uses the #1470a9 information blue; errors
 * use a pale red banner with a filled exclamation icon.
 */

function FileGlyph(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden {...props}>
      <path d="M3.5 1.5h5l4 4v9h-9z" strokeLinejoin="round" />
      <path d="M8.5 1.5v4h4" strokeLinejoin="round" />
    </svg>
  )
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" aria-hidden className={cn('animate-spin text-vt-primary-1', className)}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeDasharray="38 14" />
    </svg>
  )
}

function RemoveButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-6 shrink-0 items-center justify-center rounded text-vt-dark-text outline-none hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
    >
      <Icon name="xmark" size={16} />
    </button>
  )
}

type FileAttachmentProps = {
  name: string
  size?: 'small' | 'large'
  fileSize?: string
  date?: string
  onRemove?: () => void
  className?: string
}

function FileAttachment({ name, size = 'large', fileSize, date, onRemove, className }: FileAttachmentProps) {
  return (
    <div
      data-slot="file-attachment"
      className={cn(
        'flex w-full items-start gap-3 rounded bg-vt-background px-3 font-sans text-vt-dark-text',
        size === 'small' ? 'h-7 items-center' : 'py-2',
        className,
      )}
    >
      <FileGlyph className="mt-0.5 shrink-0 self-start" style={size === 'small' ? { marginTop: 0, alignSelf: 'center' } : undefined} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-base leading-6 font-light">{name}</span>
        {size === 'large' && (fileSize || date) ? (
          <div className="flex gap-12 text-sm leading-5 font-light text-vt-grey-text">
            {fileSize ? <span>Size: {fileSize}</span> : null}
            {date ? <span>Date: {date}</span> : null}
          </div>
        ) : null}
      </div>
      <RemoveButton label={`Remove ${name}`} onClick={onRemove} />
    </div>
  )
}

function UploadProgress({
  name,
  progress,
  onCancel,
  className,
}: {
  name: string
  progress: number
  onCancel?: () => void
  className?: string
}) {
  const value = Math.max(0, Math.min(100, Math.round(progress)))
  return (
    <div
      data-slot="upload-progress"
      className={cn('flex w-full flex-col gap-1 rounded bg-vt-background px-3 py-2 font-sans text-vt-dark-text', className)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-base leading-6 font-light">{name}</span>
        <RemoveButton label={`Cancel upload of ${name}`} onClick={onCancel} />
      </div>
      <div
        role="progressbar"
        aria-label={`Uploading ${name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="h-2 w-full overflow-hidden rounded-full border border-vt-link-text bg-vt-surface"
      >
        <div className="h-full rounded-full bg-vt-link-text transition-[width]" style={{ width: `${value}%` }} />
      </div>
      <div className="flex justify-between text-sm leading-5 font-light">
        <span>Uploading...</span>
        <span>{value}%</span>
      </div>
    </div>
  )
}

function UploadError({ message, onDismiss, className }: { message: string; onDismiss?: () => void; className?: string }) {
  return (
    <div
      role="alert"
      data-slot="upload-error"
      className={cn(
        'flex w-full items-center gap-3 rounded border border-[#f2d2d2] bg-[#fdf9f9] px-3 py-2 font-sans text-base leading-6 font-light text-vt-dark-text',
        className,
      )}
    >
      <Icon name="circle-exclamation" variant="filled" size={16} className="text-vt-error" />
      <span className="min-w-0 flex-1">{message}</span>
      <RemoveButton label="Dismiss error" onClick={onDismiss} />
    </div>
  )
}

type UploadVisualState = 'default' | 'hover' | 'drag'

type FileUploadProps = {
  multiple?: boolean
  label?: string
  required?: boolean
  helperText?: string
  accept?: string
  disabled?: boolean
  uploading?: boolean
  errorMessage?: string
  visualState?: UploadVisualState
  onFilesSelected?: (files: File[]) => void
  onDismissError?: () => void
  className?: string
  children?: React.ReactNode
}

function FileUpload({
  multiple,
  label,
  required,
  helperText = 'Helper text / upload constraints',
  accept,
  disabled,
  uploading,
  errorMessage,
  visualState = 'default',
  onFilesSelected,
  onDismissError,
  className,
  children,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const inputId = React.useId()
  const [dragging, setDragging] = React.useState(false)
  const isDrag = dragging || visualState === 'drag'

  const emit = (list: FileList | null) => {
    const files = Array.from(list ?? [])
    if (files.length) onFilesSelected?.(multiple ? files : files.slice(0, 1))
  }

  const openPicker = () => inputRef.current?.click()

  const uploadButton = (
    <Button variant="secondary" onClick={openPicker} disabled={disabled} className="min-w-32 font-light">
      Upload
    </Button>
  )

  const input = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      multiple={multiple}
      accept={accept}
      disabled={disabled}
      className="sr-only"
      tabIndex={-1}
      onChange={(event) => {
        emit(event.target.files)
        event.target.value = ''
      }}
    />
  )

  if (multiple) {
    return (
      <div data-slot="file-upload" className={cn('flex w-full flex-col gap-3 font-sans', className)}>
        {label ? <Label htmlFor={inputId} required={required}>{label}</Label> : null}
        <div
          onDragOver={(event) => {
            event.preventDefault()
            if (!disabled) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            if (!disabled) emit(event.dataTransfer.files)
          }}
          className={cn(
            'group/dropzone flex flex-col items-center gap-3 rounded border bg-vt-surface px-6 py-8 text-center transition-colors',
            isDrag
              ? 'border-solid border-[#a9a9a9] bg-vt-background'
              : 'border-dashed border-vt-border hover:border-[#a9a9a9] hover:bg-vt-background',
            !isDrag && visualState === 'hover' && 'border-[#a9a9a9] bg-vt-background',
            disabled && 'pointer-events-none opacity-60',
          )}
        >
          <div className="flex flex-col gap-1">
            <p className="text-lg leading-6 font-light text-vt-dark-text">Drag and drop files to upload</p>
            <p className="text-sm leading-5 font-light text-vt-grey-text">{helperText}</p>
          </div>
          {input}
          {uploadButton}
        </div>
        {errorMessage ? <UploadError message={errorMessage} onDismiss={onDismissError} /> : null}
        {children ? <div className="flex flex-col gap-2">{children}</div> : null}
      </div>
    )
  }

  return (
    <div data-slot="file-upload" className={cn('flex w-full max-w-md flex-col items-start gap-1 font-sans', className)}>
      {label ? <Label htmlFor={inputId} required={required}>{label}</Label> : null}
      {children ?? (
        <>
          {input}
          {uploading ? (
            <div
              role="status"
              aria-label="Upload in progress"
              className="flex h-9 min-w-32 items-center justify-center rounded border border-vt-primary-2 bg-vt-success-light"
            >
              <Spinner />
            </div>
          ) : (
            <span className={cn(visualState === 'hover' && '[&_button]:bg-vt-success-light')}>{uploadButton}</span>
          )}
          <p className="text-sm leading-5 font-light text-vt-grey-text">{helperText}</p>
        </>
      )}
      {errorMessage ? <UploadError message={errorMessage} onDismiss={onDismissError} className="mt-1" /> : null}
    </div>
  )
}

export { FileUpload, FileAttachment, UploadProgress, UploadError, Spinner, FileGlyph }
export type { FileUploadProps, FileAttachmentProps }
