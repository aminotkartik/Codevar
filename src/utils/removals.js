/* ==========================================================================
   removals.js — reversible removal receipts.

   A removal is not undone by a button. Confirming a removal writes a receipt
   (a snapshot of exactly what was deleted, plus everything that was deleted
   with it) and the only way back is to drop that receipt into the Restore
   zone, through the same dispatcher as every other action.

   Everything here is pure and synchronous so the dispatcher, the desk and the
   tests all reason about the same rules.
   ========================================================================== */

/** How long a receipt keeps its snapshot. */
export const REMOVAL_TTL_HOURS = 24
export const REMOVAL_TTL_MS = REMOVAL_TTL_HOURS * 60 * 60 * 1000

/** How many receipts are kept at once; the oldest snapshot is dropped first. */
export const MAX_REMOVALS = 5

export const REMOVAL_KINDS = {
  saved: {
    id: 'saved',
    label: 'Saved project',
    zoneLabel: 'Saved project',
    description: 'A project you had saved to your desk. The archive entry was never touched.',
  },
  plan: {
    id: 'plan',
    label: 'Revival plan',
    zoneLabel: 'Revival plan',
    description: 'One revival plan, with its tasks and its original plan ID.',
  },
  project: {
    id: 'project',
    label: 'Published project',
    zoneLabel: 'Published project',
    description: 'A project you published locally, plus every revival plan that pointed at it.',
  },
}

const STATUS_TEXT = {
  drafted: 'Drafted',
  planning: 'Planning',
  working: 'Working locally',
  archived: 'Archived',
}

export function kindLabel(kind) {
  return REMOVAL_KINDS[kind]?.label || 'Removed record'
}

/**
 * Build a receipt. `snapshot` must contain everything needed to restore the
 * records exactly as they were — see `restorePlan` below for the shapes.
 */
