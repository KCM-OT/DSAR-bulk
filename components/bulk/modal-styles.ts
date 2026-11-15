import { cn } from '@/lib/utils'

/**
 * Second step of a two-part modal, per Figma DSAR 4632:18775: 32px top padding, an 18/24 title
 * (-0.36px tracking), the close button 8px from the corner, and 8px between footer buttons.
 * Applied as overrides so the Vitreus ModalPanel stays as synced.
 */
export const CONFIRM_PANEL = cn(
  'pt-8',
  '[&>h2]:text-lg [&>h2]:leading-6 [&>h2]:tracking-[-0.36px]',
  '[&>button[aria-label=Close]]:top-2 [&>button[aria-label=Close]]:right-2',
  '[&>footer]:gap-2 [&>footer]:pt-[17px]',
)
