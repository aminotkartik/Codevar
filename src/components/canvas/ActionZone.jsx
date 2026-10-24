import { useId } from 'react'
import { useDndContext, useDroppable } from '@dnd-kit/core'
import { getZone, zoneAccepts, zoneDroppableId, ZONE } from '../../dnd/zones'
import {
  ArchiveBox,
  ArrowLeft,
  Bookmark,
  Check,
  Edit,
  HandoffArrow,
  Layers,
  Pen,
  Plus,
  Trash,
  Users,
} from '../ui/Icons'

const ZONE_ICONS = {
  [ZONE.SAVE]: Bookmark,
  [ZONE.HELP]: HandoffArrow,
  [ZONE.STEWARDSHIP]: Users,
  [ZONE.ADD_PLAN]: Plus,
  [ZONE.UPDATE_PLAN]: Edit,
  [ZONE.REMOVE]: Trash,
  [ZONE.DISCARD]: Trash,
  [ZONE.COMPLETED]: Check,
  [ZONE.REOPEN]: ArrowLeft,
  [ZONE.CONFIRM_REMOVAL]: Check,
  [ZONE.RESET]: Trash,
  [ZONE.STATUS_DRAFTED]: Pen,
  [ZONE.STATUS_PLANNING]: Layers,
  [ZONE.STATUS_WORKING]: HandoffArrow,
  [ZONE.STATUS_ARCHIVED]: ArchiveBox,
}

/**
 * ActionZone — a named receiving area.
 *
 * It is deliberately not a button: the only way to activate it is to release a
 * compatible card over it. `data-over`, `data-compatible` and `data-active`
 * drive every visual state, so a drop target never looks like a control.
 */
export function ActionZone({ zoneId, variant = 'dock' }) {
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

  const Icon = ZONE_ICONS[zoneId] || Plus
  const dropping = Boolean(isOver && activeItem && compatible)
  const chip = variant === 'chip'

  return (
    <div
      ref={setNodeRef}
      className={`action-zone action-zone--${variant}${chip ? ' action-zone--chip' : ''}`}
      data-zone={zoneId}
      data-tone={zone.tone}
      data-active={activeItem ? 'true' : 'false'}
      data-compatible={activeItem ? String(compatible) : undefined}
      data-over={dropping ? 'true' : undefined}
      role="region"
      aria-label={`${zone.label}. ${zone.description}`}
      title={chip ? `${zone.label} — ${zone.description}` : undefined}
    >
      <span className="action-zone__icon" aria-hidden="true">
        <Icon width={chip ? 13 : 16} height={chip ? 13 : 16} />
      </span>

      <span className="action-zone__body">
        <span className="action-zone__label">{chip ? zone.shortLabel || zone.label : zone.label}</span>
        {!chip && (
          <>
            <span className="action-zone__hint">
              {activeItem && compatible
                ? `Release “${activeItem.label}” here.`
                : zone.description}
            </span>
            <span className="action-zone__accepts">Accepts: {zone.acceptsLabel}</span>
          </>
        )}
      </span>

      {dropping && (
        <span className="action-zone__status action-zone__status--go">
          {chip ? 'Drop' : 'Release to drop'}
        </span>
      )}
      {!chip && activeItem && !compatible && (
        <span className="action-zone__status">Not this card</span>
      )}
    </div>
  )
}
