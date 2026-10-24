import { useDraggable } from '@dnd-kit/core'
import { Grip } from '../ui/Icons'

/**
 * DraggableDataCard — the shell every movable object shares.
 *
 * The grip is the only drag activator, so tapping the card body never starts
 * a drag by accident. A disabled card shows why it cannot be moved yet.
 */
export function DraggableDataCard({
  dragId,
  item,
  disabled = false,
  className = '',
  selected = false,
  children,
  gripLabel,
  disabledNote = 'Not ready to drag',
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { item },
    disabled,
  })

  return (
    <article
      ref={setNodeRef}
      className={`data-card${className ? ` ${className}` : ''}`}
      data-dragging={isDragging}
      data-draggable={!disabled}
      data-disabled={disabled}
      data-selected={selected ? 'true' : undefined}
    >
      <div className="data-card__handle-row">
        {disabled ? (
          <span className="drag-grip drag-grip--disabled" aria-hidden="true">
            <Grip width={14} height={14} />
            <span>{disabledNote}</span>
          </span>
        ) : (
          <button
            type="button"
            className="drag-grip"
            {...listeners}
            {...attributes}
            aria-label={gripLabel || `Drag “${item.label}” to an action zone`}
            title="Drag this card into an Action Zone"
          >
            <Grip width={14} height={14} />
            <span>Drag</span>
          </button>
        )}
      </div>
      {children}
    </article>
  )
}
