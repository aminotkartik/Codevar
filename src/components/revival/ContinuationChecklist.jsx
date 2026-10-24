import { useRE } from '../../context/REContext'
import { ProgressBar } from '../ui/ProgressBar'
import { Check } from '../ui/Icons'

/** A small, editable continuation checklist. Persists locally. */
export function ContinuationChecklist({ plan }) {
  const { toggleChecklistItem } = useRE()
  const items = plan.checklist || []
  const done = items.filter((item) => item.done).length
  const total = items.length

  if (total === 0) {
    return (
      <p className="snapshot__caption">
        This plan has no continuation checklist yet. Add one when you write your notes.
      </p>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
        <span className="label">Continuation</span>
        <span style={{ flex: 1 }}>
          <ProgressBar value={(done / total) * 100} tone="accent" />
        </span>
        <span className="char-count">
          {done}/{total}
        </span>
      </div>

      <ul className="checklist">
        {items.map((item) => (
          <li
            key={item.id}
            className="checklist__item"
            data-done={item.done}
            data-interactive="true"
            onClick={() => toggleChecklistItem(plan.id, item.id)}
          >
            <span className="checklist__box" aria-hidden="true" />
            <span className="checklist__label">{item.label}</span>
            {item.done && <Check width={14} height={14} style={{ color: 'var(--color-accent)', marginLeft: 'auto' }} />}
          </li>
        ))}
      </ul>

      <p className="snapshot__caption">
        These are your own planning notes. They do not affect the project.
      </p>
    </div>
  )
}
