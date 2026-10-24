/* ==========================================================================
   categories.js — the controlled vocabulary for RE's archive
   ========================================================================== */

export const CATEGORIES = [
  {
    id: 'dev',
    label: 'Developer Tools',
    color: 'var(--cat-dev)',
  },
  {
    id: 'design',
    label: 'Design & Creative',
    color: 'var(--cat-design)',
  },
  {
    id: 'civic',
    label: 'Civic & Community',
    color: 'var(--cat-civic)',
  },
  {
    id: 'sustainability',
    label: 'Sustainability',
    color: 'var(--cat-sustain)',
  },
  {
    id: 'education',
    label: 'Education',
    color: 'var(--cat-edu)',
  },
  {
    id: 'research',
    label: 'Research',
    color: 'var(--cat-research)',
  },
  {
    id: 'games',
    label: 'Games & Interactive',
    color: 'var(--cat-games)',
  },
]

export const STAGE_ORDER = [
  'Idea / Research',
  'Early Prototype',
  'Working Prototype',
  'Partially Complete',
  'Ready for Handoff',
]

export const STAGES = STAGE_ORDER

/** Map a stage to the severity of its badge dot. */
export function stageTone(stage) {
  switch (stage) {
    case 'Ready for Handoff':
      return 'ready'
    case 'Partially Complete':
      return 'partial'
    case 'Working Prototype':
      return 'working'
    case 'Early Prototype':
      return 'early'
    default:
      return 'early'
  }
}

/** The seven help-needed areas used by the discovery filter. */
export const HELP_NEEDED = [
  'Development',
  'Design',
  'Research',
  'Documentation',
  'Testing',
  'Product Thinking',
  'Community / Outreach',
]

/** How a project is available to be joined. */
export const AVAILABILITY = [
  { id: 'contributors', label: 'Open to contributors' },
  { id: 'coBuilder', label: 'Looking for a co-builder' },
  { id: 'stewardship', label: 'Open to stewardship' },
]

export const AVAILABILITY_LABELS = {
  contributors: 'Open to contributors',
  coBuilder: 'Looking for a co-builder',
  stewardship: 'Open to stewardship',
}

export const COLLABORATION_LABELS = {
  contributors: 'Looking for contributors',
  coBuilder: 'Looking for a co-builder',
  stewardship: 'Looking for someone to continue independently',
}

export const COLLABORATION_OPTIONS = [
  {
    id: 'contributors',
    label: 'Looking for contributors',
    description: 'Join alongside others and take on defined pieces of work.',
  },
  {
    id: 'coBuilder',
    label: 'Looking for a co-builder',
    description: 'Find someone to share ownership of the next chapter.',
  },
  {
    id: 'stewardship',
    label: 'Looking for someone to continue independently',
    description: 'Propose leading the project yourself, with the creator\'s agreement.',
  },
]

export const CATEGORY_LABELS = CATEGORIES.reduce((acc, c) => {
  acc[c.id] = c.label
  return acc
}, {})

export const CATEGORY_COLORS = CATEGORIES.reduce((acc, c) => {
  acc[c.id] = c.color
  return acc
}, {})

export function categoryLabel(id) {
  return CATEGORY_LABELS[id] || id
}

export function categoryColor(id) {
  return CATEGORY_COLORS[id] || 'var(--color-muted)'
}
