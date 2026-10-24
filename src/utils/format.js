const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** '2026-09-04' -> '04 SEP 2026' */
export function formatDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value || ''
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = MONTHS[d.getUTCMonth()] || ''
  return `${day} ${month} ${d.getUTCFullYear()}`
}

/** Relative-ish, honest wording: "updated 12 days ago" or a full date. */
export function timeAgo(value, now = new Date()) {
  const then = new Date(value)
  if (Number.isNaN(then.getTime())) return ''
  const days = Math.round((now.getTime() - then.getTime()) / 86400000)
  if (days < 1) return 'today'
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.round(days / 30)} months ago`
  return `${Math.round(days / 365)} years ago`
}

/**
 * Handoff readiness, derived only from the fields the fixture declares.
 * Never invented — a project with no checklist is reported as "not assessed".
 */
export function handoffFraction(project) {
  const list = project.handoffChecklist || []
  if (list.length === 0) return { met: 0, total: 0, pct: 0, assessed: false }
  const met = list.filter((item) => item.met).length
  return { met, total: list.length, pct: Math.round((met / list.length) * 100), assessed: true }
}

export function pluralise(n, singular, plural) {
  return n === 1 ? singular : plural || `${singular}s`
}
