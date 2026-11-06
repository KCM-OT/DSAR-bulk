export type Stage =
  | 'New'
  | 'Unverified'
  | 'Verifying identity'
  | 'In progress'
  | 'Awaiting data'
  | 'Complete'
  | 'Rejected'
  | 'Closed'
  | 'Expired'

export type AutomationFlag = 'confirmed' | 'suspected' | null

export type AuditEntry = {
  at: string
  by: string
  text: string
}

export type Comment = {
  at: string
  by: string
  kind: 'public' | 'internal'
  text: string
  attachments: string[]
}

export type DsarRequest = {
  id: string
  name: string
  email: string
  organization: string
  submittedBy: string
  stage: Stage
  requestType: string
  createdAt: string
  deadline: string
  extended: boolean
  subjectType: string
  workflow: string
  assignee: string | null
  flag: AutomationFlag
  unread: boolean
  subtasksTotal: number
  subtasksDone: number
  /** True when at least one required subtask is still open. */
  requiredSubtaskOpen: boolean
  comments: Comment[]
  audit: AuditEntry[]
}

export type ViewId =
  | 'all'
  | 'standard'
  | 'confirmed'
  | 'suspected'
  | 'attention'
  | 'my-group'
  | 'mine'
  | 'my-subtasks'
