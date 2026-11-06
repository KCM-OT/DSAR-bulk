import { isOverdue } from './actions'
import { CURRENT_USER } from './mock-data'
import type { DsarRequest, ViewId } from './types'

export type SavedView = {
  id: ViewId
  label: string
  description?: string
  isNew?: boolean
  match: (r: DsarRequest) => boolean
}

/** Seeded views. Order follows Story 1, AC 11; the pre-existing seeded views follow. */
export const VIEWS: SavedView[] = [
  { id: 'all', label: 'All requests', match: () => true },
  {
    id: 'standard',
    label: 'Standard requests',
    description: 'Requests with no automation flag',
    isNew: true,
    match: (r) => r.flag === null,
  },
  {
    id: 'confirmed',
    label: 'Confirmed automation',
    description: 'Requests flagged as confirmed automation',
    isNew: true,
    match: (r) => r.flag === 'confirmed',
  },
  {
    id: 'suspected',
    label: 'Suspected automation',
    description: 'Requests flagged as suspected automation',
    isNew: true,
    match: (r) => r.flag === 'suspected',
  },
  {
    id: 'attention',
    label: 'Attention required',
    match: (r) => isOverdue(r) && !['Complete', 'Rejected', 'Closed', 'Expired'].includes(r.stage),
  },
  { id: 'my-group', label: 'My group requests', match: (r) => r.assignee === 'Privacy Ops queue' || r.assignee === CURRENT_USER },
  { id: 'mine', label: 'My requests', match: (r) => r.assignee === CURRENT_USER },
  { id: 'my-subtasks', label: 'Requests with my subtasks', match: (r) => r.assignee === CURRENT_USER && r.subtasksTotal > r.subtasksDone },
]
