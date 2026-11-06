import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ List" and "❖ List item": a title and caption above rows
 * separated by 1px #cccccc dividers. Rows hover to #e8f1f6. Compact and dense
 * lists are flush; sparse lists sit inside a bordered box with inset rows.
 */
type ListDensity = 'compact' | 'dense' | 'sparse'

const ListDensityContext = React.createContext<ListDensity>('compact')

const rowPadding: Record<ListDensity, string> = {
  compact: 'py-2 px-3',
  dense: 'py-4 px-3',
  sparse: 'py-4 px-4',
}

interface ListProps {
  title?: string
  caption?: string
  density?: ListDensity
  children: React.ReactNode
  className?: string
}

function List({ title, caption, density = 'compact', children, className }: ListProps) {
  return (
    <ListDensityContext.Provider value={density}>
      <section data-slot="list" className={cn('flex flex-col gap-4 font-sans text-vt-dark-text', className)}>
        {(title || caption) && (
          <header className="flex flex-col gap-1">
            {title && <h3 className="font-heading text-xl leading-7 font-medium">{title}</h3>}
            {caption && <p className="text-sm leading-5 font-light">{caption}</p>}
          </header>
        )}
        <ul className={cn('flex flex-col', density === 'sparse' ? 'border border-vt-border' : '-mx-3')}>
          {children}
        </ul>
      </section>
    </ListDensityContext.Provider>
  )
}

interface ListItemProps {
  title: string
  description?: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  onClick?: () => void
  forceHover?: boolean
  className?: string
}

function ListItem({ title, description, leading, trailing, onClick, forceHover, className }: ListItemProps) {
  const density = React.useContext(ListDensityContext)
  const content = (
    <>
      {leading && <span className="flex shrink-0 items-center text-vt-dark-text">{leading}</span>}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-heading text-base leading-6 font-medium">{title}</span>
        {description && <span className="text-base leading-6 font-light">{description}</span>}
      </span>
      {trailing && <span className="flex shrink-0 items-center gap-4">{trailing}</span>}
    </>
  )
  const rowClasses = cn(
    'flex w-full items-center gap-4 text-left transition-colors hover:bg-vt-information-light',
    rowPadding[density],
    forceHover && 'bg-vt-information-light',
  )

  return (
    <li data-slot="list-item" className={cn('border-b border-vt-border last:border-b-0', className)}>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(rowClasses, 'outline-none focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-inset')}
        >
          {content}
        </button>
      ) : (
        <div className={rowClasses}>{content}</div>
      )}
    </li>
  )
}

export { List, ListItem }
export type { ListDensity }
