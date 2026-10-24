import { categoryLabel } from '../../data/categories'
import { StageBadge } from '../ui/StageBadge'

function Row({ label, value, placeholder }) {
  return (
    <div className="dossier__row">
      <dt>{label}</dt>
      <dd>{value ? value : <span className="dossier__placeholder">{placeholder}</span>}</dd>
    </div>
  )
}

/** The form keeps technologies as a comma-separated string; normalise it. */
function techList(techStack) {
  if (Array.isArray(techStack)) return techStack
  return String(techStack || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

/**
 * ProjectDossier — the live preview panel. Mirrors the project card so the
 * author sees the thing they are actually creating.
 */
export function ProjectDossier({ values, compact = false }) {
  const { title, description, category, stage, techStack, helpFocus } = values

  return (
    <div className="dossier">
      <div className="dossier__head">
        <span className="mono">RE / NEW ENTRY</span>
        <StageBadge stage={stage} />
      </div>

      <h3 className="dossier__title">
        <span>New archive entry</span>
        {title ? title : 'Untitled project'}
      </h3>

      {description && (
        <p style={{ fontSize: 'var(--fs-small)', color: 'var(--text-muted)' }}>{description}</p>
      )}

      <div className="chip-row" style={{ marginTop: 'var(--sp-1)' }}>
        {category ? (
          <span className="tag tag--accent">{categoryLabel(category)}</span>
        ) : (
          <span className="tag">Category not chosen</span>
        )}
        {techList(techStack)
          .slice(0, 3)
          .map((tech) => (
            <span className="tag" key={tech}>
              {tech}
            </span>
          ))}
      </div>

      <div style={{ marginTop: 'var(--sp-3)', paddingTop: 'var(--sp-3)', borderTop: '1px solid var(--border)' }}>
        <dl style={{ display: 'grid', gap: 'var(--sp-3)' }}>
          <Row label="Stage" value={stage} placeholder="Not chosen yet" />
          <Row label="What's missing" value={helpFocus} placeholder="Not written yet" />
          <Row label="Pause reason" value={values.paused} placeholder="Not written yet" />
          <Row
            label="Next step"
            value={values.nextStep}
            placeholder="Not written yet"
          />
        </dl>
      </div>

      <p className="preview-sticky-note" style={{ marginTop: 'var(--sp-3)' }}>
        Local demo preview — this project is added to your browser only.
      </p>
    </div>
  )
}
