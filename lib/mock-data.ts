import type { AutomationFlag, DsarRequest, Stage } from './types'

export const CURRENT_USER = 'Kevin Marshall'
export const TODAY = new Date('2026-11-06T09:00:00')

export const WORKFLOWS = [
  'Default DSAR workflow',
  'Access request - EU',
  'Deletion request - US',
  'Authorized agent - automated',
  'Suspected automation review',
] as const

export const ASSIGNEES = [CURRENT_USER, 'Priya Malhotra', 'Jordan Lee', 'Amara Okafor', 'Diego Ramos', 'Privacy Ops queue']

export const AGENTS = ['Incogni', 'DeleteMe', 'Optery', 'Kanary', 'Privacy Bee']

export const RESPONSE_TEMPLATES = [
  {
    id: 'ack',
    name: 'Acknowledgement of request',
    body: 'Hello {{SubjectFirstName}},\n\nWe have received your privacy request ({{RequestId}}) and are reviewing it. We will respond within the time required by applicable law.\n\nKind regards,\nPrivacy Team',
  },
  {
    id: 'agent-auth',
    name: 'Authorized agent: proof of authorization needed',
    body: 'Hello,\n\nThis request was submitted by an authorized agent. Before we can proceed, please provide signed proof of authorization from the data subject.\n\nKind regards,\nPrivacy Team',
  },
  {
    id: 'no-data',
    name: 'No personal data found',
    body: 'Hello {{SubjectFirstName}},\n\nWe searched our systems and did not find any personal data associated with the details you provided. Your request ({{RequestId}}) is now complete.\n\nKind regards,\nPrivacy Team',
  },
  {
    id: 'deleted',
    name: 'Deletion completed',
    body: 'Hello {{SubjectFirstName}},\n\nYour personal data has been deleted in line with your request ({{RequestId}}).\n\nKind regards,\nPrivacy Team',
  },
]

const FIRST = ['Priya', 'Liam', 'Sofia', 'Noah', 'Maya', 'Ethan', 'Ava', 'Lucas', 'Isla', 'Mateo', 'Chloe', 'Arjun', 'Zara', 'Owen', 'Leah', 'Kai', 'Nora', 'Elijah', 'Hana', 'Theo', 'Ines', 'Ravi', 'Freya', 'Omar']
const LAST = ['Malhotra', 'Nguyen', 'Garcia', 'Smith', 'Okafor', 'Kowalski', 'Haddad', 'Johansson', 'Tanaka', 'Rossi', 'Dubois', 'Patel', 'Murphy', 'Schmidt', 'Silva', 'Kim', 'Novak', 'Brown']
const TYPES = ['Info request', 'Deletion', 'Access', 'Do not sell or share', 'Correction']
const SUBJECTS = ['Customer', 'Customer', 'Customer', 'Employee', 'Prospect']

