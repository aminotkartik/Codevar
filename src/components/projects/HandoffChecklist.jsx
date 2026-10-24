import { handoffFraction } from '../../utils/format'
import { ProgressBar } from '../ui/ProgressBar'

/**
 * Handoff snapshot — derived from the fields the fixture declares.
 * Presented as information, never as an authoritative score.
 */
export function HandoffChecklist({ project }) {
  const { met, total, pct, assessed } = handoffFraction(project)

  if (!assessed) {
    return (
      <div className="snapshot">
        <p className="snapshot__caption">
          Handoff readiness has not been assessed for this entry. The project record is
          still complete enough to continue.
        </p>
      </div>
    )
  }

  return (
    <div className="snapshot">
      <div className="snapshot__ring">
        <span className="snapshot__num">
          {met}
          <small> / {total}</small>
        </span>
        <span className="snapshot__label">documented</span>
      </div>
      <div>
        <ProgressBar value={pct} tone="accent" />
        <p className="snapshot__caption">
          Calculated from the handoff checklist recorded with the entry — {pct}% of the
          handoff criteria are met.
        </p>
      </div>
      <ul className="checklist" style={{ marginTop: 'var(--sp-2)' }}>
        {project.handoffChecklist.map((item) => (
          <li className="checklist__item" key={item.label} data-done={item.met}>
            <span className="checklist__box" aria-hidden="true" />
            <span className="checklist__label">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
