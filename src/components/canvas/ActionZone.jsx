import { useId } from 'react'
import { useDndContext, useDroppable } from '@dnd-kit/core'
import {
  getZone,
  zoneAccepts,
  zoneDroppableId,
  ZONE,
} from '../../dnd/zones'
import {
  ArchiveBox,
  ArrowLeft,
  Bookmark,
  Check,
  Edit,
  HandoffArrow,
  Plus,
  Trash,
  Users,
  Zone as ZoneIcon,
} from '../ui/Icons'

const ZONE_ICONS = {
  [ZONE.SAVE]: Bookmark,
  [ZONE.HELP]: HandoffArrow,
  [ZONE.STEWARDSHIP]: Users,
  [ZONE.ADD_PLAN]: Plus,
  [ZONE.PUBLISH]: ArchiveBox,
  [ZONE.UPDATE_PLAN]: Edit,
  [ZONE.REMOVE]: Trash,
  [ZONE.DISCARD]: Trash,
  [ZONE.COMPLETED]: Check,
  [ZONE.REOPEN]: ArrowLeft,
  [ZONE.CONFIRM_REMOVAL]: Check,
  [ZONE.RESET]: Trash,
}

/**
 * ActionZone — a named drop target.
 *
 * It is deliberately not a button: the only way to activate it is to release
 * a compatible card over it. `data-over`, `data-compatible` and
 * `data-active` drive every visual state.
 */
export function ActionZone({ zoneId, variant = 'dock', compact = false, className = '' }) {
  const instanceId = useId()
  const zone = getZone(zoneId)
  const { active } = useDndContext()
  const activeItem = active?.data?.current?.item || null

  const compatible = activeItem ? zoneAccepts(zoneId, activeItem) : true
  const { setNodeRef, isOver } = useDroppable({
    id: zoneDroppableId(zoneId, instanceId),
    data: { zoneId },
    disabled: Boolean(activeItem && !compatible),
  })

  if (!zone) return null

  const Icon = ZONE_ICONS[zoneId] || ZoneIcon
  const dropping = Boolean(isOver && activeItem && compatible)

  return (
    <div
      ref={setNodeRef}
      className={`action-zone action-zone--${variant}${compact ? ' action-zone--compact' : ''}${
        className ? ` ${className}` : ''
      }`}
      data-zone={zoneId}
      data-tone={zone.tone}
      data-active={activeItem ? 'true' : 'false'}
      data-compatible={activeItem ? String(compatible) : undefined}
      data-over={dropping ? 'true' : undefined}
      role="region"
      aria-label={`${zone.label}. ${zone.description}`}
    >
      <span className="action-zone__icon" aria-hidden="true">
        <Icon width={16} height={16} />
      </span>

      <span className="action-zone__body">
        <span className="action-zone__label">{zone.label}</span>
        {!compact && (
          <span className="action-zone__hint">
            {activeItem && compatible
              ? `Release “${activeItem.label}” to ${zone.label.toLowerCase()}.`
              : zone.description}
          </span>
        )}
        {!compact && <span className="action-zone__accepts">Accepts: {zone.acceptsLabel}</span>}
      </span>

      {activeItem && !compatible && (
        <span className="action-zone__status">Not this card</span>
      )}
      {dropping && <span className="action-zone__status action-zone__status--go">Release to drop</span>}
    </div>
  )
}
