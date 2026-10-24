import { useEffect, useRef } from 'react'
import { useRE } from '../../context/REContext'
import { ZONE } from '../../dnd/zones'
import { Portal } from '../ui/Portal'
import { ActionZone } from './ActionZone'
import { PendingRemovalCard } from './PendingRemovalCard'
import { Close, Info } from '../ui/Icons'

/**
 * Zones G, H and the demo reset — staged destructive actions.
 *
 * The first drag creates the pending card. Nothing is deleted until that card
 * is dropped into Confirm removal. Cancel is always available and never
 * destructive.
 */
export function RemovalPanel() {
  const { pendingRemoval, clearPendingRemoval } = useRE()
  const ref = useRef(null)

  useEffect(() => {
    if (!pendingRemoval) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') clearPendingRemoval()
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [pendingRemoval, clearPendingRemoval])

  if (!pendingRemoval) return null

  return (
    <Portal>
      <aside
        className="removal-panel"
        role="region"
        aria-label="Pending removal"
        ref={ref}
      >
        <header className="removal-panel__head">
          <span className="removal-panel__title">
            <Info width={14} height={14} />
            Nothing removed yet
          </span>
          <button
            type="button"
            className="icon-btn icon-btn--sm"
            onClick={clearPendingRemoval}
            aria-label="Cancel this removal"
          >
            <Close width={14} height={14} />
          </button>
        </header>

        <p className="removal-panel__text">
          {pendingRemoval.detail} Drop the card below into <b>Confirm removal</b> to go ahead,
          or cancel and the original stays exactly as it was.
        </p>

        <PendingRemovalCard
          removal={pendingRemoval}
          dragId={`pending-${pendingRemoval.token}`}
        />

        <ActionZone zoneId={ZONE.CONFIRM_REMOVAL} variant="inline" />

        <button type="button" className="btn btn--sm btn--block" onClick={clearPendingRemoval}>
          Cancel — keep it
        </button>
      </aside>
    </Portal>
  )
}
