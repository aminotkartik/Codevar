import { useState } from 'react'
import { useDndContext } from '@dnd-kit/core'
import { useRouter, matchRoute } from '../../app/router'
import { useRE } from '../../context/REContext'
import {
  ACTION_ZONES,
  ITEM_LABELS,
  getZone,
  restingZoneIds,
  zonesForItem,
} from '../../dnd/zones'
import { validateRestore } from '../../utils/removals'
import { Portal } from '../ui/Portal'
import { ActionZone } from './ActionZone'
import { ChevronDown, Grip } from '../ui/Icons'

/**
 * ActionZoneDock — the tool tray for the worktable.
 *
 * At rest it offers the operations that make sense on this screen. During a
 * drag it narrows to exactly the zones that accept the card in hand, so a card
 * can never be dropped somewhere meaningless. Status zones sit in their own
 * compact row so the dock stays balanced rather than becoming a wall of boxes.
 */
export function ActionZoneDock() {
  const { active } = useDndContext()
  const { pathname } = useRouter()
  const { composer, pendingRemoval, prefs, removals, saved, plans, projectsById, projectsBySlug } =
    useRE()
  const [expanded, setExpanded] = useState(false)

  if (!prefs.onboarded) return null
  if (matchRoute(pathname).name === 'notfound') return null

  const activeItem = active?.data?.current?.item || null
  const compatibleIds = activeItem ? zonesForItem(activeItem).map((zone) => zone.id) : null
  // Only receipts that could actually be written back earn a Restore zone.
  const restorableCount = removals.filter(
    (receipt) => validateRestore(receipt, { saved, plans, projectsById, projectsBySlug }).ok,
  ).length
  const restingIds = restingZoneIds(pathname, {
    composerOpen: composer?.kind,
    pendingRemoval: Boolean(pendingRemoval),
    restorable: restorableCount,
  })
  const zoneIds = compatibleIds ?? (expanded ? ACTION_ZONES.map((zone) => zone.id) : restingIds)

  const statusIds = zoneIds.filter((id) => getZone(id)?.group === 'status')
  const otherIds = zoneIds.filter((id) => getZone(id)?.group !== 'status')

  const dragging = Boolean(activeItem)

  // One line that tells the visitor exactly where they are, without repeating.
  let screenNote = 'Open a project card from the archive to act on it.'
  if (pathname === '/desk') screenNote = 'Statuses, removal and task completion for your own desk.'
  else if (pathname === '/explore') screenNote = 'Save, offer help or propose stewardship for an archive entry.'
  else if (pathname === '/submit') screenNote = 'Publish your completed draft card into the local archive.'
  else if (pathname.startsWith('/projects/')) screenNote = 'Drag the project card above into a zone.'
  if (pathname === '/desk' && restorableCount > 0 && !pendingRemoval) {
    screenNote += ` ${restorableCount} removal${restorableCount === 1 ? '' : 's'} can still be restored.`
  }
  if (pendingRemoval) screenNote += ' A removal is waiting for confirmation.'
  if (composer?.kind === 'edit-plan') screenNote = 'Drop the edited plan card into Update plan.'

  return (
    <Portal>
      <section
        className="action-dock"
        data-dragging={dragging ? 'true' : 'false'}
        data-zones={zoneIds.length}
        aria-label="Action zones"
      >
        <div className="action-dock__head">
          <span className="action-dock__title">
            <Grip width={13} height={13} aria-hidden="true" />
            {dragging ? 'Choose a destination' : 'Action zones'}
          </span>
          <p className="action-dock__note" aria-live="off">
            {dragging
              ? `${ITEM_LABELS[activeItem.type] || 'Card'} “${activeItem.label}” is in hand — ${
                  zoneIds.length
                } ${zoneIds.length === 1 ? 'zone accepts it' : 'zones accept it'}.`
              : 'Pick up a card by its grip, then drop it into a zone. Keyboard: Space to lift, arrows to choose, Space to drop.'}
          </p>
          <button
            type="button"
            className="action-dock__toggle"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            disabled={dragging}
          >
            {expanded ? 'Fewer zones' : `All ${ACTION_ZONES.length} zones`}
            <ChevronDown
              width={13}
              height={13}
              style={{ transform: expanded ? 'rotate(180deg)' : undefined }}
            />
          </button>
        </div>

        {zoneIds.length > 0 ? (
          <div className="action-dock__rail">
            {otherIds.length > 0 && (
              <div className="action-dock__zones" data-count={otherIds.length}>
                {otherIds.map((zoneId) => (
                  <ActionZone key={zoneId} zoneId={zoneId} />
                ))}
              </div>
            )}

            {statusIds.length > 0 && (
              <div className="action-dock__status" role="group" aria-label="Plan status zones">
                <span className="action-dock__status-label">
                  Plan status
                  <small>drag a plan card onto one</small>
                </span>
                <div className="action-dock__status-zones">
                  {statusIds.map((zoneId) => (
                    <ActionZone key={zoneId} zoneId={zoneId} variant="chip" />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="action-dock__empty">
            No Action Zone accepts that card on this screen. Press Escape or drop it back
            where it came from — nothing will change.
          </p>
        )}

        {!dragging && (
          <p className="action-dock__foot">
            <span className="mono">This screen</span>
            <span>{screenNote}</span>
          </p>
        )}
      </section>
    </Portal>
  )
}
