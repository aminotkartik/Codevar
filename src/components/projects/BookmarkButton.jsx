import { useRE } from '../../context/REContext'
import { Bookmark, BookmarkFilled } from '../ui/Icons'

/**
 * Bookmark toggle. Works identically from discovery, detail and the desk.
 * Variant "icon" is a compact control; "block" is a full-width labelled button.
 */
export function BookmarkButton({
  projectId,
  projectTitle,
  size = 'default',
  variant = 'icon',
  className,
}) {
  const { isSaved, toggleSaved, pushToast } = useRE()
  const saved = isSaved(projectId)

  const onClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    toggleSaved(projectId)
    pushToast(
      saved
        ? `Removed “${projectTitle}” from your Revival Desk.`
        : `Saved “${projectTitle}” to your Revival Desk.`,
    )
  }

  const label = saved ? 'Saved' : 'Save to Revival Desk'
  const ariaLabel = `${label} — ${projectTitle}`

  if (variant === 'block') {
    return (
      <button
        type="button"
        className={`btn btn--block${saved ? ' btn--primary' : ''}${className ? ` ${className}` : ''}`}
        onClick={onClick}
        aria-pressed={saved}
        aria-label={ariaLabel}
      >
        {saved ? <BookmarkFilled width={15} height={15} /> : <Bookmark width={15} height={15} />}
        {label}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`icon-btn${saved ? ' icon-btn--saved' : ''}${size === 'sm' ? ' icon-btn--sm' : ''}${
        className ? ` ${className}` : ''
      }`}
      onClick={onClick}
      aria-pressed={saved}
      aria-label={ariaLabel}
      title={saved ? 'Saved — remove from Revival Desk' : 'Save to Revival Desk'}
    >
      {saved ? <BookmarkFilled width={17} height={17} /> : <Bookmark width={17} height={17} />}
    </button>
  )
}
