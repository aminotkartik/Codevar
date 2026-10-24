import { AVAILABILITY } from '../data/categories'

/**
 * A project is available for stewardship when the flag is set, in addition
 * to the collaboration types the owner declared.
 */
export function availabilityOf(project) {
  return [
    ...new Set([
      ...(project.collaborationTypes || []),
      ...(project.openToStewardship ? ['stewardship'] : []),
    ]),
  ]
}

/** Normalise a search query: trim, collapse whitespace, casefold. */
export function normaliseQuery(raw) {
  return String(raw || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

/** Does the project text contain every token in the query? */
export function matchesQuery(project, query) {
  const q = normaliseQuery(query)
  if (!q) return true

  const haystack = [
    project.title,
    project.description,
    project.summary,
    project.category,
    project.stage,
    project.helpFocus,
    project.reasonPaused,
    ...(project.techStack || []),
    ...(project.skillsNeeded || []),
    ...(project.helpNeeded || []),
    ...(project.existingWork || []).map((w) => w.title),
    ...(project.missingWork || []).map((w) => `${w.title} ${w.detail}`),
    ...(project.nextSteps || []),
    ...(project.story || []),
    ...availabilityOf(project),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return q.split(' ').every((token) => haystack.includes(token))
}

/**
 * Apply the discovery filters to a list of projects.
 * Every active facet must be satisfied; within a facet, any match counts.
 */
export function applyFilters(projects, filters = {}) {
  const category = filters.category || []
  const stage = filters.stage || []
  const help = filters.help || []
  const availability = filters.availability || []

  return projects.filter((project) => {
    if (category.length && !category.includes(project.category)) return false
    if (stage.length && !stage.includes(project.stage)) return false
    if (help.length) {
      const projectHelp = project.helpNeeded || []
      const skills = project.skillsNeeded || []
      const helpMatch = help.some((h) => projectHelp.includes(h))
      const skillMatch = help.some((h) => skills.some((s) => s.toLowerCase().includes(h.toLowerCase())))
      if (!helpMatch && !skillMatch) return false
    }
    if (availability.length) {
      const available = availabilityOf(project)
      if (!availability.some((a) => available.includes(a))) return false
    }
    if (!matchesQuery(project, filters.q)) return false
    return true
  })
}

export function countActiveFilters(filters = {}) {
  return (
    (filters.category?.length || 0) +
    (filters.stage?.length || 0) +
    (filters.help?.length || 0) +
    (filters.availability?.length || 0)
  )
}

export function countByFacet(projects, facet) {
  const counts = {}
  const bucket = (key) => {
    counts[key] = (counts[key] || 0) + 1
  }
  projects.forEach((p) => {
    if (facet === 'category') bucket(p.category)
    else if (facet === 'stage') bucket(p.stage)
    else if (facet === 'availability') availabilityOf(p).forEach(bucket)
    else if (facet === 'help') (p.helpNeeded || []).forEach(bucket)
  })
  return counts
}

export const AVAILABILITY_IDS = AVAILABILITY.map((a) => a.id)
