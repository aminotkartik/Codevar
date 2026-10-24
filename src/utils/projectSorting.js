/**
 * Deterministic sorting for the RE archive.
 *
 * Rules:
 *  - the same input always produces the same output (no randomness);
 *  - every comparator has a stable tie-breaker (archive id);
 *  - missing or malformed values are coerced, never producing NaN;
 *  - the label shown in the UI and the comparator below always agree.
 */

export const SORT_OPTIONS = [
  {
    id: 'curated',
    label: 'Curated / Featured',
    short: 'Curated',
    description: 'Featured entries first, then editorial priority, then progress.',
    metric: (p) => `${p.featured ? 'Featured' : 'Shelf'} · priority ${num(p.priority)}`,
  },
  {
    id: 'recent',
    label: 'Recently Updated',
    short: 'Recent',
    description: 'Newest field-note date first.',
    metric: (p) => `Updated ${p.updatedAt || 'unknown'}`,
  },
  {
    id: 'complete',
    label: 'Most Complete',
    short: 'Complete',
    description: 'Furthest along first, by recorded completion.',
    metric: (p) => `${num(p.completion)}% complete`,
  },
  {
    id: 'help',
    label: 'Needs the Most Help',
    short: 'Needs help',
    description: 'Highest help priority first; least complete breaks ties.',
    metric: (p) => `Help priority ${num(p.priority)} · ${num(p.completion)}% built`,
  },
  {
    id: 'az',
    label: 'A — Z',
    short: 'A–Z',
    description: 'Alphabetical by project title.',
    metric: (p) => p.title || 'Untitled',
  },
]

export const DEFAULT_SORT = 'curated'
export const SORT_IDS = SORT_OPTIONS.map((option) => option.id)

/** Never let a stale or hand-written URL leave the control in an unknown state. */
export function normaliseSortId(value) {
  return SORT_IDS.includes(value) ? value : DEFAULT_SORT
}

export function sortOption(sortId) {
  return SORT_OPTIONS.find((option) => option.id === normaliseSortId(sortId))
}

/** Numeric coercion that never yields NaN. */
function num(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function parseDate(value) {
  const t = Date.parse(value)
  return Number.isNaN(t) ? 0 : t
}

function byId(a, b) {
  return String(a.id || '').localeCompare(String(b.id || ''), 'en')
}

function byTitle(a, b) {
  return String(a.title || '').localeCompare(String(b.title || ''), 'en', {
    sensitivity: 'base',
    numeric: true,
  })
}

export const COMPARATORS = {
  // Featured first → higher editorial priority → more complete → archive order.
  curated: (a, b) =>
    Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
    num(b.priority) - num(a.priority) ||
    num(b.completion) - num(a.completion) ||
    byId(a, b),

  // Newest first; undated entries fall to the end, then archive order.
  recent: (a, b) => parseDate(b.updatedAt) - parseDate(a.updatedAt) || byTitle(a, b) || byId(a, b),

  // Furthest along first; missing completion counts as 0.
  complete: (a, b) => num(b.completion) - num(a.completion) || byTitle(a, b) || byId(a, b),

  // The list the archive is actually asking for help with.
  help: (a, b) =>
    num(b.priority) - num(a.priority) ||
    num(a.completion) - num(b.completion) ||
    byId(a, b),

  // Alphabetical, case-insensitive, numeric-aware, archive id to break ties.
  az: (a, b) => byTitle(a, b) || byId(a, b),
}

export function sortProjects(projects, sortId) {
  const list = Array.isArray(projects) ? projects : []
  const comparator = COMPARATORS[normaliseSortId(sortId)]
  return [...list].sort(comparator)
}

/**
 * Subtly reorder an already-sorted list so projects in the areas the user
 * picked sit at the front. Everything else keeps its sorted place.
 *
 * This is expressly *not* applied to explicit sort modes — an explicit sort
 * must always win, or the control would appear to do nothing.
 */
export function applyInterestBoost(sortedProjects, interests) {
  if (!interests || interests.length === 0) return sortedProjects
  const matched = []
  const rest = []
  sortedProjects.forEach((project) =>
    interests.includes(project.category) ? matched.push(project) : rest.push(project),
  )
  return [...matched, ...rest]
}

/**
 * One entry point for the view: pick the mode, then (only for the curated
 * default) nudge for the visitor's interests.
 */
export function orderForView(projects, sortId, interests = []) {
  const mode = normaliseSortId(sortId)
  const ordered = sortProjects(projects, mode)
  return mode === DEFAULT_SORT ? applyInterestBoost(ordered, interests) : ordered
}
