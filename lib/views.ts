import { isOverdue } from './actions'
import { CURRENT_USER } from './mock-data'
import type { DsarRequest, ViewId } from './types'

export type FilterId = 'standard' | 'confirmed' | 'suspected' | 'overdue' | 'open' | 'my-group' | 'mine' | 'open-subtasks'

export type TableFilter = {
  id: FilterId
  /** Text on the applied-filter tag. */
  label: string
  match: (r: DsarRequest) => boolean
}

/** Filters a saved view applies. Each one shows as a removable tag under the view picker. */
export const FILTERS: Record<FilterId, TableFilter> = {
  standard: { id: 'standard', label: 'Standard requests', match: (r) => r.flag === null },
  confirmed: { id: 'confirmed', label: 'Confirmed automation', match: (r) => r.flag === 'confirmed' },
  suspected: { id: 'suspected', label: 'Suspected automation', match: (r) => r.flag === 'suspected' },
  overdue: { id: 'overdue', label: 'Overdue', match: (r) => isOverdue(r) },
  open: { id: 'open', label: 'Open requests', match: (r) => !['Complete', 'Rejected', 'Closed', 'Expired'].includes(r.stage) },
  'my-group': {
    id: 'my-group',
    label: 'My group',
    match: (r) => r.assignee === 'Privacy Ops queue' || r.assignee === CURRENT_USER,
  },
  mine: { id: 'mine', label: 'Assigned to me', match: (r) => r.assignee === CURRENT_USER },
  'open-subtasks': { id: 'open-subtasks', label: 'Open subtasks', match: (r) => r.subtasksTotal > r.subtasksDone },
}

export const matchesFilters = (r: DsarRequest, filters: FilterId[]) => filters.every((f) => FILTERS[f].match(r))

export type SavedView = {
  id: ViewId
  label: string
  description?: string
  isNew?: boolean
  filters: FilterId[]
  match: (r: DsarRequest) => boolean
}

const view = (v: Omit<SavedView, 'match'>): SavedView => ({ ...v, match: (r) => matchesFilters(r, v.filters) })

/** Seeded views. Order follows Story 1, AC 11; the pre-existing seeded views follow. */
export const VIEWS: SavedView[] = [
  view({ id: 'all', label: 'All requests', filters: [] }),
  view({ id: 'standard', label: 'Standard requests', description: 'Requests with no automation flag', isNew: true, filters: ['standard'] }),
  view({
    id: 'confirmed',
    label: 'Confirmed automation',
    description: 'Requests flagged as confirmed automation',
    isNew: true,
    filters: ['confirmed'],
  }),
  view({
    id: 'suspected',
    label: 'Suspected automation',
    description: 'Requests flagged as suspected automation',
    isNew: true,
    filters: ['suspected'],
  }),
  view({ id: 'attention', label: 'Attention required', filters: ['overdue', 'open'] }),
  view({ id: 'my-group', label: 'My group requests', filters: ['my-group'] }),
  view({ id: 'mine', label: 'My requests', filters: ['mine'] }),
  view({ id: 'my-subtasks', label: 'Requests with my subtasks', filters: ['mine', 'open-subtasks'] }),
]
