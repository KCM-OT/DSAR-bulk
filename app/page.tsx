'use client'

import { AppShell } from '@/components/app-shell'
import { JobsTray, ProgressModal } from '@/components/bulk/progress-modal'
import { DemoControls, Toasts } from '@/components/overlays'
import { RequestsQueue } from '@/components/queue/requests-queue'
import { StoreProvider } from '@/lib/store'

export default function Page() {
  return (
    <StoreProvider>
      <AppShell>
        <RequestsQueue />
      </AppShell>
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
