import {
  CATEGORIES,
  STAGE_ORDER,
  HELP_NEEDED,
  AVAILABILITY,
} from '../../data/categories'
import { Close } from '../ui/Icons'

const LABELS = {
  category: CATEGORIES.reduce((a, c) => ((a[c.id] = c.label), a), {}),
  stage: STAGE_ORDER.reduce((a, s) => ((a[s] = s), a), {}),
  help: HELP_NEEDED.reduce((a, h) => ((a[h] = h), a), {}),
  availability: AVAILABILITY.reduce((a, v) => ((a[v.id] = v.label), a), {}),
}

/** Visually lists every active filter so it can be removed individually. */
export function ActiveFilterChips({ filters, onRemove, onClearAll }) {
  const active = []
  ;['category', 'stage', 'help', 'availability'].forEach((facet) => {
    ;(filters[facet] || []).forEach((value) => {
      active.push({ facet, value, label: LABELS[facet][value] || value })
    })
  })

  if (active.length === 0) return null

  return (
    <div className="active-filters">
      <span className="active-filters__label">Active</span>
      {active.map((chip) => (
        <button
          type="button"
          key={`${chip.facet}:${chip.value}`}
          className="chip chip--removable"
          onClick={() => onRemove(chip.facet, chip.value)}
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <span className="chip__remove" aria-hidden="true">
            <Close width={11} height={11} />
          </span>
        </button>
      ))}
      <button type="button" className="link-arrow" onClick={onClearAll}>
        Clear all
      </button>
    </div>
  )
}
