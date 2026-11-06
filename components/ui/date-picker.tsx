'use client'

import * as React from 'react'
import { Popover } from '@base-ui/react/popover'

import { Button } from '@/components/ui/button'
import { Calendar, isSameDay, startOfDay, type DateRange } from '@/components/ui/calendar'
import { Icon } from '@/components/ui/icon'
import { formatTime, TimePicker, type TimeFormat } from '@/components/ui/time-picker'
import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Date+Time Picker" in the Vitreus UI Kit: a white panel
 * with a #c9ddee border, radius 4 and a soft drop shadow. The body holds the
 * calendar and/or time columns (separated by a divider when combined) and a
 * footer row with Today / Clear / Done. Range pickers swap Today and Done for
 * a "Year start" shortcut and Clear. Time-only pickers show Clear alone.
 */

type PanelBaseProps = {
  className?: string
  timeFormat?: TimeFormat
  today?: Date
  onClear?: () => void
  onDone?: () => void
}

type DateTimePickerProps = PanelBaseProps &
  (
    | { mode: 'single'; value?: Date | null; onChange?: (value: Date | null) => void }
    | { mode: 'range'; value?: DateRange; onChange?: (value: DateRange) => void }
    | { mode: 'time'; value?: Date | null; onChange?: (value: Date | null) => void }
  )

function withTime(date: Date, source?: Date | null) {
  const next = new Date(date)
  next.setHours(source?.getHours() ?? 0, source?.getMinutes() ?? 0, 0, 0)
  return next
}

