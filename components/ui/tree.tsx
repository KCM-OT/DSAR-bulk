'use client'

import * as React from 'react'

import { Icon, type IconName } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Tree" and "❖ .tree/Tree Line Item": a bordered (#9db4cc)
 * container of 36px rows. Rows indent 28px per level, use a black square
 * expand toggle, and tint #eef7ff on hover, #e0f1ff when selected and #f2f2f2
 * when disabled. Tree select adds a search field above the rows.
 */
interface TreeNode {
  id: string
  label: string
  heading?: string
  icon?: IconName
  disabled?: boolean
  children?: TreeNode[]
}

function collectBranchIds(nodes: TreeNode[]): string[] {
  return nodes.flatMap((node) => (node.children?.length ? [node.id, ...collectBranchIds(node.children)] : []))
}

function filterNodes(nodes: TreeNode[], query: string): TreeNode[] {
  return nodes.flatMap((node) => {
    const matchingChildren = node.children ? filterNodes(node.children, query) : []
    const matches = node.label.toLowerCase().includes(query)
    if (!matches && matchingChildren.length === 0) return []
    return [{ ...node, children: matches && matchingChildren.length === 0 ? node.children : matchingChildren }]
  })
}

interface TreeProps {
  nodes: TreeNode[]
  selectedId?: string | null
  defaultSelectedId?: string | null
  onSelect?: (node: TreeNode) => void
  defaultExpandedIds?: string[]
  expandAll?: boolean
  bordered?: boolean
  'aria-label'?: string
  className?: string
}

function Tree({
  nodes,
  selectedId,
  defaultSelectedId = null,
  onSelect,
  defaultExpandedIds = [],
  expandAll,
  bordered = true,
  className,
  ...props
}: TreeProps) {
  const [expanded, setExpanded] = React.useState(() => new Set(defaultExpandedIds))
  const [internalSelected, setInternalSelected] = React.useState<string | null>(defaultSelectedId)
  const activeId = selectedId !== undefined ? selectedId : internalSelected
  const openIds = expandAll ? new Set(collectBranchIds(nodes)) : expanded

  const toggle = (id: string, next?: boolean) =>
    setExpanded((current) => {
      const updated = new Set(current)
      if (next ?? !updated.has(id)) updated.add(id)
      else updated.delete(id)
      return updated
    })

  const select = (node: TreeNode) => {
    setInternalSelected(node.id)
    onSelect?.(node)
  }

  const renderBranch = (branch: TreeNode[], depth: number): React.ReactNode =>
    branch.map((node) => {
      const hasChildren = Boolean(node.children?.length)
      const isOpen = hasChildren && openIds.has(node.id)
      const isSelected = activeId === node.id

      return (
        <div
          key={node.id}
          role="treeitem"
          aria-level={depth + 1}
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-selected={isSelected}
          aria-disabled={node.disabled || undefined}
        >
          <div
            tabIndex={node.disabled ? -1 : 0}
            onClick={() => !node.disabled && select(node)}
            onKeyDown={(event) => {
              if (node.disabled) return
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                select(node)
              }
              if (event.key === 'ArrowRight' && hasChildren) toggle(node.id, true)
              if (event.key === 'ArrowLeft' && hasChildren) toggle(node.id, false)
            }}
            style={{ paddingLeft: 12 + depth * 28 }}
            className={cn(
              'flex min-h-9 cursor-pointer items-center gap-2 py-2 pr-3 font-sans text-[13px] leading-5 font-light tracking-[-0.01em] text-[#1c2840] outline-none',
              'hover:bg-[#eef7ff] focus-visible:ring-2 focus-visible:ring-vt-focus-ring focus-visible:ring-inset',
              isSelected && 'bg-[#e0f1ff]',
              node.disabled && 'pointer-events-none cursor-not-allowed bg-[#f2f2f2] text-[#898989]',
            )}
          >
            {hasChildren ? (
              <span
                aria-hidden
                onClick={(event) => {
                  event.stopPropagation()
                  toggle(node.id)
                }}
                className="grid size-4 shrink-0 place-items-center rounded-sm bg-vt-dark-text text-vt-light-text"
              >
                {isOpen ? <span className="h-0.5 w-2 bg-current" /> : <Icon name="plus" size={10} />}
              </span>
            ) : (
              <span aria-hidden className="size-4 shrink-0" />
            )}
            {node.icon && <Icon name={node.icon} size={16} className="shrink-0 text-vt-dark-text" />}
            <span className="flex min-w-0 flex-col">
              {node.heading && <span className="text-xs leading-4 text-vt-grey-text">{node.heading}</span>}
              <span className="truncate">{node.label}</span>
            </span>
          </div>
          {isOpen && <div role="group">{renderBranch(node.children ?? [], depth + 1)}</div>}
        </div>
      )
    })

  return (
    <div
      role="tree"
      data-slot="tree"
      className={cn(
        'flex flex-col rounded bg-vt-surface py-2',
        bordered && 'border border-[#9db4cc]',
        className,
      )}
      {...props}
    >
      {renderBranch(nodes, 0)}
    </div>
  )
}

interface TreeSelectProps extends Omit<TreeProps, 'bordered' | 'expandAll'> {
  placeholder?: string
}

function TreeSelect({ nodes, placeholder = 'Search...', className, ...props }: TreeSelectProps) {
  const [query, setQuery] = React.useState('')
  const normalized = query.trim().toLowerCase()
  const visible = React.useMemo(() => (normalized ? filterNodes(nodes, normalized) : nodes), [nodes, normalized])

  return (
    <div
      data-slot="tree-select"
      className={cn('flex flex-col rounded border border-[#9db4cc] bg-vt-surface', className)}
    >
      <div className="relative border-b border-[#9db4cc] p-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label="Search tree"
          className="h-8 w-full rounded border border-vt-control-border bg-vt-surface px-3 pr-9 font-sans text-sm font-light text-vt-dark-text outline-none placeholder:text-vt-control-border focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
        />
        <Icon
          name="magnifying-glass"
          size={16}
          className="pointer-events-none absolute top-1/2 right-6 -translate-y-1/2 text-vt-dark-text"
        />
      </div>
      <Tree nodes={visible} bordered={false} expandAll={normalized.length > 0} className="py-2" {...props} />
    </div>
  )
}

export { Tree, TreeSelect }
export type { TreeNode }
