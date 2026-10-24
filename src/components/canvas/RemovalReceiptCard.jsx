import { DraggableDataCard } from './DraggableDataCard'
import { removalItem } from '../../dnd/items'
import {
  REMOVAL_KINDS,
  REMOVAL_TTL_HOURS,
  describeRemoval,
  recoveryWindowLabel,
  restoreSummary,
  isExpired,
} from '../../utils/removals'
import { formatDate } from '../../utils/format'
import { Clock, Restore } from '../ui/Icons'

function removedWhen(receipt) {
  const at = new Date(receipt.removedAt)
  if (Number.isNaN(at.getTime())) return 'time unknown'
  const minutes = Math.round((Date.now() - at.getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  return formatDate(receipt.removedAt)
}

/**
 * RemovalReceiptCard — the typed proof that something was removed.
 *
 * It is not a button and it cannot restore anything by itself: dropping the
 * card into Restore is the only way back. When a receipt can no longer be
 * honoured (expired, already restored, or its project is gone) the card says so
 * and stops being draggable rather than failing silently on the drop.
 */
export function RemovalReceiptCard({ receipt, verdict }) {
  const expired = isExpired(receipt)
  const restorable = Boolean(verdict?.ok) && !expired
  const kind = REMOVAL_KINDS[receipt.kind] || REMOVAL_KINDS.saved
  const planCount = receipt.kind === 'project' ? receipt.snapshot?.plans?.length || 0 : 0

  const item = removalItem(receipt, { restorable, expired })

  return (
    <DraggableDataCard
      dragId={`receipt-${receipt.id}`}
      item={item}
      className="receipt-card"
      disabled={!restorable}
      disabledNote={expired ? 'Expired' : 'Not restorable'}
      gripLabel={`Drag the removal receipt for ${receipt.label} into Restore`}
    >
      <div className="receipt-card__body" data-expired={expired ? 'true' : undefined}>
        <div className="receipt-card__head">
          <span className="receipt-card__kind">{kind.label}</span>
          <span className="receipt-card__spacer" />
          <span className="receipt-card__window" data-expired={expired ? 'true' : undefined}>
            <Clock width={12} height={12} aria-hidden="true" />
            {recoveryWindowLabel(receipt)}
          </span>
        </div>

        <h3 className="receipt-card__title">{receipt.label}</h3>

        <p className="receipt-card__what">
          {`Removed ${removedWhen(receipt)} — ${describeRemoval(receipt)}.`}
          {planCount > 0 ? ` All ${planCount} plan${planCount === 1 ? '' : 's'} are in this snapshot.` : ''}
        </p>

        {restorable ? (
          <>
            <p className="receipt-card__how">
              <Restore width={13} height={13} aria-hidden="true" />
              <span>
                Drop this receipt into <b>Restore</b> to bring it back. {restoreSummary(receipt)}
              </span>
            </p>
            <p className="receipt-card__policy">
              Kept for {REMOVAL_TTL_HOURS} hours, or until five newer removals push it out.
            </p>
          </>
        ) : (
          <p className="receipt-card__blocked" role="note">
            {expired
              ? `The ${REMOVAL_TTL_HOURS}-hour window has closed, so the snapshot is gone. This cannot be restored.`
              : verdict?.reason || 'This receipt cannot be restored.'}
          </p>
        )}
      </div>
    </DraggableDataCard>
  )
}
