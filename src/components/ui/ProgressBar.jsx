/**
 * A continuation track: the fill stops short of the end, and a small accent
 * chevron carries it onward. This is RE's signature progress mark.
 */
export function ProgressBar({ value = 0, tone, showValue = false, label }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div className="progress" role="img" aria-label={label || `${clamped} per cent complete`}>
      <span className="progress__track">
        <span
          className="progress__fill"
          data-tone={tone}
          style={{ width: `${clamped}%` }}
        />
      </span>
      <span className="progress__chevron" aria-hidden="true" />
      {showValue && <span className="progress__value">{clamped}%</span>}
    </div>
  )
}
