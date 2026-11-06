import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Grounded against the Vitreus UI Kit "❖ Buttons" component frame
// (@onetrust/vitreus/button): radius 4, min-height 32, min-width 80,
// label sm body semi-bold 14/20, content gap 8, focus ring 2px #167CBB
// (danger uses #FF4747). Brand primary is green (Primary 1/2), not blue.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded border border-transparent font-heading text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-vt-focus-ring disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-vt-primary-2 text-vt-light-text hover:bg-vt-primary-1 active:bg-vt-primary-1 active:border-vt-primary-2/50 disabled:bg-vt-empty disabled:text-vt-light-text',
        secondary:
          'border-vt-primary-2 bg-transparent text-vt-primary-1 hover:bg-vt-success-light active:bg-vt-success-light active:border-vt-primary-1 disabled:border-vt-empty disabled:text-vt-empty',
        ghost:
          'border-transparent bg-transparent text-vt-primary-1 hover:bg-vt-success-light active:bg-vt-success-light active:border-vt-primary-3 disabled:text-vt-empty',
        outline:
          'border-transparent bg-transparent text-vt-dark-text hover:bg-vt-information-light active:bg-vt-information-light active:border-vt-secondary-2 disabled:text-[#898989]',
        destructive:
          'bg-vt-error text-vt-light-text focus-visible:ring-[#ff4747] disabled:border disabled:border-[#eeeeee] disabled:bg-[#f67f7f]',
        link: 'h-auto min-w-0 gap-1 border-0 px-0 py-0 text-base font-semibold text-vt-information hover:underline',
      },
      size: {
        default: 'h-8 min-w-20 px-4 py-1.5 text-sm',
        sm: 'h-6 min-w-16 px-3 text-xs',
        lg: 'h-9 min-w-24 px-4 text-base',
        icon: 'size-8 min-w-0 rounded p-2',
        'icon-sm': 'size-6 min-w-0 rounded p-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
