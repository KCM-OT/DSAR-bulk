'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Building2, CircleHelp, Inbox, LayoutDashboard, LayoutGrid, ListChecks, Settings, Sparkles, Wrench } from 'lucide-react'

import { Icon } from '@/components/ui/icon'
import { ModuleSidebar, type SidebarItem } from '@/components/ui/module-sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const NAV: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 /> },
  { id: 'requests', label: 'Requests', icon: <Inbox /> },
  { id: 'subtasks', label: 'Subtasks', icon: <ListChecks /> },
  {
    id: 'setup',
    label: 'Setup',
    icon: <Wrench />,
    children: [
      { id: 'web-forms', label: 'Web forms' },
      { id: 'workflows', label: 'Workflows' },
      { id: 'integrations', label: 'Integrations' },
      { id: 'response-templates', label: 'Response templates' },
      { id: 'subtask-templates', label: 'Subtask templates' },
      { id: 'redaction', label: 'Redaction preferences' },
    ],
  },
  { id: 'settings', label: 'Settings', icon: <Settings /> },
]

function TopBarButton({ label, children, className, ...props }: React.ComponentProps<'button'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'relative grid size-8 place-items-center rounded text-vt-dark-text outline-none hover:bg-vt-information-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function NotificationsMenu() {
  const { notifications, markNotificationsRead, setOpenJobId, jobs } = useStore()
  const unread = notifications.filter((n) => !n.read).length
  return (
    <DropdownMenu onOpenChange={(open) => !open && markNotificationsRead()}>
      <DropdownMenuTrigger asChild>
        <TopBarButton label="Notifications">
          <Icon name="bell" size={24} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-vt-error px-1 text-[10px] leading-4 font-semibold text-vt-light-text">
              {unread}
            </span>
          )}
        </TopBarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm font-light text-vt-grey-text">No notifications yet</p>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <DropdownMenuItem
              key={n.id}
              inGroup
              onSelect={() => n.jobId && jobs.some((j) => j.id === n.jobId) && setOpenJobId(n.jobId)}
              description={new Date(n.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              className={cn('text-sm leading-5', !n.read && 'font-normal')}
            >
              {n.text}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-vt-background">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-vt-border bg-vt-surface px-2">
        <TopBarButton label="Open app launcher menu">
          <LayoutGrid className="size-5" />
        </TopBarButton>
        <div className="flex items-center gap-2 pr-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma/logo-symbol-black.svg" alt="" className="h-5" />
          <span className="font-heading text-xl font-medium tracking-[-0.02em]">OneTrust</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <TopBarButton label="Global search">
            <Icon name="magnifying-glass" size={24} />
          </TopBarButton>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-2 rounded border border-vt-ai-border bg-gradient-to-r from-[#0788f7]/8 to-[#976fe6]/8 px-3 font-heading text-sm font-medium text-vt-information outline-none hover:border-vt-information focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
          >
            <Sparkles className="size-4 text-[#976fe6]" />
            Ask Copilot
          </button>
          <NotificationsMenu />
          <button
            type="button"
            className="inline-flex h-8 items-center gap-2 rounded px-2 font-heading text-sm font-medium outline-none hover:bg-vt-information-light focus-visible:ring-2 focus-visible:ring-vt-focus-ring"
          >
            <Building2 className="size-4" />
            Priya Demo
            <Icon name="chevron-down" size={12} />
          </button>
          <TopBarButton label="Settings">
            <Icon name="gear" size={24} />
          </TopBarButton>
          <span className="grid size-8 place-items-center rounded-full bg-[#7e57c2] font-heading text-xs font-medium text-vt-light-text">
            KM
          </span>
          <TopBarButton label="Get help">
            <CircleHelp className="size-[18px]" />
          </TopBarButton>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <ModuleSidebar
          moduleName="Privacy Rights Automation"
          items={NAV}
          activeId="requests"
          onNavigate={(id) => id === 'requests' && router.push('/')}
          theme="dark"
          searchable={false}
          className="w-60"
        />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