export function makeRemovalReceipt({ id, kind, label, snapshot, now = Date.now() }) {
  return {
    id,
    kind,
    label,
    snapshot: snapshot || {},
    removedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + REMOVAL_TTL_MS).toISOString(),
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function timestamp(value) {
  const parsed = new Date(value).getTime()
  return Number.isFinite(parsed) ? parsed : NaN
}

export function isExpired(receipt, now = Date.now()) {
  const expires = timestamp(receipt?.expiresAt)
  return !Number.isFinite(expires) || expires <= now
}

/** A receipt is usable when it is well formed, not expired, and has a snapshot. */
export function isLive(receipt, now = Date.now()) {
  if (!isPlainObject(receipt)) return false
  if (typeof receipt.id !== 'string' || !receipt.id) return false
  if (!REMOVAL_KINDS[receipt.kind]) return false
  if (!isPlainObject(receipt.snapshot)) return false
  if (receipt.restoredAt) return false
  return !isExpired(receipt, now)
}

/**
 * Live receipts, newest first, capped. Anything malformed, expired or already
 * restored is dropped — a stale snapshot must never reach the desk.
 */
export function pruneRemovals(list, now = Date.now()) {
  if (!Array.isArray(list)) return []
  return list
    .filter((receipt) => isLive(receipt, now))
    .sort((a, b) => (timestamp(b.removedAt) || 0) - (timestamp(a.removedAt) || 0))
    .slice(0, MAX_REMOVALS)
}

export function removalCount(list, now = Date.now()) {
  return pruneRemovals(list, now).length
}

function relativeMinutes(ms) {
  const minutes = Math.max(1, Math.round(ms / 60000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.round(minutes / 60)
  return `${hours} hour${hours === 1 ? '' : 's'}`
}

/** Honest countdown copy — never promises recovery that is not available. */
export function recoveryWindowLabel(receipt, now = Date.now()) {
  const expires = timestamp(receipt?.expiresAt)
  if (!Number.isFinite(expires)) return 'Snapshot unavailable'
  const left = expires - now
  if (left <= 0) return 'Snapshot expired'
  return `${relativeMinutes(left)} left to restore`
}

/** One sentence describing what a receipt holds, used on the card and toasts. */
export function describeRemoval(receipt) {
  const snapshot = receipt?.snapshot || {}
  if (receipt?.kind === 'project') {
    const planCount = Array.isArray(snapshot.plans) ? snapshot.plans.length : 0
    return planCount > 0
      ? `the project and ${planCount} revival plan${planCount === 1 ? '' : 's'} for it`
      : 'the project'
  }
  if (receipt?.kind === 'plan') {
    const tasks = Array.isArray(snapshot.plan?.tasks) ? snapshot.plan.tasks.length : 0
    const status = STATUS_TEXT[snapshot.plan?.status]
    return `the revival plan${status ? ` (${status})` : ''}${
      tasks > 0 ? ` with its ${tasks} task${tasks === 1 ? '' : 's'}` : ''
    }`
  }
  return 'the saved project'
}

/**
 * What would restoring this receipt do, given the desk as it is right now?
 *
 * Returns `{ ok: true }` or `{ ok: false, reason }`. The dispatcher refuses on
 * anything other than `ok: true`; the card uses the reason to explain itself
 * instead of offering a drop that cannot work.
 */
export function validateRestore(
  receipt,
  { now = Date.now(), saved = [], plans = [], projectsById, projectsBySlug } = {},
) {
  if (!isPlainObject(receipt)) return { ok: false, reason: 'That receipt could not be read.' }
  if (receipt.restoredAt) {
    return { ok: false, reason: 'This removal was already restored, so nothing changed.' }
  }
  if (!REMOVAL_KINDS[receipt.kind]) {
    return { ok: false, reason: 'That receipt is not a kind RE can restore.' }
  }
  if (isExpired(receipt, now)) {
    return {
      ok: false,
      reason: `This removal is older than ${REMOVAL_TTL_HOURS} hours, so its snapshot is gone. Nothing was restored.`,
    }
  }

  const snapshot = receipt.snapshot || {}
  const hasProject = (id) => Boolean(id) && Boolean(projectsById?.has?.(id))

  if (receipt.kind === 'saved') {
    const projectId = snapshot.projectId
    if (!projectId) return { ok: false, reason: 'That receipt has no project ID, so nothing was restored.' }
    if (saved.includes(projectId)) {
      return { ok: false, reason: 'That project is already on your desk, so nothing changed.' }
    }
    if (!hasProject(projectId)) {
      return {
        ok: false,
        reason: 'The project this receipt points at no longer exists, so it cannot be saved again.',
      }
    }
    return { ok: true }
  }

  if (receipt.kind === 'plan') {
    const plan = snapshot.plan
    if (!isPlainObject(plan) || typeof plan.id !== 'string') {
      return { ok: false, reason: 'That receipt has no plan to restore.' }
    }
    if (plans.some((existing) => existing.id === plan.id)) {
      return { ok: false, reason: 'A plan with that ID is already on your desk, so nothing changed.' }
    }
    if (!hasProject(plan.projectId)) {
      return {
        ok: false,
        reason: 'The project this plan refers to is no longer here, so the plan cannot be restored.',
      }
    }
    return { ok: true }
  }

  // kind === 'project'
  const project = snapshot.project
  if (!isPlainObject(project) || typeof project.id !== 'string' || typeof project.slug !== 'string') {
    return { ok: false, reason: 'That receipt has no project to restore.' }
  }
  if (projectsById?.has?.(project.id) || projectsBySlug?.has?.(project.slug)) {
    return {
      ok: false,
      reason: 'A project with that ID or address already exists, so nothing was restored.',
    }
  }
  const restoredPlans = Array.isArray(snapshot.plans) ? snapshot.plans : []
  const clash = restoredPlans.find((plan) => plans.some((existing) => existing.id === plan?.id))
  if (clash) {
    return {
      ok: false,
      reason: 'One of the plans in this snapshot already exists, so nothing was restored.',
    }
  }
  return { ok: true }
}

/** Short line for the receipt card: what comes back, and how. */
export function restoreSummary(receipt) {
  if (receipt?.kind === 'project') {
    const planCount = Array.isArray(receipt.snapshot?.plans) ? receipt.snapshot.plans.length : 0
    return planCount > 0
      ? `The project and its ${planCount} plan${planCount === 1 ? '' : 's'} return with their original IDs.`
      : 'The project returns with its original ID.'
  }
  if (receipt?.kind === 'plan') {
    return 'The plan returns with its original ID, status, tasks and timestamps.'
  }
  return 'The project returns to your saved list. Nothing is duplicated.'
}
