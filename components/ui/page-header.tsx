import * as React from 'react'

import { Breadcrumb, type Crumb } from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

/**
 * Grounded against "❖ Page Header - next": white surface, 24px horizontal
 * padding, breadcrumbs row (4px vertical padding), title 24/32 medium with
 * -0.72 tracking, trailing action slot (secondary, primary, overflow menu),
 * 14/20 description, and an optional underline tab bar flush to the bottom.
 */
type PageHeaderProps = {
  title: string
  breadcrumbs?: Crumb[]
  description?: React.ReactNode
  badge?: React.ReactNode
  actions?: React.ReactNode
  tabs?: React.ReactNode
  className?: string
}

function PageHeader({ title, breadcrumbs, description, badge, actions, tabs, className }: PageHeaderProps) {
  return (
    <header data-slot="page-header" className={cn('flex flex-col bg-vt-surface px-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} className="pt-1" />}

      <div className="flex flex-col justify-center py-1">
        <div className="flex items-center gap-3 py-1">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h1 className="truncate font-heading text-2xl leading-8 font-medium tracking-[-0.03em] text-vt-dark-text">
              {title}
            </h1>
            {badge}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
        {description && (
          <p className="line-clamp-2 font-heading text-sm leading-5 font-medium text-vt-dark-text">{description}</p>
        )}
      </div>

      {tabs && <div className="pt-1">{tabs}</div>}
    </header>
  )
}

export { PageHeader }