// Small deterministic PRNG so the mock data is stable across reloads.
function rng(seed: number) {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function weighted<T>(rand: () => number, entries: [T, number][]): T {
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  let roll = rand() * total
  for (const [value, w] of entries) {
    roll -= w
    if (roll <= 0) return value
  }
  return entries[entries.length - 1][0]
}

const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRequests(count = 640): DsarRequest[] {
  const rand = rng(20261106)
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)]
  const requests: DsarRequest[] = []

  for (let i = 0; i < count; i++) {
    const flag = weighted<AutomationFlag>(rand, [
      [null, 46],
      ['confirmed', 38],
      ['suspected', 16],
    ])
    const stage = weighted<Stage>(rand, [
      ['New', 30],
      ['Unverified', 9],
      ['Verifying identity', 14],
      ['In progress', 22],
      ['Awaiting data', 8],
      ['Complete', 7],
      ['Rejected', 4],
      ['Closed', 3],
      ['Expired', 3],
    ])
    const first = pick(FIRST)
    const last = pick(LAST)
    const agent = pick(AGENTS)
    const daysAgo = Math.floor(rand() * 70)
    const created = new Date(TODAY.getTime() - daysAgo * 86400000 - Math.floor(rand() * 86400000))
    const extended = rand() < 0.12
    const deadline = new Date(created.getTime() + (extended ? 90 : 45) * 86400000)

    const workflow =
      flag === 'confirmed'
        ? weighted(rand, [
            ['Authorized agent - automated', 7],
            ['Default DSAR workflow', 3],
          ])
        : flag === 'suspected'
          ? weighted(rand, [
              ['Suspected automation review', 5],
              ['Default DSAR workflow', 5],
            ])
          : weighted(rand, [
              ['Default DSAR workflow', 5],
              ['Access request - EU', 3],
              ['Deletion request - US', 3],
            ])

    const subtasksTotal = stage === 'New' || stage === 'Unverified' ? Math.floor(rand() * 2) : 1 + Math.floor(rand() * 4)
    const done = stage === 'Complete' ? subtasksTotal : Math.floor(rand() * (subtasksTotal + 1))
    const requiredSubtaskOpen = stage !== 'Complete' && done < subtasksTotal && rand() < 0.55

    let id = ''
    for (let c = 0; c < 10; c++) id += ID_CHARS[Math.floor(rand() * ID_CHARS.length)]

    const submittedBy = flag ? `${agent} (authorized agent)` : 'Data subject'
    const assignee = rand() < 0.35 ? null : pick(ASSIGNEES)

    requests.push({
      id,
      name: `${first} ${last}`,
      email: `${first}.${last}`.toLowerCase() + '@example.com',
      organization: 'Priya Demo',
      submittedBy,
      stage,
      requestType: flag ? weighted(rand, [['Deletion', 6], ['Do not sell or share', 3], ['Access', 1]]) : pick(TYPES),
      createdAt: created.toISOString(),
      deadline: deadline.toISOString(),
      extended,
      subjectType: pick(SUBJECTS),
      workflow,
      assignee,
      flag,
      unread: rand() < 0.3,
      subtasksTotal,
      subtasksDone: done,
      requiredSubtaskOpen,
      comments: [],
      audit: [
        {
          at: created.toISOString(),
          by: 'System',
          text: flag === 'confirmed'
            ? `Request submitted via authorized agent form (${agent}). Flagged as confirmed automation at intake.`
            : flag === 'suspected'
              ? 'Request submitted via web form. Flagged as suspected automation at intake (bot score 0.82).'
              : 'Request submitted via web form.',
        },
      ],
    })
  }

  return requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function daysLeft(request: DsarRequest) {
  if (['Complete', 'Rejected', 'Closed', 'Expired'].includes(request.stage)) return null
  return Math.ceil((new Date(request.deadline).getTime() - TODAY.getTime()) / 86400000)
}

export function formatDate(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${date} ${time}`
}

/** Resolutions offered when rejecting a request, each with its own canned responses. */
export const REJECT_RESOLUTIONS: { id: string; label: string; responses: { id: string; name: string; body: string }[] }[] = [
  {
    id: 'unverified',
    label: 'Unable to verify identity',
    responses: [
      {
        id: 'unverified-1',
        name: 'Identity could not be verified',
        body: 'Hello {{SubjectFirstName}},\n\nWe were unable to verify your identity, so we cannot process your request ({{RequestId}}). You are welcome to submit a new request.\n\nKind regards,\nPrivacy Team',
      },
    ],
  },
  {
    id: 'agent',
    label: 'Unauthorized agent',
    responses: [
      {
        id: 'agent-1',
        name: 'No proof of authorization',
        body: 'Hello,\n\nThis request ({{RequestId}}) was submitted by an agent without valid proof of authorization from the data subject, so it has been rejected.\n\nKind regards,\nPrivacy Team',
      },
    ],
  },
  {
    id: 'duplicate',
    label: 'Duplicate request',
    responses: [
      {
        id: 'duplicate-1',
        name: 'Duplicate of an existing request',
        body: 'Hello {{SubjectFirstName}},\n\nThis request ({{RequestId}}) duplicates a request we are already processing, so it has been closed as a duplicate.\n\nKind regards,\nPrivacy Team',
      },
    ],
  },
  {
    id: 'out-of-scope',
    label: 'Request out of scope',
    responses: [
      {
        id: 'scope-1',
        name: 'Not covered by applicable law',
        body: 'Hello {{SubjectFirstName}},\n\nYour request ({{RequestId}}) is not covered by the privacy laws that apply to you, so we are unable to fulfil it.\n\nKind regards,\nPrivacy Team',
      },
    ],
  },
  { id: 'other', label: 'Other', responses: [] },
]
