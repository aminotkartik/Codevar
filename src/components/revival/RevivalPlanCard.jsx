import { useState } from 'react'
import { useRouter, Link } from '../../app/router'
import { useRE, PLAN_STATUSES } from '../../context/REContext'
import { COLLABORATION_LABELS } from '../../data/categories'
import { formatDate } from '../../utils/format'
import { ContinuationChecklist } from './ContinuationChecklist'
import { PlanEditDialog } from './PlanEditDialog'
import { ArrowUpRight, Edit, Trash, ArchiveBox } from '../ui/Icons'

export function RevivalPlanCard({ plan }) {
  const { navigate } = useRouter()
  const { updatePlan, removePlan, pushToast } = useRE()
  const [editing, setEditing] = useState(false)

  const typeLabel =
    plan.type === 'stewardship' ? 'Stewardship proposal' : 'Contribution intent'

  const isArchived = plan.status === 'archived'

  return (
    <article className="plan-card" data-archived={isArchived} style={{ opacity: isArchived ? 0.72 : 1 }}>
      <div>
        <div className="plan-card__head">
          <span className="plan-card__type">{typeLabel}</span>
          <h3 className="plan-card__title">
            <Link to={`/projects/${plan.projectSlug}`}>{plan.projectTitle}</Link>
          </h3>
          <span className="tag tag--accent">
            {COLLABORATION_LABELS[plan.collaboration] || 'Involvement recorded'}
          </span>
        </div>

        <div className="plan-card__meta">
          {plan.role && (
            <span>
              <b>Skill / role:</b> {plan.role}
            </span>
          )}
          <span>
            <b>Recorded:</b> {formatDate(plan.createdAt)}
          </span>
          <span>
            <b>Demo status:</b> local plan only
          </span>
        </div>

        {(plan.intention || plan.note) && (
          <div className="plan-card__intention">
            {plan.intention && <p style={{ margin: 0 }}>{plan.intention}</p>}
            {plan.note && (
              <p style={{ marginTop: 'var(--sp-2)', marginBottom: 0 }}>
                <span className="annotation annotation--muted">First step</span> {plan.note}
              </p>
            )}
          </div>
        )}

        <div style={{ marginTop: 'var(--sp-5)' }}>
          <ContinuationChecklist plan={plan} />
        </div>
      </div>

      <div className="plan-card__side">
        <label className="sr-only" htmlFor={`status-${plan.id}`}>
          Personal plan status
        </label>
        <select
          id={`status-${plan.id}`}
          className="select status-select"
          value={plan.status}
          onChange={(event) => {
            updatePlan(plan.id, { status: event.target.value })
            pushToast(`Plan marked as ${PLAN_STATUSES.find((s) => s.id === event.target.value)?.label}.`)
          }}
        >
          {PLAN_STATUSES.map((status) => (
            <option key={status.id} value={status.id}>
              {status.label}
            </option>
          ))}
        </select>

        <div className="plan-actions">
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => navigate(`/projects/${plan.projectSlug}`)}
          >
            Open project
            <ArrowUpRight width={13} height={13} />
          </button>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => setEditing(true)}
          >
            <Edit width={13} height={13} />
            Edit plan
          </button>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => {
              removePlan(plan.id)
              pushToast('Plan removed from your desk.')
            }}
          >
            {plan.status === 'archived' ? (
              <>
                <ArchiveBox width={13} height={13} />
                Unarchive
              </>
            ) : (
              <>
                <Trash width={13} height={13} />
                Remove
              </>
            )}
          </button>
        </div>
      </div>

      <PlanEditDialog open={editing} onClose={() => setEditing(false)} plan={plan} />
    </article>
  )
}
