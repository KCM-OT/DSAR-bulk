'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Grounded against ".time-items" / ".time-item-base" in the Vitreus UI Kit:
 * 49x36 items in scrollable hour, minute and AM/PM columns. The selected
 * item fills brand green with white text. `24h` drops the period column.
 */

export type TimeValue = { hours: number; minutes: number }
export type TimeFormat = '12h' | '24h'

const MINUTE_STEP = 5

function TimeColumn({
  label,
  items,
  isSelected,
  onSelect,
}: {
  label: string
  items: { key: string; text: string; value: number }[]
  isSelected: (value: number) => boolean
  onSelect: (value: number) => void
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedKey = items.find((item) => isSelected(item.value))?.key
  React.useEffect(() => {
    const container = containerRef.current
    const selected = container?.querySelector<HTMLElement>('[aria-checked="true"]')
    if (!container || !selected) return
    container.scrollTop = selected.offsetTop - container.clientHeight / 2 + selected.clientHeight / 2
  }, [selectedKey])

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={label}
      className="relative flex max-h-56 flex-col gap-0.5 overflow-y-auto overscroll-contain"
    >
      {items.map((item) => {
        const selected = isSelected(item.value)
        return (
          <button
            key={item.key}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(item.value)}
            className={cn(
              'flex h-9 w-12 shrink-0 items-center justify-center rounded text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
              selected ? 'bg-vt-primary-2 text-vt-light-text' : 'text-vt-dark-text hover:bg-vt-success-light',
            )}
          >
            {item.text}
          </button>
        )
      })}
    </div>
  )
}

function TimePicker({
  value,
  onChange,
  format = '12h',
  className,
}: {
  value: TimeValue
  onChange: (value: TimeValue) => void
  format?: TimeFormat
  className?: string
}) {
  const is12h = format === '12h'
  const isPm = value.hours >= 12
  const hour12 = value.hours % 12 === 0 ? 12 : value.hours % 12

  const hourItems = is12h
    ? Array.from({ length: 12 }, (_, i) => ({ key: String(i + 1), text: String(i + 1), value: i + 1 }))
    : Array.from({ length: 24 }, (_, i) => ({ key: String(i), text: String(i).padStart(2, '0'), value: i }))

  const minuteItems = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => {
    const minutes = i * MINUTE_STEP
    return { key: String(minutes), text: String(minutes).padStart(2, '0'), value: minutes }
  })

  const setHour = (picked: number) => {
    if (!is12h) return onChange({ ...value, hours: picked })
    onChange({ ...value, hours: (picked % 12) + (isPm ? 12 : 0) })
  }

  const setPeriod = (pm: boolean) => {
    onChange({ ...value, hours: (value.hours % 12) + (pm ? 12 : 0) })
  }

  return (
    <div data-slot="time-picker" className={cn('flex gap-2 font-sans', className)}>
      <TimeColumn
        label="Hours"
        items={hourItems}
        isSelected={(item) => item === (is12h ? hour12 : value.hours)}
        onSelect={setHour}
      />
      <TimeColumn
        label="Minutes"
        items={minuteItems}
        isSelected={(item) => item === value.minutes}
        onSelect={(minutes) => onChange({ ...value, minutes })}
      />
      {is12h ? (
        <TimeColumn
          label="AM or PM"
          items={[
            { key: 'am', text: 'AM', value: 0 },
            { key: 'pm', text: 'PM', value: 1 },
          ]}
          isSelected={(item) => (item === 1) === isPm}
          onSelect={(item) => setPeriod(item === 1)}
        />
      ) : null}
    </div>
  )
}

export function formatTime({ hours, minutes }: TimeValue, format: TimeFormat) {
  const mm = String(minutes).padStart(2, '0')
  if (format === '24h') return `${String(hours).padStart(2, '0')}:${mm}`
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${mm} ${hours >= 12 ? 'PM' : 'AM'}`
}

export { TimePicker }
