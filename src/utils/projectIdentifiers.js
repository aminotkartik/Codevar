/**
 * Identifiers for locally submitted projects.
 * Stable, collision-resistant, and readable in the UI.
 */

const SLUG_STRIP = /[^a-z0-9]+/g

export function slugify(input) {
  const slug = String(input || '')
    .trim()
    .toLowerCase()
    .replace(SLUG_STRIP, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return slug || 'untitled-project'
}

/** Produce the next archive number, e.g. RE-013. */
export function nextArchiveId(projects) {
  let max = 0
  projects.forEach((p) => {
    const match = /^RE-(\d+)$/i.exec(p.id || '')
    if (match) max = Math.max(max, Number(match[1]))
  })
  return `RE-${String(max + 1).padStart(3, '0')}`
}

/** Make a slug unique against an existing list, appending -2, -3, … */
export function uniqueSlug(base, projects) {
  const existing = new Set(projects.map((p) => p.slug))
  if (!existing.has(base)) return base
  let n = 2
  while (existing.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}

/** Short random-ish, collision-safe suffix without relying on Math.random. */
export function makeId(prefix) {
  const time = Date.now().toString(36)
  const counter = makeId.counter++
  return `${prefix}-${time}-${counter.toString(36)}`
}

makeId.counter = 0
