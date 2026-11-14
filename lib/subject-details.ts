import type { DsarRequest } from '@/lib/types'

/**
 * Data subject details the request detail page shows but the seeded requests don't carry.
 * Each value is derived from the request ID, so a request always shows the same details.
 */

const LOCATIONS = [
  { country: 'United States', state: 'California', city: 'San Francisco, CA', zip: '94107', street: 'Market Street' },
  { country: 'United States', state: 'New York', city: 'Brooklyn, NY', zip: '11201', street: 'Atlantic Avenue' },
  { country: 'United Kingdom', state: null, city: 'London', zip: 'EC1V 9HX', street: 'City Road' },
  { country: 'Germany', state: null, city: 'Berlin', zip: '10115', street: 'Invalidenstraße' },
  { country: 'France', state: null, city: 'Paris', zip: '75011', street: 'Rue Oberkampf' },
  { country: 'Canada', state: 'British Columbia', city: 'Vancouver, B.C.', zip: 'V5N 1L8', street: 'Oak Street' },
] as const

const LANGUAGES: Record<string, string> = {
  'United States': 'English',
  'United Kingdom': 'English',
  Germany: 'German',
  France: 'French',
  Canada: 'English',
}

/** Highest automated submission score; the detail page shows "N out of 80". */
export const MAX_SUBMISSION_SCORE = 80

function hash(id: string) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

export function subjectDetails(r: DsarRequest) {
  const h = hash(r.id)
  const loc = LOCATIONS[h % LOCATIONS.length]
  // Scores line up with the flag: confirmed 60-80, suspected 40-59, standard 5-39.
  const score = r.flag === 'confirmed' ? 60 + (h % 21) : r.flag === 'suspected' ? 40 + (h % 20) : 5 + (h % 35)
  const hours = r.subtasksDone + (h % 3)
  return {
    ...loc,
    address: `${100 + (h % 1900)} ${loc.street}`,
    language: LANGUAGES[loc.country] ?? 'English',
    hoursWorked: hours,
    // A $1.25 processing fee per request, as in the Figma example, plus $45 per hour worked.
    totalCost: `$${(1.25 + hours * 45).toFixed(2)}`,
    submissionScore: score,
    webForm: r.flag ? 'Ver02.002' : `Ver02.00${1 + (h % 2)}`,
  }
}
