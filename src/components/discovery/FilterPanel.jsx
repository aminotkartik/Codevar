import { useEffect, useMemo, useRef } from 'react'
import {
  CATEGORIES,
  STAGE_ORDER,
  HELP_NEEDED,
  AVAILABILITY,
} from '../../data/categories'
import { applyFilters, countByFacet } from '../../utils/projectFilters'
import { Close } from '../ui/Icons'
import { Portal } from '../ui/Portal'

const FACETS = ['category', 'stage', 'help', 'availability']

const FACET_LABELS = {
  category: 'Category',
  stage: 'Project stage',
  help: 'Help needed',
  availability: 'Availability',
}

const FACET_VALUES = {
  category: () => CATEGORIES.map((c) => c.id),
  stage: () => STAGE_ORDER,
  help: () => HELP_NEEDED,
  availability: () => AVAILABILITY.map((a) => a.id),
}

const FACET_LABEL_FOR = {
  category: (id) => CATEGORIES.find((c) => c.id === id)?.label || id,
  stage: (id) => id,
  help: (id) => id,
  availability: (id) => AVAILABILITY.find((a) => a.id === id)?.label || id,
}

/**
 * FilterPanel — readable control groups with facet counts that reflect the
 * rest of the active filtering, so the numbers stay honest.
 */
export function FilterPanel({ projects, filters, onChange }) {
  const counts = useMemo(() => {
    const result = {}
    FACETS.forEach((facet) => {
      const others = applyFilters(projects, { ...filters, [facet]: [] })
      result[facet] = countByFacet(others, facet)
    })
    return result
  }, [projects, filters])

  const toggle = (facet, value) => {
    const current = filters[facet] || []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onChange({ ...filters, [facet]: next })
  }

  return (
    <div>
      {FACETS.map((facet) => (
        <fieldset className="filter-group" key={facet}>
          <legend className="filter-group__head">
            <span className="filter-group__title">{FACET_LABELS[facet]}</span>
            <span className="filter-group__count">
              {Object.values(counts[facet] || {}).reduce((a, b) => a + b, 0)} available
            </span>
          </legend>

          <div className="filter-opts">
            {FACET_VALUES[facet]().map((value) => {
              const checked = (filters[facet] || []).includes(value)
              const count = counts[facet]?.[value] || 0
              return (
                <label
                  className="filter-opt"
                  key={value}
                  aria-pressed={checked}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(facet, value)}
                  />
                  <span className="filter-opt__box" aria-hidden="true" />
                  <span className="filter-opt__label">{FACET_LABEL_FOR[facet](value)}</span>
                  <span className="filter-opt__count">{count}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}
    </div>
  )
}

/** The same panel, rendered inside a mobile drawer. */
export function FilterDrawer({ open, onClose, projects, filters, onChange }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const raf = window.requestAnimationFrame(() => closeRef.current?.focus())
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey, true)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <Portal>
    <div className="filter-drawer">
      <div
        role="presentation"
        style={{ position: 'absolute', inset: 0, background: 'rgba(32,35,31,.42)' }}
        onClick={onClose}
      />
      <div className="filter-drawer__panel" role="dialog" aria-modal="true" aria-label="Filter projects">
        <div className="filter-drawer__head">
          <span className="section-rule" style={{ marginBottom: 0 }}>
            <span className="mono">Filters</span>
          </span>
          <button
            type="button"
            className="icon-btn"
            ref={closeRef}
            onClick={onClose}
            aria-label="Close filters"
          >
            <Close width={18} height={18} />
          </button>
        </div>

        <div className="filter-drawer__body">
          <FilterPanel projects={projects} filters={filters} onChange={onChange} />
        </div>

        <div className="filter-drawer__foot">
          <button
            type="button"
            className="btn btn--sm"
            onClick={() =>
              onChange({ ...filters, category: [], stage: [], help: [], availability: [] })
            }
          >
            Clear all
          </button>
          <span style={{ flex: 1 }} />
          <button type="button" className="btn btn--primary btn--sm" onClick={onClose}>
            Show results
          </button>
        </div>
      </div>
    </div>
    </Portal>
  )
}
