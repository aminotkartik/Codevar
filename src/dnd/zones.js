/* ==========================================================================
   zones.js — the single registry of Action Zones.

   A zone declares what it is called, what it accepts, and what dropping a
   card there is allowed to do. Every screen renders zones from this list and
   every drop is validated against it, so a zone can never exist in the UI
   without a defined behaviour.
   ========================================================================== */

export const ITEM = {
  PROJECT: 'project',
  SAVED_PROJECT: 'saved-project',
  LOCAL_PROJECT: 'local-project',
  PLAN: 'plan',
  PLAN_DRAFT: 'plan-draft',
  CONTRIBUTION: 'contribution-intent',
  STEWARDSHIP: 'stewardship-proposal',
  DRAFT: 'project-draft',
  TASK: 'task',
  PENDING: 'pending-removal',
  RECEIPT: 'removal-receipt',
  DEMO_DATA: 'demo-data',
}

export const ITEM_LABELS = {
  [ITEM.PROJECT]: 'Archive project',
  [ITEM.SAVED_PROJECT]: 'Saved project',
  [ITEM.LOCAL_PROJECT]: 'Your project',
  [ITEM.PLAN]: 'Revival plan',
  [ITEM.PLAN_DRAFT]: 'Edited plan',
  [ITEM.CONTRIBUTION]: 'Contribution intent',
  [ITEM.STEWARDSHIP]: 'Stewardship proposal',
  [ITEM.DRAFT]: 'Project draft',
  [ITEM.TASK]: 'Continuation task',
  [ITEM.PENDING]: 'Pending removal',
  [ITEM.RECEIPT]: 'Removal receipt',
  [ITEM.DEMO_DATA]: 'Demo records',
}

export const ZONE = {
  SAVE: 'save-to-desk',
  STATUS_DRAFTED: 'status-drafted',
  STATUS_PLANNING: 'status-planning',
  STATUS_WORKING: 'status-working',
  STATUS_ARCHIVED: 'status-archived',
  HELP: 'offer-help',
  STEWARDSHIP: 'take-stewardship',
  ADD_PLAN: 'add-plan-to-desk',
  PUBLISH: 'publish-to-archive',
  UPDATE_PLAN: 'update-plan',
  REMOVE: 'remove-from-desk',
  DISCARD: 'discard-project',
  COMPLETED: 'completed',
  REOPEN: 'reopen-task',
  CONFIRM_REMOVAL: 'confirm-removal',
  RESTORE: 'restore-records',
  RESET: 'reset-demo',
}

/**
 * The registry. `accepts` is the contract used both for highlighting during a
 * drag and for rejecting an invalid drop.
 */
