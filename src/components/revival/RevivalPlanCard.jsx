import { Link } from '../../app/router'
import { useRE, PLAN_STATUSES } from '../../context/REContext'
import { COLLABORATION_LABELS } from '../../data/categories'
import { formatDate } from '../../utils/format'
import { planItem } from '../../dnd/items'
import { DraggableDataCard } from '../canvas/DraggableDataCard'
import { TaskCard } from '../canvas/TaskCard'
import { ProgressBar } from '../ui/ProgressBar'
import { ArrowUpRight, Edit, Grip } from '../ui/Icons'

const STATUS_LABELS = PLAN_STATUSES.reduce((acc, status) => {
  acc[status.id] = status.label
  return acc
}, {})

/** Status is a read-out here — it changes only by dropping the card into a status zone. */
function StatusMark({ status }) {
  return (
    <span className="status-mark" data-status={status} title="Plan status">
      <span className="status-mark__dot" aria-hidden="true" />
      {STATUS_LABELS[status] || 'Drafted'}
    </span>
  )
}

/**
 * RevivalPlanCard — a personal plan you can pick up, edit and drop.
 *
 *  · the plan card itself → plan status zones, or Remove from desk
 *  · its task cards        → Completed / Reopen task
 *  · Edit plan            → opens the prep panel; the edited card commits
 */
export function RevivalPlanCard({ plan, dragId }) {
  const { openComposer, plans } = useRE()
  const livePlan = plans.find((p) => p.id === plan.id) || plan
  const tasks = livePlan.tasks || []
  const done = tasks.filter((task) => task.done).length
  const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  const isArchived = plan.status === 'archived'
  const item = planItem(plan, STATUS_LABELS[plan.status])
  const typeLabel = plan.type === 'stewardship' ? 'Stewardship proposal' : 'Contribution intent'

  return (
    <DraggableDataCard
      dragId={dragId}
      item={item}
      className="plan-data-card"
      gripLabel={`Drag the plan for ${plan.projectTitle} into a status zone or Remove from desk`}
    >
      <div className="plan-data-card__body" data-archived={isArchived}>
        <div className="plan-data-card__head">
          <span className="plan-data-card__type">{typeLabel}</span>
          <span className="plan-data-card__spacer" />
          <StatusMark status={plan.status} />
        </div>

        <h3 className="plan-data-card__title">
          <Link to={`/projects/${plan.projectSlug}`}>{plan.projectTitle}</Link>
        </h3>

        <div className="plan-data-card__meta">
          <span>
            <b>Recorded</b> {formatDate(plan.createdAt)}
          </span>
          <span>
            <b>Joining as</b> {COLLABORATION_LABELS[plan.collaboration] || 'Local plan'}
          </span>
          <span>
            <b>Plan ID</b> {plan.id.slice(-8)}
          </span>
        </div>

        {plan.note && (
          <p className="plan-data-card__next">
            <span className="mono">Next step</span>
            <span>{plan.note}</span>
          </p>
        )}

        {plan.intention && <p className="plan-data-card__intention">{plan.intention}</p>}

        <div className="plan-data-card__status-row">
          <Grip width={12} height={12} aria-hidden="true" />
          <span>
            Drag this card into <b>Drafted</b>, <b>Planning</b>, <b>Working</b> or{' '}
            <b>Archived</b> to change its status. Removing it uses <b>Remove from desk</b>.
          </span>
        </div>

        <div className="plan-data-card__tasks">
          <div className="plan-data-card__tasks-head">
            <span className="mono">Continuation tasks</span>
            <span className="plan-data-card__count">
              {done}/{tasks.length} done
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
          <span className="plan-data-card__footnote">
            A personal planning record. No owner is contacted and nothing is transferred.
          </span>
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
