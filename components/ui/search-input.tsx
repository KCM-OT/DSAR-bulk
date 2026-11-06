import * as React from 'react'
import { Icon } from '@/components/ui/icon'

import { cn } from '@/lib/utils'

/**
 * Grounded against the table toolbar ".search-base": 32 tall, 1px #a9a9a9
 * border, radius 4, white fill, 16px trailing search icon, 16/24 placeholder
 * in #767676.
 */
function SearchInput({ className, placeholder = 'Search...', ...props }: React.ComponentProps<'input'>) {
  return (
    <div className={cn('relative w-full max-w-68', className)}>
      <input
        type="search"
        data-slot="search-input"
        placeholder={placeholder}
        aria-label={props['aria-label'] ?? placeholder}
        className={cn(
          'h-8 w-full rounded border border-[#a9a9a9] bg-vt-surface px-3 pr-9 font-heading text-base leading-6 font-medium text-vt-dark-text outline-none transition-colors',
          'placeholder:text-vt-control-border hover:border-vt-control-border',
          'focus-visible:border-vt-focus-ring focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
          '[&::-webkit-search-cancel-button]:appearance-none',
        )}
        {...props}
      />
      <Icon name="magnifying-glass" aria-hidden className="pointer-events-none absolute top-2 right-3 text-vt-dark-text" />
    </div>
  )
}

export { SearchInput }
