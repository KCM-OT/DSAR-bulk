'use client'

import * as React from 'react'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/**
 * Grounded against the Vitreus UI Kit "❖ Sidebar" frame.
 * Dark theme: bg #2c3643, selected row #14191f with a 4px #6cc04a bar, hover #585e68.
 * Light theme: white bg, selected row #f5f5f5 with a 4px #468254 bar.
 * Expanded width 224, collapsed 48. Header 48 tall, items 48 tall, 16px
 * horizontal padding, 8px icon/label gap, label 14/20 light. Child items drop
 * the icon and indent.
 */
export type SidebarItem = {
  id: string
  label: string
  icon?: React.ReactNode
  children?: SidebarItem[]
}

type ModuleSidebarProps = {
  moduleName: string
  items: SidebarItem[]
  activeId: string
  onNavigate?: (id: string) => void
  theme?: 'dark' | 'light'
  collapsed?: boolean
  searchable?: boolean
  className?: string
}

const themeStyles = {
  dark: {
    root: 'bg-[#2c3643] text-white',
    divider: 'border-white/15',
    hover: 'hover:bg-[#585e68]',
    selected: 'bg-[#14191f] before:bg-[#6cc04a]',
    search: 'bg-[#14191f] border-[#585e68] text-white placeholder:text-[#8a94a3]',
    muted: 'text-[#8a94a3]',
  },
  light: {
    root: 'bg-vt-surface text-vt-dark-text',
    divider: 'border-vt-border',
    hover: 'hover:bg-[#f5f5f5]',
    selected: 'bg-[#f5f5f5] before:bg-vt-primary-2',
    search: 'bg-vt-surface border-vt-control-border text-vt-dark-text placeholder:text-vt-grey-text',
    muted: 'text-vt-grey-text',
  },
} as const

function ModuleSidebar({
  moduleName,
  items,
  activeId,
  onNavigate,
  theme = 'dark',
  collapsed = false,
  searchable = true,
  className,
}: ModuleSidebarProps) {
  const styles = themeStyles[theme]
  const [query, setQuery] = React.useState('')
  const [openIds, setOpenIds] = React.useState<Set<string>>(() => {
    const open = new Set<string>()
    for (const item of items) {
      if (item.children?.some((child) => child.id === activeId)) open.add(item.id)
    }
    return open
  })

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return items
    return items.flatMap((item) => {
      const matchedChildren = item.children?.filter((child) => child.label.toLowerCase().includes(term))
      if (item.label.toLowerCase().includes(term)) return [item]
      if (matchedChildren?.length) return [{ ...item, children: matchedChildren }]
      return []
    })
  }, [items, query])

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const rowBase = cn(
    'relative flex h-12 w-full items-center gap-2 px-4 text-left text-sm leading-5 font-light outline-none transition-colors',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vt-focus-ring',
    styles.hover,
  )
  const selectedRow = cn(
    'before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-[""]',
    styles.selected,
  )

  return (
    <nav
      aria-label={moduleName}
      data-slot="module-sidebar"
      data-theme={theme}
      className={cn(
        'flex shrink-0 flex-col overflow-y-auto font-sans',
        collapsed ? 'w-12' : 'w-56',
        styles.root,
        className,
      )}
    >
      {!collapsed && (
        <div className={cn('flex flex-col gap-3 border-b px-4 py-3.5', styles.divider)}>
          <span className="font-heading text-sm leading-5 font-normal">{moduleName}</span>
          {searchable && (
            <div className="relative">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                aria-label={`Search ${moduleName}`}
                className={cn(
                  'h-8 w-full rounded border px-2 pr-8 text-sm outline-none focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
                  styles.search,
                )}
              />
              <Icon name="magnifying-glass" aria-hidden className={cn('pointer-events-none absolute top-2 right-2', styles.muted)} />
            </div>
          )}
        </div>
      )}

      <ul className="flex flex-col">
        {filtered.map((item) => {
          const hasChildren = Boolean(item.children?.length)
          const isOpen = openIds.has(item.id) || Boolean(query.trim())
          const isActive = item.id === activeId

          return (
            <li key={item.id}>
              <button
                type="button"
                aria-current={isActive ? 'page' : undefined}
                aria-expanded={hasChildren ? isOpen : undefined}
                aria-label={collapsed ? item.label : undefined}
                title={collapsed ? item.label : undefined}
                onClick={() => (hasChildren ? toggle(item.id) : onNavigate?.(item.id))}
                className={cn(rowBase, collapsed && 'justify-center px-0', isActive && !hasChildren && selectedRow)}
              >
                <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
                  {item.icon ?? <Icon name="plus" aria-hidden />}
                </span>
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && hasChildren && (
                  <Icon name="chevron-down" aria-hidden className={cn('transition-transform', isOpen && 'rotate-180')} />
                )}
              </button>

              {!collapsed && hasChildren && isOpen && (
                <ul>
                  {item.children?.map((child) => {
                    const childActive = child.id === activeId
                    return (
                      <li key={child.id}>
                        <button
                          type="button"
                          aria-current={childActive ? 'page' : undefined}
                          onClick={() => onNavigate?.(child.id)}
                          className={cn(rowBase, 'pl-11', childActive && selectedRow)}
                        >
                          <span className="flex-1 truncate">{child.label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>

      {!collapsed && filtered.length === 0 && (
        <div className={cn('flex flex-col items-center gap-3 px-4 py-12 text-sm', styles.muted)}>
          <Icon name="magnifying-glass" aria-hidden size={24} />
          <span>No results found</span>
        </div>
      )}
    </nav>
  )
}

export { ModuleSidebar }