export const ACTION_ZONES = [
  {
    id: ZONE.SAVE,
    label: 'Save to Revival Desk',
    shortLabel: 'Save',
    accepts: [ITEM.PROJECT],
    itemHint: 'Archive project',
    description: 'Drop an unfinished project here to keep it on your personal desk.',
    acceptsLabel: 'Unfinished archives',
    tone: 'paper',
  },
  {
    id: ZONE.HELP,
    label: 'Offer to help',
    shortLabel: 'Offer help',
    accepts: [ITEM.PROJECT],
    itemHint: 'Archive project',
    description: 'Opens a contribution composer. Nothing is sent to the owner.',
    acceptsLabel: 'Unfinished archives',
    tone: 'paper',
  },
  {
    id: ZONE.STEWARDSHIP,
    label: 'Take stewardship',
    shortLabel: 'Stewardship',
    accepts: [ITEM.PROJECT],
    itemHint: 'Archive project',
    description: 'Prepare a proposal to continue the work, subject to the creator agreeing.',
    acceptsLabel: 'Unfinished archives',
    tone: 'paper',
  },
  /* ---- Plan status destinations (Zone J) -------------------------------
     A revival plan's persistent status is changed by dropping the plan card
     into one of these. The card itself never mutates state on click. */
  {
    id: ZONE.STATUS_DRAFTED,
    label: 'Drafted',
    shortLabel: 'Drafted',
    statusId: 'drafted',
    group: 'status',
    accepts: [ITEM.PLAN],
    itemHint: 'Revival plan',
    description: 'Mark this plan as drafted — captured, not yet being planned.',
    acceptsLabel: 'Plans only',
    tone: 'paper',
  },
  {
    id: ZONE.STATUS_PLANNING,
    label: 'Planning',
    shortLabel: 'Planning',
    statusId: 'planning',
    group: 'status',
    accepts: [ITEM.PLAN],
    itemHint: 'Revival plan',
    description: 'Mark this plan as planning — you are working out the next steps.',
    acceptsLabel: 'Plans only',
    tone: 'paper',
  },
  {
    id: ZONE.STATUS_WORKING,
    label: 'Working locally',
    shortLabel: 'Working',
    statusId: 'working',
    group: 'status',
    accepts: [ITEM.PLAN],
    itemHint: 'Revival plan',
    description: 'Mark this plan as in progress in your own workspace.',
    acceptsLabel: 'Plans only',
    tone: 'paper',
  },
  {
    id: ZONE.STATUS_ARCHIVED,
    label: 'Archived',
    shortLabel: 'Archive',
    statusId: 'archived',
    group: 'status',
    accepts: [ITEM.PLAN],
    itemHint: 'Revival plan',
    description: 'Move this plan into the archived shelf of your desk.',
    acceptsLabel: 'Plans only',
    tone: 'paper',
  },
  {
    id: ZONE.ADD_PLAN,
    label: 'Add plan to desk',
    shortLabel: 'Add plan',
    accepts: [ITEM.CONTRIBUTION, ITEM.STEWARDSHIP],
    itemHint: 'Prepared intent card',
    description: 'Commit a prepared contribution intent or stewardship proposal to your desk.',
    acceptsLabel: 'Ready intent cards',
    tone: 'accent',
  },
  {
    id: ZONE.PUBLISH,
    label: 'Publish to archive',
    shortLabel: 'Publish',
    accepts: [ITEM.DRAFT],
    itemHint: 'Completed project draft',
    description: 'Adds your draft to this browser’s local RE demo archive.',
    acceptsLabel: 'Valid project drafts',
    tone: 'accent',
  },
  {
    id: ZONE.UPDATE_PLAN,
    label: 'Update plan',
    shortLabel: 'Update plan',
    accepts: [ITEM.PLAN_DRAFT],
    itemHint: 'Edited plan card',
    description: 'Save the edits carried by the dropped plan card, keeping its plan ID.',
    acceptsLabel: 'Edited plan cards',
    tone: 'paper',
  },
  {
    id: ZONE.REMOVE,
    label: 'Remove from desk',
    shortLabel: 'Remove',
    accepts: [ITEM.SAVED_PROJECT, ITEM.PLAN],
    itemHint: 'Saved project or plan',
    description: 'Starts a two-step removal. The archive project itself is never deleted.',
    acceptsLabel: 'Personal items',
    tone: 'danger',
  },
  {
    id: ZONE.DISCARD,
    label: 'Discard project',
    shortLabel: 'Discard',
    accepts: [ITEM.LOCAL_PROJECT],
    itemHint: 'A project you created',
    description: 'Starts a two-step discard of a project you published locally.',
    acceptsLabel: 'Your own projects',
    tone: 'danger',
  },
  {
    id: ZONE.COMPLETED,
    label: 'Completed',
    shortLabel: 'Complete',
    accepts: [ITEM.TASK],
    itemHint: 'Unfinished task',
    description: 'Marks a continuation task done and updates the plan’s progress.',
    acceptsLabel: 'Open tasks',
    tone: 'paper',
  },
  {
    id: ZONE.REOPEN,
    label: 'Reopen task',
    shortLabel: 'Reopen',
    accepts: [ITEM.TASK],
    itemHint: 'Completed task',
    description: 'Returns a finished task to the active checklist.',
    acceptsLabel: 'Completed tasks',
    tone: 'paper',
  },
  {
    id: ZONE.CONFIRM_REMOVAL,
    label: 'Confirm removal',
    shortLabel: 'Confirm',
    accepts: [ITEM.PENDING],
    itemHint: 'Pending removal card',
    description: 'The second step. Removes exactly the item named on the card, and keeps a receipt.',
    acceptsLabel: 'Pending removal cards',
    tone: 'danger',
  },
  /* ---- Recovery -------------------------------------------------------
     Removal is reversible only through this zone: drop the receipt the
     removal produced and the snapshot is written back, IDs intact. */
  {
    id: ZONE.RESTORE,
    label: 'Restore',
    shortLabel: 'Restore',
    accepts: [ITEM.RECEIPT],
    itemHint: 'Removal receipt',
    group: 'recovery',
    description: 'Drop a receipt from Recently removed to write that record back exactly as it was.',
    acceptsLabel: 'Live removal receipts',
    tone: 'paper',
  },
  {
    id: ZONE.RESET,
    label: 'Reset demo data',
    shortLabel: 'Reset',
    accepts: [ITEM.DEMO_DATA],
    itemHint: 'Demo records card',
    description: 'Starts a two-step reset of RE’s local storage keys only.',
    acceptsLabel: 'Demo records card',
    tone: 'danger',
  },
]

export const ZONES_BY_ID = ACTION_ZONES.reduce((acc, zone) => {
  acc[zone.id] = zone
  return acc
}, {})

