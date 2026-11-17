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
  filters: FilterId[]
  match: (r: DsarRequest) => boolean
}

const view = (v: Omit<SavedView, 'match'>): SavedView => ({ ...v, match: (r) => matchesFilters(r, v.filters) })

/** Saved views, in the order of the Figma saved-view menu (DSAR 4547:6479). */
export const VIEWS: SavedView[] = [
  view({ id: 'all', label: 'All requests', filters: [] }),
  view({ id: 'standard', label: 'Standard requests', filters: ['standard'] }),
  view({ id: 'confirmed', label: 'Confirmed automated submissions', filters: ['confirmed'] }),
  view({ id: 'suspected', label: 'Suspected automated submissions', filters: ['suspected'] }),
]

/**
 * A one-off filter on a fixed set of requests, e.g. the requests a bulk action skipped.
 * It is handed to a new queue tab through localStorage (the ID list can be too long for a URL).
 */
export type IdFilter = { label: string; ids: string[] }

const ID_FILTER_PREFIX = 'dsar-id-filter:'
export const ID_FILTER_PARAM = 'filter'

/** Stores the filter and returns the queue URL that opens it. */
export function idFilterUrl(filter: IdFilter): string | null {
  const key = Math.random().toString(36).slice(2, 10)
  try {
    window.localStorage.setItem(ID_FILTER_PREFIX + key, JSON.stringify(filter))
  } catch {
    return null
  }
  return `/?${ID_FILTER_PARAM}=${key}`
}

export function loadIdFilter(key: string): IdFilter | null {
  try {
    const raw = window.localStorage.getItem(ID_FILTER_PREFIX + key)
    const parsed = raw ? (JSON.parse(raw) as IdFilter) : null
    return parsed && typeof parsed.label === 'string' && Array.isArray(parsed.ids) ? parsed : null
  } catch {
    return null
  }
}
