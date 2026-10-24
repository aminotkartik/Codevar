import { cloneElement, isValidElement, useId } from 'react'

/**
 * FormField — label, optional hint, validation message and an optional
 * character counter, in one consistent block.
 *
 * Two shapes:
 *   · a single control   — pass `id`; the label points at it with `for`, and
 *     the hint / error / counter text is attached to that control with
 *     `aria-describedby`, so it is announced when the field takes focus.
 *   · a group of controls — leave `id` off (e.g. a chip row); the label
 *     becomes a group name wired up with `aria-labelledby`, so screen readers
 *     announce the question instead of a stray unassociated label.
 *
 * `className` is applied to the block so the step grid can span it.
 */
export function FormField({
  label,
  required = false,
  hint,
  error,
  id,
  counter,
  className = '',
  children,
}) {
  const uid = useId()
  const groupLabelId = `${uid}-label`
  const hintId = `${uid}-hint`
  const counterId = `${uid}-counter`
  const single = Boolean(id)

  const labelNode = single ? (
    <label className="field__label" htmlFor={id}>
      {label}
      {required && <span className="req">*</span>}
    </label>
  ) : (
    <span className="field__label" id={groupLabelId}>
      {label}
      {required && <span className="req">*</span>}
    </span>
  )

  // The description belongs on the element that receives focus. For a single
  // control that is the control itself; for a group it is the group wrapper.
  const describedBy =
    [error || hint ? hintId : null, counter ? counterId : null].filter(Boolean).join(' ') || undefined

  let content = children
  if (single && describedBy && isValidElement(children)) {
    const existing = children.props['aria-describedby']
    content = cloneElement(children, {
      'aria-describedby': [existing, describedBy].filter(Boolean).join(' '),
    })
  }

  return (
    <div
      className={`field${className ? ` ${className}` : ''}`}
      data-error={Boolean(error)}
      {...(single
        ? {}
        : { role: 'group', 'aria-labelledby': groupLabelId, 'aria-describedby': describedBy })}
    >
      {labelNode}
      <div className="field__control">{content}</div>
      {counter && (
        <span
          className="char-count"
          id={counterId}
          data-state={counter.over ? 'over' : undefined}
        >
          {counter.text}
        </span>
      )}
      {hint && !error && (
        <span className="field__hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <p className="field__hint field__hint--error" id={hintId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

/** Live character count for the submission form; `over` drives the red state. */
export function charCounter(length, max) {
  const over = length > max
  return {
    over,
    text: over ? `${length} / ${max} characters — too long` : `${length} / ${max} characters`,
  }
}
