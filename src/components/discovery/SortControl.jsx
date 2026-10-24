import { SORT_OPTIONS } from '../../utils/projectSorting'

export function SortControl({ value, onChange, id }) {
  return (
    <div className="sort-control">
      <label htmlFor={id}>Sort</label>
      <select
        id={id}
        className="select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
