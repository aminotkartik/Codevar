/**
 * Deterministic sorting. No randomness, no hidden weights — the same input
 * always produces the same order.
 */

function parseDate(value) {
  const t = Date.parse(value)
  return Number.isNaN(t) ? 0 : t
}

export const SORT_OPTIONS = [
  { id: 'curated', label: 'Curated / Featured' },
  { id: 'recent', label: 'Recently Updated' },
  { id: 'complete', label: 'Most Complete' },
  { id: 'help', label: 'Needs the Most Help' },
  { id: 'az', label: 'A — Z' },
]

const COMPARATORS = {
  curated: (a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    if (b.priority !== a.priority) return b.priority - a.priority
    if (b.completion !== a.completion) return b.completion - a.completion
    return a.id.localeCompare(b.id)
  },

  recent: (a, b) => parseDate(b.updatedAt) - parseDate(a.updatedAt) || a.id.localeCompare(b.id),

  complete: (a, b) => b.completion - a.completion || a.id.localeCompare(b.id),

  help: (a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    if (a.completion !== b.completion) return a.completion - b.completion
    return a.id.localeCompare(b.id)
  },

  az: (a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id),
}

export function sortProjects(projects, sortId) {
  const comparator = COMPARATORS[sortId] || COMPARATORS.curated
  return [...projects].sort(comparator)
}

/**
 * Subtly reorder an already-sorted list so projects in the areas the user
 * picked sit at the front. Everything else stays visible, in its sorted place.
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