export function getZone(zoneId) {
  return ZONES_BY_ID[zoneId] || null
}

/** Droppable ids are namespaced so a zone can be rendered in several places. */
export function zoneDroppableId(zoneId, instance) {
  return `${zoneId}::${instance}`
}

export function baseZoneId(droppableId) {
  if (typeof droppableId !== 'string') return null
  return droppableId.split('::')[0]
}

/**
 * Can this card be dropped into this zone right now?
 * Type compatibility plus the small amount of state a zone depends on.
 */
export function zoneAccepts(zoneId, item) {
  const zone = getZone(zoneId)
  if (!zone || !item || !zone.accepts.includes(item.type)) return false

  switch (zoneId) {
    case ZONE.STEWARDSHIP:
      return item.type === ITEM.PROJECT && item.stewardable !== false
    case ZONE.COMPLETED:
      return item.type === ITEM.TASK && !item.done
    case ZONE.REOPEN:
      return item.type === ITEM.TASK && Boolean(item.done)
    case ZONE.ADD_PLAN:
      return Boolean(item.valid)
    case ZONE.PUBLISH:
      return Boolean(item.valid)
    case ZONE.UPDATE_PLAN:
      return Boolean(item.valid)
    case ZONE.STATUS_DRAFTED:
    case ZONE.STATUS_PLANNING:
    case ZONE.STATUS_WORKING:
    case ZONE.STATUS_ARCHIVED:
      return item.type === ITEM.PLAN && Boolean(item.planId) && item.status !== zone.statusId
    case ZONE.RESTORE:
      return (
        item.type === ITEM.RECEIPT &&
        Boolean(item.removalId) &&
        item.restorable !== false &&
        item.expired !== true
      )
    default:
      return true
  }
}

export const STATUS_ZONE_IDS = ACTION_ZONES.filter((zone) => zone.group === 'status').map(
  (zone) => zone.id,
)

/** Zones that accept a given card, in registry order. */
export function zonesForItem(item) {
  return ACTION_ZONES.filter((zone) => zoneAccepts(zone.id, item))
}

/** The zones worth showing at rest, per route. */
export function restingZoneIds(
  pathname,
  { composerOpen = false, pendingRemoval = false, restorable = 0 } = {},
) {
  if (pendingRemoval) return [ZONE.CONFIRM_REMOVAL]

  if (composerOpen) {
    return composerOpen === 'edit-plan' ? [ZONE.UPDATE_PLAN] : [ZONE.ADD_PLAN]
  }

  if (pathname === '/desk') {
    return [
      ...STATUS_ZONE_IDS,
      ZONE.REMOVE,
      ZONE.COMPLETED,
      ZONE.REOPEN,
      // Only offered when there is genuinely something to restore.
      ...(restorable > 0 ? [ZONE.RESTORE] : []),
    ]
  }
  if (pathname === '/submit') return [ZONE.PUBLISH]
  return [ZONE.SAVE, ZONE.HELP, ZONE.STEWARDSHIP]
}

export function rejectionMessage(zoneId, item) {
  const zone = getZone(zoneId)
  if (!zone) return 'That drop did not land in an action zone.'
  if (!item) return 'That card could not be read, so nothing changed.'

  if (zoneId === ZONE.PUBLISH) return 'This project draft needs every required field before it can be published.'
  if (zoneId === ZONE.ADD_PLAN) return 'This intent card is not complete yet, so no plan was added.'
  if (zoneId === ZONE.UPDATE_PLAN) return 'These edits are not valid yet, so the plan was left as it was.'
  if (zoneId === ZONE.STEWARDSHIP)
    return 'This project is not open to stewardship, so no proposal was prepared.'
  if (STATUS_ZONE_IDS.includes(zoneId)) {
    const label = getZone(zoneId)?.label || 'that status'
    return `This plan is already marked as ${label.toLowerCase()}, so nothing changed.`
  }
  if (zoneId === ZONE.COMPLETED) return 'That task is already complete. Use Reopen task instead.'
  if (zoneId === ZONE.REOPEN) return 'That task is already open, so there is nothing to reopen.'
  if (zoneId === ZONE.DISCARD) return 'That card cannot be discarded here. Only projects you created locally can be discarded.'
  if (zoneId === ZONE.CONFIRM_REMOVAL) return 'There is no matching pending removal, so nothing was deleted.'
  if (zoneId === ZONE.RESTORE)
    return 'This receipt cannot be restored — it may have expired, already been used, or its records may already be back.'

  if (item.type === ITEM.PROJECT) {
    return `This project cannot go into “${zone.label}”. Try Save, Offer help, or Take stewardship.`
  }
  return `That card does not belong in “${zone.label}”. Nothing was changed.`
}
