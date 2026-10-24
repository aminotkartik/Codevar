/**
 * FormField — label, optional hint, validation message and an optional
 * character counter, in one consistent block.
 */
export function FormField({
  label,
  required = false,
  hint,
  error,
  id,
  counter,
  children,
}) {
  return (
    <div className="field" data-error={Boolean(error)}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="req">*</span>}
      </label>
      {children}
      {counter && (
        <span className="char-count" data-state={counter.over ? 'over' : undefined}>
          {counter.text}
        </span>
      )}
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && (
        <p className="field__hint" style={{ color: 'var(--color-accent)' }} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/** The live character counter used by the submission form. */
export function CharCounter({ length, min, max }) {
  const over = length > max
  return {
    over,
    text: `${length} / ${max} characters`,
  }
}
