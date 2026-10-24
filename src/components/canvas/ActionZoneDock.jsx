import { useState } from 'react'
import { useDndContext } from '@dnd-kit/core'
import { useRouter, matchRoute } from '../../app/router'
import { useRE } from '../../context/REContext'
import { ACTION_ZONES, restingZoneIds, zonesForItem } from '../../dnd/zones'
import { Portal } from '../ui/Portal'
import { ActionZone } from './ActionZone'
import { ChevronDown, Grip } from '../ui/Icons'

/**
 * ActionZoneDock — the context-aware destination rail.
 *
 * At rest it offers the operations that make sense on this screen. During a
 * drag it narrows to exactly the zones that accept the card in hand, so a
 * card can never be dropped somewhere meaningless.
 */
export function ActionZoneDock() {
  const { active } = useDndContext()
  const { pathname } = useRouter()
  const { composer, pendingRemoval, prefs } = useRE()
  const [expanded, setExpanded] = useState(false)

  if (!prefs.onboarded) return null
  if (matchRoute(pathname).name === 'notFound') return null

  const activeItem = active?.data?.current?.item || null
  const compatibleIds = activeItem ? zonesForItem(activeItem).map((zone) => zone.id) : null
  const restingIds = restingZoneIds(pathname, {
    composerOpen: composer?.kind,
    pendingRemoval: Boolean(pendingRemoval),
  })
  const zoneIds = compatibleIds ?? (expanded ? ACTION_ZONES.map((zone) => zone.id) : restingIds)

  return (
    <Portal>
      <section
        className="action-dock"
        data-dragging={activeItem ? 'true' : 'false'}
        aria-label="Action zones"
      >
        <div className="action-dock__head">
          <span className="action-dock__title">
            <Grip width={13} height={13} aria-hidden="true" />
            {activeItem ? 'Choose a destination' : 'Action zones'}
          </span>
          <p className="action-dock__note" aria-live="off">
            {activeItem
              ? `“${activeItem.label}” is in hand. Only zones that accept it are shown.`
              : 'Pick up a card by its grip, then drop it into a zone. Keyboard: Space to lift, arrows to choose, Space to drop.'}
          </p>
          <button
            type="button"
            className="action-dock__toggle"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            disabled={Boolean(activeItem)}
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
          <div className="action-dock__zones" data-count={zoneIds.length}>
            {zoneIds.map((zoneId) => (
              <ActionZone key={zoneId} zoneId={zoneId} />
            ))}
          </div>
        ) : (
          <p className="action-dock__empty">
            No Action Zone accepts that card on this screen. Press Escape or drop it back
            where it came from — nothing will change.
          </p>
        )}
      </section>
    </Portal>
  )
}
