import { taskItem } from '../../dnd/items'
import { DraggableDataCard } from './DraggableDataCard'
import { Check, HandoffArrow } from '../ui/Icons'

/** A continuation task. Its state is changed by dropping the card, not by a checkbox. */
export function TaskCard({ plan, task, dragId }) {
  const item = taskItem(plan, task)

  return (
    <DraggableDataCard
      dragId={dragId}
      item={item}
      className="task-card"
      gripLabel={`Drag task “${task.label}” — ${
        task.done ? 'drop into Reopen task' : 'drop into Completed'
      }`}
    >
      <div className="task-card__body">
        <span className="task-card__state" data-done={task.done}>
          {task.done ? <Check width={12} height={12} /> : <HandoffArrow width={12} height={12} />}
          {task.done ? 'Complete' : 'Open'}
        </span>
        <span className="task-card__label" data-done={task.done}>
          {task.label}
        </span>
        <span className="task-card__hint">
          {task.done ? 'Drag to Reopen task' : 'Drag to Completed'}
        </span>
      </div>
    </DraggableDataCard>
  )
}
