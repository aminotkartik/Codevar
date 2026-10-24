/**
 * The RE wordmark — typographic, with a continuation mark carried past it.
 * No emoji, no gradient, no recycled clip art.
 */
export function Wordmark({ size, className }) {
  return (
    <span
      className={`wordmark${size === 'lg' ? ' wordmark--lg' : ''}${className ? ` ${className}` : ''}`}
    >
      <span className="wordmark__letters" aria-label={`RE`}>
        <span aria-hidden="true">R</span>
        <span aria-hidden="true">E</span>
      </span>
      <span className="wordmark__mark" aria-hidden="true" />
    </span>
  )
}
