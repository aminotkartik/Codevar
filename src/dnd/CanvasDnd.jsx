import { useCallback, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useRE } from '../context/REContext'
import { ITEM_LABELS, baseZoneId, getZone, zoneAccepts, zonesForItem } from './zones'
import { Grip } from '../components/ui/Icons'

/**
 * Keyboard drag coordinates.
 *
 * Instead of nudging a card 25px at a time, arrow keys jump the card between
 * the Action Zones that actually accept it. Space/Enter drops it, Escape
 * cancels. This is what makes the canvas usable without a pointer.
 */
function zoneKeyboardCoordinates(event, { active, context, currentCoordinates }) {
  const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
  if (!arrowKeys.includes(event.code)) return undefined

  const item = active?.data?.current?.item
  const rects = context?.droppableRects
  const containers = context?.droppableContainers
  const collisionRect = context?.collisionRect
  if (!rects || !containers || !collisionRect) return undefined

  const candidates = containers
    .getEnabled()
    .map((container) => {
      const zoneId = baseZoneId(container.data?.current?.zoneId || container.id)
      return { zoneId, rect: rects.get(container.id) }
    })
    .filter((entry) => entry.rect && zoneAccepts(entry.zoneId, item))

  if (candidates.length === 0) return undefined

  const ordered = [...candidates].sort(
    (a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left,
  )

  const centerX = collisionRect.left + collisionRect.width / 2
  const centerY = collisionRect.top + collisionRect.height / 2

  let currentIndex = 0
  let closest = Infinity
  ordered.forEach((entry, index) => {
    const dx = entry.rect.left + entry.rect.width / 2 - centerX
    const dy = entry.rect.top + entry.rect.height / 2 - centerY
    const distance = dx * dx + dy * dy
    if (distance < closest) {
      closest = distance
      currentIndex = index
    }
  })

  // If the card is already sitting on a zone, that nearest centre *is* the
  // current target; otherwise start from the first zone.
  const onTarget = closest < 60 * 60
  const baseIndex = onTarget ? currentIndex : -1
  const forward = event.code === 'ArrowRight' || event.code === 'ArrowDown'
  const step = forward ? 1 : -1
  const nextIndex =
    baseIndex === -1
      ? forward
        ? 0
        : ordered.length - 1
      : (baseIndex + step + ordered.length) % ordered.length

  const target = ordered[nextIndex].rect
  return {
    x: target.left + target.width / 2 - collisionRect.width / 2,
    y: target.top + target.height / 2 - collisionRect.height / 2,
  }
}

const screenReaderInstructions = {
  draggable:
    'Press Space or Enter on a drag grip to pick up a card. Use the arrow keys to move between the Action Zones that accept it. Press Space or Enter to drop, or Escape to cancel.',
}

function DragGhost({ item }) {
  const zoneNames = zonesForItem(item)
    .map((zone) => zone.label)
    .join(', ')

  return (
    <div className="drag-ghost">
      <div className="drag-ghost__top">
        <span className="drag-ghost__grip" aria-hidden="true">
          <Grip width={13} height={13} />
        </span>
        <span className="drag-ghost__type">{ITEM_LABELS[item.type] || 'Card'}</span>
      </div>
      <strong className="drag-ghost__title">{item.label}</strong>
      {item.meta && <span className="drag-ghost__meta">{item.meta}</span>}
      <span className="drag-ghost__hint">
        {zoneNames ? `Drop into: ${zoneNames}` : 'No Action Zone accepts this card here.'}
      </span>
    </div>
  )
}

/**
 * CanvasDndProvider — one shared drag context for the whole application.
 * Cards and zones on every screen talk to the same sensors, the same overlay
 * and the same dispatcher.
 */
export function CanvasDndProvider({ children }) {
  const { performDrop } = useRE()
  const [activeItem, setActiveItem] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: zoneKeyboardCoordinates }),
  )

  const collisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) return pointerCollisions
    return rectIntersection(args)
  }, [])

  const announcements = useMemo(
    () => ({
      onDragStart({ active }) {
        const item = active.data.current?.item
        const zones = item ? zonesForItem(item) : []
        return `${item?.label || 'Card'} picked up. ${
          zones.length
            ? `Available zones: ${zones.map((z) => z.label).join(', ')}.`
            : 'No zone accepts this card here.'
        } Use the arrow keys to choose a zone, space to drop, escape to cancel.`
      },
      onDragOver({ active, over }) {
        if (!over) return 'No Action Zone under the card.'
        const zoneId = baseZoneId(over.data?.current?.zoneId || over.id)
        const zone = getZone(zoneId)
        const item = active.data.current?.item
        const accepted = zoneAccepts(zoneId, item)
        const name = zone?.label || 'Action Zone'
        return accepted
          ? `Over ${name}. Drop to ${name.toLowerCase()}.`
          : `${name} does not accept this card.`
      },
      onDragEnd({ active, over }) {
        if (!over) return 'Card returned to its place. Nothing changed.'
        const zone = getZone(baseZoneId(over.data?.current?.zoneId || over.id))
        return `${active.data.current?.item?.label || 'Card'} dropped into ${
          zone?.label || 'an Action Zone'
        }.`
      },
      onDragCancel({ active }) {
        return `Drag cancelled. ${active.data.current?.item?.label || 'The card'} was returned and nothing changed.`
      },
    }),
    [],
  )

  const handleDragStart = useCallback((event) => {
    const item = event.active?.data?.current?.item || null
    setActiveItem(item ? { ...item, _id: String(event.active.id) } : null)
    if (item) document.body.dataset.dragging = item.type
  }, [])

  const handleDragEnd = useCallback(
    (event) => {
      delete document.body.dataset.dragging
      setActiveItem(null)
      const { active, over } = event
      if (!over) return
      const item = active.data.current?.item
      const zoneId = over.data?.current?.zoneId || baseZoneId(over.id)
      performDrop(item, zoneId)
    },
    [performDrop],
  )

  const handleDragCancel = useCallback(() => {
    delete document.body.dataset.dragging
    setActiveItem(null)
  }, [])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={null} zIndex={400}>
        {activeItem ? <DragGhost item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
