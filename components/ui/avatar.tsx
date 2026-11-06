import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Grounded against the table cell avatar variants: a 24px circle carrying two
 * initials in white on one of the Vitreus graphic colors. Groups overlap and
 * collapse into a "+N" overflow bubble.
 */
const tones = {
  1: 'bg-vt-graphic-1',
  2: 'bg-vt-graphic-2',
  3: 'bg-vt-graphic-3',
  4: 'bg-vt-graphic-4',
  5: 'bg-vt-graphic-5',
  6: 'bg-vt-graphic-6',
  7: 'bg-vt-graphic-7',
  8: 'bg-vt-graphic-8',
} as const

type AvatarTone = keyof typeof tones

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '')).toUpperCase()
}

function Avatar({
  name,
  tone = 1,
  size = 24,
  className,
}: {
  name: string
  tone?: AvatarTone
  size?: number
  className?: string
}) {
  return (
    <span
      data-slot="avatar"
      role="img"
      aria-label={name}
      style={{ width: size, height: size }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-heading text-[10px] leading-none font-medium text-vt-light-text',
        tones[tone],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  )
}

function AvatarGroup({
  people,
  max = 2,
  size = 24,
}: {
  people: { name: string; tone?: AvatarTone }[]
  max?: number
  size?: number
}) {
  const visible = people.slice(0, max)
  const overflow = people.length - visible.length
  return (
    <div data-slot="avatar-group" className="flex items-center">
      {visible.map((person, index) => (
        <Avatar
          key={person.name}
          name={person.name}
          tone={person.tone ?? ((index + 1) as AvatarTone)}
          size={size}
          className="-ml-1.5 border-2 border-vt-surface first:ml-0"
        />
      ))}
      {overflow > 0 ? (
        <span
          style={{ width: size, height: size }}
          className="-ml-1.5 inline-flex items-center justify-center rounded-full border-2 border-vt-surface bg-vt-graphic-8 font-heading text-[10px] leading-none font-medium text-vt-light-text"
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  )
}

export { Avatar, AvatarGroup }
export type { AvatarTone }
