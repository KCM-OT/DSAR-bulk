import * as React from 'react'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/**
 * Grounded against the "❖ Page Header - next" breadcrumb: items 14/20 medium,
 * link crumbs #767676, current crumb #444444, 12px gap, 8px chevron separator.
 */
export type Crumb = { label: string; href?: string; onClick?: () => void }

function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" data-slot="breadcrumb" className={className}>
      <ol className="flex items-center gap-3 py-1 font-heading text-sm leading-5 font-medium">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1
          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <li className="flex items-center">
                {isCurrent ? (
                  <span aria-current="page" className="text-[#444444]">
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href ?? '#'}
                    onClick={(event) => {
                      if (item.onClick) {
                        event.preventDefault()
                        item.onClick()
                      }
                    }}
                    className={cn(
                      'rounded-sm text-vt-control-border outline-none hover:text-vt-information hover:underline',
                      'focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
                    )}
                  >
                    {item.label}
                  </a>
                )}
              </li>
              {!isCurrent && (
                <li aria-hidden className="flex items-center text-vt-control-border">
                  <Icon name="chevron-right" variant="filled" size={8} aria-hidden />
                </li>
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

export { Breadcrumb }
