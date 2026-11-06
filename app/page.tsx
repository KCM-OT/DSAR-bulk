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
      <JobsTray />
      <Toasts />
      <DemoControls />
    </StoreProvider>
  )
}
