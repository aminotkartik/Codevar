import { Search, Close } from '../ui/Icons'

export function SearchInput({ value, onChange, placeholder, id }) {
  return (
    <div className="search-field">
      <Search className="search-field__icon" width={17} height={17} />
      <label className="sr-only" htmlFor={id}>
        Search projects
      </label>
      <input
        id={id}
        className="input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || 'Search projects, skills, ideas...'}
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button
          type="button"
          className="search-field__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <Close width={16} height={16} />
        </button>
      )}
    </div>
  )
}
