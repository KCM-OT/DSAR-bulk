'use client'

import * as React from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Calendars" in the Vitreus UI Kit Date Picker page:
 * a 224px body with a 36px month header (circular prev/next buttons with a
 * #d9d9d9 border and a "Month YYYY" label), a 32px weekday row and six
 * 32px date rows. Selected days and range ends fill brand green, range
 * middles use green text, and days outside the month are muted. The month
 * label drills into a 3x4 month picker, which drills into a 12-year picker.
 */

export type DateRange = { from?: Date; to?: Date }

type CalendarView = 'days' | 'months' | 'years'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const YEAR_PAGE_SIZE = 12
const YEAR_ANCHOR = 2018

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function isSameDay(a?: Date | null, b?: Date | null) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function yearPageStart(year: number) {
  return YEAR_ANCHOR + YEAR_PAGE_SIZE * Math.floor((year - YEAR_ANCHOR) / YEAR_PAGE_SIZE)
}

function nextRange(current: DateRange | undefined, picked: Date): DateRange {
  if (!current?.from || current.to) return { from: picked }
  if (picked < current.from) return { from: picked, to: current.from }
  return { from: current.from, to: picked }
}

type CalendarBaseProps = {
  className?: string
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  today?: Date
  minDate?: Date
  maxDate?: Date
}

type CalendarProps = CalendarBaseProps &
  (
    | { mode: 'single'; selected?: Date | null; onSelect?: (date: Date) => void }
    | { mode: 'range'; selected?: DateRange; onSelect?: (range: DateRange) => void }
  )

function NavButton({
  direction,
  label,
  onClick,
}: {
  direction: 'left' | 'right'
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#d9d9d9] bg-vt-surface text-vt-dark-text outline-none transition-colors hover:bg-vt-success-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
    >
      <Icon name={direction === 'left' ? 'chevron-left' : 'chevron-right'} size={16} />
    </button>
  )
}

function Calendar(props: CalendarProps) {
  const { className, today: todayProp, minDate, maxDate } = props
  const today = React.useMemo(() => startOfDay(todayProp ?? new Date()), [todayProp])

  const initialMonth = React.useMemo(() => {
    const anchor =
      props.defaultMonth ??
      (props.mode === 'single' ? props.selected : props.selected?.from) ??
      today
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  }, [props.defaultMonth, props.mode, props.selected, today])

  const [internalMonth, setInternalMonth] = React.useState(initialMonth)
  const month = props.month ? new Date(props.month.getFullYear(), props.month.getMonth(), 1) : internalMonth
  const [view, setView] = React.useState<CalendarView>('days')

  const setMonth = (next: Date) => {
    const normalized = new Date(next.getFullYear(), next.getMonth(), 1)
    if (!props.month) setInternalMonth(normalized)
    props.onMonthChange?.(normalized)
  }

  const year = month.getFullYear()
  const pageStart = yearPageStart(year)

  const header = {
    days: {
      label: `${MONTH_NAMES[month.getMonth()]} ${year}`,
      prev: () => setMonth(new Date(year, month.getMonth() - 1, 1)),
      next: () => setMonth(new Date(year, month.getMonth() + 1, 1)),
      prevLabel: 'Previous month',
      nextLabel: 'Next month',
      toggle: () => setView('months'),
      toggleLabel: 'Choose month',
    },
    months: {
      label: String(year),
      prev: () => setMonth(new Date(year - 1, month.getMonth(), 1)),
      next: () => setMonth(new Date(year + 1, month.getMonth(), 1)),
      prevLabel: 'Previous year',
      nextLabel: 'Next year',
      toggle: () => setView('years'),
      toggleLabel: 'Choose year',
    },
    years: {
      label: `${pageStart} \u2013 ${pageStart + YEAR_PAGE_SIZE - 1}`,
      prev: () => setMonth(new Date(year - YEAR_PAGE_SIZE, month.getMonth(), 1)),
      next: () => setMonth(new Date(year + YEAR_PAGE_SIZE, month.getMonth(), 1)),
      prevLabel: 'Previous years',
      nextLabel: 'Next years',
      toggle: () => setView('days'),
      toggleLabel: 'Back to days',
    },
  }[view]

  const daysInMonth = new Date(year, month.getMonth() + 1, 0).getDate()
  const leadingBlanks = month.getDay()

  const isDisabled = (date: Date) => (!!minDate && date < startOfDay(minDate)) || (!!maxDate && date > startOfDay(maxDate))

  const pickDay = (date: Date) => {
    if (props.mode === 'single') props.onSelect?.(date)
    else props.onSelect?.(nextRange(props.selected, date))
  }

  const dayState = (date: Date) => {
    if (props.mode === 'single') return isSameDay(props.selected, date) ? 'selected' : 'default'
    const { from, to } = props.selected ?? {}
    if (from && to && !isSameDay(from, to)) {
      if (isSameDay(date, from)) return 'range-start'
      if (isSameDay(date, to)) return 'range-end'
      if (date > from && date < to) return 'range-middle'
      return 'default'
    }
    return isSameDay(from, date) ? 'selected' : 'default'
  }

  return (
    <div data-slot="calendar" className={cn('flex w-56 flex-col gap-2 font-sans', className)}>
      <div className="flex items-center">
        <NavButton direction="left" label={header.prevLabel} onClick={header.prev} />
        <button
          type="button"
          aria-label={header.toggleLabel}
          onClick={header.toggle}
          className="flex min-w-0 flex-1 items-center justify-center gap-1 rounded px-3 py-1 text-[13px] leading-4 font-medium tracking-[-0.01em] text-vt-dark-text outline-none hover:bg-vt-success-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
        >
          <span aria-live="polite" className="truncate">
            {header.label}
          </span>
          <Icon name="chevron-down" size={12} />
        </button>
        <NavButton direction="right" label={header.nextLabel} onClick={header.next} />
      </div>

      {view === 'days' ? (
        <div role="grid" aria-label={header.label} className="flex flex-col">
          <div role="row" className="grid grid-cols-7">
            {WEEKDAYS.map((day, index) => (
              <span
                key={WEEKDAY_NAMES[index]}
                role="columnheader"
                aria-label={WEEKDAY_NAMES[index]}
                className="flex size-8 items-center justify-center text-[13px] font-medium text-vt-dark-text"
              >
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 42 }, (_, index) => {
              const dayNumber = index - leadingBlanks + 1
              if (dayNumber < 1) return <span key={index} className="size-8" aria-hidden />
              if (dayNumber > daysInMonth) {
                return (
                  <span
                    key={index}
                    aria-hidden
                    className="flex size-8 items-center justify-center text-[13px] font-medium text-vt-empty"
                  >
                    {dayNumber - daysInMonth}
                  </span>
                )
              }
              const date = new Date(year, month.getMonth(), dayNumber)
              const state = dayState(date)
              const isToday = isSameDay(date, today)
              const filled = state === 'selected' || state === 'range-start' || state === 'range-end'
              return (
                <button
                  key={index}
                  type="button"
                  role="gridcell"
                  disabled={isDisabled(date)}
                  aria-selected={state !== 'default'}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={`${WEEKDAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${dayNumber}, ${year}`}
                  onClick={() => pickDay(date)}
                  className={cn(
                    'flex size-8 items-center justify-center text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-vt-focus-ring disabled:cursor-not-allowed disabled:text-vt-empty',
                    state === 'default' && 'rounded text-vt-dark-text hover:bg-vt-success-light',
                    state === 'range-middle' && 'text-vt-primary-2 hover:bg-vt-success-light',
                    filled && 'bg-vt-primary-2 text-vt-light-text hover:bg-vt-primary-1',
                    state === 'selected' && 'rounded',
                    state === 'range-start' && 'rounded-l',
                    state === 'range-end' && 'rounded-r',
                    isToday && !filled && 'bg-vt-success-light',
                  )}
                >
                  {dayNumber}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {view === 'months' ? (
        <div className="grid h-56 grid-cols-3 content-stretch">
          {MONTH_NAMES.map((name, index) => {
            const selected = index === month.getMonth()
            return (
              <button
                key={name}
                type="button"
                aria-pressed={selected}
                aria-label={`${name} ${year}`}
                onClick={() => {
                  setMonth(new Date(year, index, 1))
                  setView('days')
                }}
                className={cn(
                  'flex items-center justify-center rounded-lg text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
                  selected ? 'bg-vt-primary-2 text-vt-light-text' : 'text-vt-dark-text hover:bg-vt-success-light',
                )}
              >
                {name.slice(0, 3)}
              </button>
            )
          })}
        </div>
      ) : null}

      {view === 'years' ? (
        <div className="grid h-56 grid-cols-3 content-stretch">
          {Array.from({ length: YEAR_PAGE_SIZE }, (_, index) => {
            const value = pageStart + index
            const selected = value === year
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setMonth(new Date(value, month.getMonth(), 1))
                  setView('months')
                }}
                className={cn(
                  'flex items-center justify-center rounded-lg text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
                  selected ? 'bg-vt-primary-2 text-vt-light-text' : 'text-vt-dark-text hover:bg-vt-success-light',
                )}
              >
                {value}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export { Calendar, MONTH_NAMES }
export type { CalendarProps }