function DateTimePicker(props: DateTimePickerProps) {
  const { className, timeFormat, onClear, onDone } = props
  const today = React.useMemo(() => startOfDay(props.today ?? new Date()), [props.today])
  const hasCalendar = props.mode !== 'time'
  const hasTime = props.mode === 'time' || (props.mode === 'single' && !!timeFormat)
  const format = timeFormat ?? '12h'

  const [month, setMonth] = React.useState(() => {
    const anchor = (props.mode === 'range' ? props.value?.from : props.value) ?? today
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  })

  const singleValue = props.mode === 'range' ? null : (props.value ?? null)

  const handleClear = () => {
    if (props.mode === 'range') props.onChange?.({})
    else props.onChange?.(null)
    onClear?.()
  }

  const handleToday = () => {
    if (props.mode === 'single') {
      props.onChange?.(withTime(today, singleValue))
      setMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    }
  }

  const handleYearStart = () => {
    if (props.mode !== 'range') return
    props.onChange?.({ from: new Date(today.getFullYear(), 0, 1), to: today })
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  const timeValue = {
    hours: singleValue?.getHours() ?? 0,
    minutes: singleValue?.getMinutes() ?? 0,
  }

  return (
    <div
      data-slot="date-time-picker"
      className={cn(
        'inline-flex flex-col rounded border border-vt-secondary-2 bg-vt-surface font-sans shadow-[0_7px_14px_rgba(50,50,93,0.1)]',
        className,
      )}
    >
      <div className="flex gap-4 p-4">
        {hasCalendar ? (
          props.mode === 'range' ? (
            <Calendar
              mode="range"
              month={month}
              onMonthChange={setMonth}
              today={today}
              selected={props.value}
              onSelect={props.onChange}
            />
          ) : (
            <Calendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              today={today}
              selected={singleValue}
              onSelect={(date) => props.onChange?.(withTime(date, singleValue))}
            />
          )
        ) : null}
        {hasCalendar && hasTime ? <div role="separator" aria-orientation="vertical" className="w-px self-stretch bg-vt-secondary-2" /> : null}
        {hasTime ? (
          <TimePicker
            value={timeValue}
            format={format}
            onChange={({ hours, minutes }) => {
              const base = singleValue ?? today
              const next = new Date(base)
              next.setHours(hours, minutes, 0, 0)
              props.onChange?.(next as Date & DateRange)
            }}
          />
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-vt-secondary-2 px-4 py-2">
        {props.mode === 'single' ? (
          <Button variant="ghost" onClick={handleToday} className="font-light">
            Today
          </Button>
        ) : null}
        {props.mode === 'range' ? (
          <Button
            variant="outline"
            onClick={handleYearStart}
            className="border-vt-border font-light text-vt-dark-text"
          >
            Year start
          </Button>
        ) : null}
        <div className={cn('flex gap-2', props.mode === 'time' && 'w-full')}>
          {props.mode === 'single' || props.mode === 'time' ? (
            <>
              <Button variant={props.mode === 'time' ? 'secondary' : 'ghost'} onClick={handleClear} className="font-light">
                Clear
              </Button>
              {props.mode === 'single' ? (
                <Button onClick={onDone} className="font-light">
                  Done
                </Button>
              ) : null}
            </>
          ) : (
            <Button variant="secondary" onClick={handleClear} className="font-light">
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function CalendarGlyph(props: React.ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden {...props}>
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M2 6.5h12M5 1.5v3M11 1.5v3" strokeLinecap="round" />
    </svg>
  )
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatDate(date: Date) {
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`
}

type DatePickerProps = {
  id?: string
  className?: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
  'aria-label'?: string
  timeFormat?: TimeFormat
} & (
  | { mode?: 'single'; value?: Date | null; onValueChange?: (value: Date | null) => void }
  | { mode: 'range'; value?: DateRange; onValueChange?: (value: DateRange) => void }
)

function DatePicker(props: DatePickerProps) {
  const { id, className, disabled, error, timeFormat } = props
  const [open, setOpen] = React.useState(false)

  let text = ''
  let picker: React.ReactNode
  if (props.mode === 'range') {
    const { from, to } = props.value ?? {}
    text = from ? `${formatDate(from)}${to ? ` \u2013 ${formatDate(to)}` : ''}` : ''
    picker = (
      <DateTimePicker
        mode="range"
        value={props.value}
        onChange={(range) => {
          props.onValueChange?.(range)
          if (range.from && range.to && !isSameDay(range.from, range.to)) setOpen(false)
        }}
      />
    )
  } else {
    const value = props.value
    text = value
      ? `${formatDate(value)}${timeFormat ? ` ${formatTime({ hours: value.getHours(), minutes: value.getMinutes() }, timeFormat)}` : ''}`
      : ''
    picker = (
      <DateTimePicker
        mode="single"
        timeFormat={timeFormat}
        value={value}
        onChange={props.onValueChange}
        onDone={() => setOpen(false)}
      />
    )
  }

  const placeholder = props.placeholder ?? (props.mode === 'range' ? 'MM/DD/YYYY \u2013 MM/DD/YYYY' : 'MM/DD/YYYY')

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={id}
        disabled={disabled}
        aria-label={props['aria-label']}
        aria-invalid={error || undefined}
        data-slot="date-picker-trigger"
        className={cn(
          'flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded border bg-vt-surface px-2 py-1 text-left font-sans text-base leading-6 font-light outline-none transition-colors',
          'border-vt-control-border hover:border-vt-primary-2',
          'focus-visible:border-vt-focus-ring focus-visible:ring-1 focus-visible:ring-vt-focus-ring data-[popup-open]:border-vt-focus-ring',
          'disabled:cursor-not-allowed disabled:bg-vt-control-disabled-bg disabled:text-vt-grey-text disabled:hover:border-vt-control-border',
          text ? 'text-vt-dark-text' : 'text-vt-control-border',
          error && 'border-vt-error hover:border-vt-error',
          className,
        )}
      >
        <span className="truncate">{text || placeholder}</span>
        <CalendarGlyph className="shrink-0 text-vt-dark-text" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} align="start" className="z-50">
          <Popover.Popup className="outline-none">{picker}</Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

export { DatePicker, DateTimePicker, CalendarGlyph }
export type { DatePickerProps, DateTimePickerProps }
