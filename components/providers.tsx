'use client'

import * as React from 'react'

import { AppShell } from '@/components/app-shell'
import { JobsTray, ProgressModal } from '@/components/bulk/progress-modal'
import { DemoControls, Toasts } from '@/components/overlays'
import { StoreProvider } from '@/lib/store'

/**
 * Lives in the root layout so the mock data, running jobs and toasts persist while you move
 * between the queue and a request's detail page.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <AppShell>{children}</AppShell>
      <ProgressModal />
      {/* Bottom-right stack: toasts sit above any running or recent jobs. */}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[360px] flex-col gap-2">
        <Toasts />
        <JobsTray />
      </div>
      <DemoControls />
    </StoreProvider>
  )
}
