import { stageTone } from '../../data/categories'

export function StageBadge({ stage, className }) {
  if (!stage) return null
  return (
    <span className={`stage-badge${className ? ` ${className}` : ''}`} data-tone={stageTone(stage)}>
      <span className="stage-badge__dot" aria-hidden="true" />
      {stage}
    </span>
  )
}
