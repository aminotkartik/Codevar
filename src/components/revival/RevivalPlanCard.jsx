import { Link } from '../../app/router'
import { useRE, PLAN_STATUSES } from '../../context/REContext'
import { COLLABORATION_LABELS } from '../../data/categories'
import { formatDate } from '../../utils/format'
import { planItem } from '../../dnd/items'
import { DraggableDataCard } from '../canvas/DraggableDataCard'
import { TaskCard } from '../canvas/TaskCard'
import { ProgressBar } from '../ui/ProgressBar'
import { ArrowUpRight, Edit } from '../ui/Icons'

/**
 * RevivalPlanCard — a personal plan you can pick up, edit and drop.
 *
 * Tasks are their own cards: they move to Completed or Reopen task through a
 * drop. The plan card itself moves to Remove from desk.
 */
export function RevivalPlanCard({ plan, dragId }) {
  const { updatePlanStatus, openComposer, pushToast, plans } = useRE()
  const tasks = plan.tasks || []
  const done = tasks.filter((task) => task.done).length
  const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  const isArchived = plan.status === 'archived'
  const item = planItem(plan)
  const livePlan = plans.find((p) => p.id === plan.id) || plan

  return (
    <DraggableDataCard
      dragId={dragId}
      item={item}
      className="plan-data-card"
      gripLabel={`Drag the plan for ${plan.projectTitle} into Remove from desk`}
    >
      <div className="plan-data-card__body" data-archived={isArchived}>
        <div className="plan-data-card__head">
          <span className="plan-data-card__type">
            {plan.type === 'stewardship' ? 'Stewardship proposal' : 'Contribution intent'}
          </span>
          <span className="plan-data-card__spacer" />
          <span className="tag tag--accent">
            {COLLABORATION_LABELS[plan.collaboration] || 'Local plan'}
          </span>
        </div>

        <h3 className="plan-data-card__title">
          <Link to={`/projects/${plan.projectSlug}`}>{plan.projectTitle}</Link>
        </h3>

        <div className="plan-data-card__meta">
          <span>
            <b>Recorded</b> {formatDate(plan.createdAt)}
          </span>
          <span>
            <b>Plan ID</b> {plan.id.slice(-8)}
          </span>
          <span>
            <b>Demo</b> local plan only
          </span>
        </div>

        <p className="plan-data-card__drag-hint">
          Drag this card into <b>Remove from desk</b> to stage its removal. Editing uses its
          own card.
        </p>

        {(plan.intention || plan.note) && (
          <div className="plan-data-card__quote">
            {plan.intention && <p>{plan.intention}</p>}
            {plan.note && (
              <p>
                <span className="annotation annotation--muted">First step</span> {plan.note}
              </p>
            )}
          </div>
        )}

        <div className="plan-data-card__tasks">
          <div className="plan-data-card__tasks-head">
            <span className="label">Continuation tasks</span>
            <span className="plan-data-card__count">
              {done}/{tasks.length}
            </span>
          </div>
          <ProgressBar value={percent} tone="accent" label={`${percent}% of tasks complete`} />
          <p className="plan-data-card__tasks-note">
            Drag a task into <b>Completed</b> or <b>Reopen task</b> in the dock. There is no
            checkbox.
          </p>

          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id}>
                <TaskCard
                  plan={livePlan}
                  task={task}
                  dragId={`task-${livePlan.id}-${task.id}`}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="plan-data-card__foot">
          <label className="plan-data-card__status">
            <span className="label">Local status</span>
            <select
              className="select"
              value={plan.status}
              onChange={(event) => {
                updatePlanStatus(plan.id, event.target.value)
                pushToast(
                  `Plan marked as ${PLAN_STATUSES.find((s) => s.id === event.target.value)?.label}.`,
                )
              }}
            >
              {PLAN_STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <div className="plan-data-card__actions">
            <Link to={`/projects/${plan.projectSlug}`} className="btn btn--sm">
              Open project
              <ArrowUpRight width={13} height={13} />
            </Link>
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => openComposer('edit-plan', { planId: plan.id })}
            >
              <Edit width={13} height={13} />
              Edit plan
            </button>
          </div>
        </div>
      </div>
    </DraggableDataCard>
  )
}
