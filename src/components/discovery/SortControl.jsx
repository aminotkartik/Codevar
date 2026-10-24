import { SORT_OPTIONS, normaliseSortId, sortOption } from '../../utils/projectSorting'

/**
 * Controlled sort selection.
 *
 * The value comes from the URL, so refresh, deep links and Back/Forward all
 * restore the same order. `onChange` receives the option id; Explore stores it
 * in the query string and re-derives the list from it.
 */
export function SortControl({ value, onChange, id }) {
  const active = sortOption(value)
  const current = normaliseSortId(value)

  return (
    <div className="sort-control">
      <label htmlFor={id}>Sort</label>
      <select
        id={id}
        className="select"
        value={current}
        title={active.description}
        aria-describedby={`${id}-description`}
        onChange={(event) => onChange(event.target.value)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <span id={`${id}-description`} className="sr-only">
        {active.description}
      </span>
    </div>
  )
}
