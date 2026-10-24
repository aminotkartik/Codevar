import { Link } from '../../app/router'
import { useRE } from '../../context/REContext'
import { categoryLabel, categoryColor, AVAILABILITY_LABELS } from '../../data/categories'
import { availabilityOf } from '../../utils/projectFilters'
import { archiveLabel, projectItem } from '../../dnd/items'
import { DraggableDataCard } from './DraggableDataCard'
import { ProgressBar } from '../ui/ProgressBar'
import { StageBadge } from '../ui/StageBadge'
import { ArrowUpRight } from '../ui/Icons'

/**
 * Inspector — the contextual read-out for the card the visitor is looking at.
 * It carries its own draggable specimen so a project can be acted on without
 * leaving the worktable.
 */
export function Inspector({ project, ordinal }) {
  const { isSaved } = useRE()
  const available = availabilityOf(project)
  const saved = isSaved(project.id)

  return (
    <div className="inspector">
      <div className="inspector__head">
        <span className="mono">Inspector</span>
        <span className="inspector__archive">{archiveLabel(project)}</span>
      </div>

      <div className="inspector__id-row">
        <span
          className="inspector__category"
          style={{ '--cat-color': categoryColor(project.category) }}
        >
          {categoryLabel(project.category)}
        </span>
        <StageBadge stage={project.stage} />
      </div>

      <h2 className="inspector__title">
        <Link to={`/projects/${project.slug}`}>{project.title}</Link>
      </h2>

      <p className="inspector__summary">{project.description}</p>

      <div className="inspector__progress">
        <span className="inspector__progress-label">
          <span className="mono">Progress</span>
          <span className="mono">{ordinal ? `#${String(ordinal).padStart(2, '0')} on table` : ''}</span>
        </span>
        <ProgressBar
          value={project.completion}
          showValue
          tone="accent"
          label={`${project.completion} per cent complete`}
        />
      </div>

      <dl className="inspector__rows">
        <div>
          <dt>Needs</dt>
          <dd>{project.helpFocus}</dd>
        </div>
        <div>
          <dt>Skills</dt>
          <dd>{project.skillsNeeded.slice(0, 3).join(' · ') || 'Not specified'}</dd>
        </div>
        <div>
          <dt>Next step</dt>
          <dd>{project.nextSteps[0]}</dd>
        </div>
        <div>
          <dt>Handoff</dt>
          <dd>{available.map((a) => AVAILABILITY_LABELS[a]).join(' · ') || 'Not open'}</dd>
        </div>
      </dl>

      {project.missingWork?.length > 0 && (
        <div className="inspector__remaining">
          <span className="mono">What remains</span>
          <ul>
            {project.missingWork.slice(0, 2).map((work) => (
              <li key={work.title}>{work.title}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="inspector__grab">
        <span className="mono">Take this card</span>
        <DraggableDataCard
          dragId={`inspector-${project.id}`}
          item={projectItem(project)}
          className="inspector__specimen"
          gripLabel={`Drag ${project.title} from the inspector into an action zone`}
        >
          <div className="inspector__specimen-body">
            <span className="inspector__specimen-archive">{archiveLabel(project)}</span>
            <strong className="inspector__specimen-title">{project.title}</strong>
            <span className="inspector__specimen-meta">
              {saved ? 'On your Revival Desk' : project.stage}
            </span>
          </div>
        </DraggableDataCard>
        <p className="inspector__hint">
          Drag this card into <b>Save to Revival Desk</b>, <b>Offer to help</b> or{' '}
          <b>Take stewardship</b> in the dock below.
        </p>
        <Link to={`/projects/${project.slug}`} className="link-arrow inspector__open">
          Open the full entry
          <ArrowUpRight width={13} height={13} />
        </Link>
      </div>
    </div>
  )
}
