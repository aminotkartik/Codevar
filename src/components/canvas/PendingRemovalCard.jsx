import { pendingItem } from '../../dnd/items'
import { DraggableDataCard } from './DraggableDataCard'
import { Trash } from '../ui/Icons'

/** The item named on a staged removal. Dropping this card is the confirmation. */
export function PendingRemovalCard({ removal, dragId }) {
  const item = pendingItem(removal)
  const isReset = removal.kind === 'demo'

  return (
    <DraggableDataCard
      dragId={dragId}
      item={item}
      className="pending-card"
      gripLabel={`Drag the pending removal card for ${removal.label} into Confirm removal`}
    >
      <div className="pending-card__body">
        <span className="pending-card__stamp">
          <Trash width={13} height={13} />
          Pending {isReset ? 'reset' : removal.kind === 'plan' ? 'plan removal' : 'removal'}
        </span>
        <strong className="pending-card__title">{removal.label}</strong>
        <p className="pending-card__detail">{removal.detail}</p>
        <span className="pending-card__hint">Drag into Confirm removal</span>
      </div>
    </DraggableDataCard>
  )
}
