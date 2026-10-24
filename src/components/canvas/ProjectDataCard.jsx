import { useMemo } from 'react'
import { Link } from '../../app/router'
import { useRE } from '../../context/REContext'
import { categoryLabel, categoryColor } from '../../data/categories'
import { archiveLabel, projectItem } from '../../dnd/items'
import { ProgressBar } from '../ui/ProgressBar'
import { StageBadge } from '../ui/StageBadge'
import { ProjectCover } from '../projects/ProjectCover'
import { ArrowUpRight, BookmarkFilled } from '../ui/Icons'
import { DraggableDataCard } from './DraggableDataCard'

/**
 * ProjectDataCard — one project, as an object you can pick up.
 *
 * The grip drags. The title and the "Open entry" link navigate. Those are two
 * different interactions and neither steals the other.
 */
export function ProjectDataCard({
  project,
  dragId,
  variant = 'library',
  selected = false,
  onInspect,
  showCover = false,
}) {
  const { isSaved } = useRE()
  const origin = variant === 'saved' ? 'saved' : variant === 'local' ? 'local' : 'archive'
  const item = useMemo(() => projectItem(project, origin), [project, origin])
  const saved = isSaved(project.id)

  return (
    <DraggableDataCard
      dragId={dragId}
      item={item}
      className={`project-data-card project-data-card--${variant}`}
      gripLabel={`Drag ${project.title} — saved as ${archiveLabel(project)}`}
    >
      <div
        className="project-data-card__body"
        onFocus={onInspect}
        onPointerEnter={onInspect}
      >
        <div className="project-data-card__top">
          <span className="project-data-card__archive">{archiveLabel(project)}</span>
          <span className="project-data-card__dot" aria-hidden="true">
            ·
          </span>
          <span
            className="project-data-card__category"
            style={{ '--cat-color': categoryColor(project.category) }}
          >
            {categoryLabel(project.category)}
          </span>
          <span className="project-data-card__spacer" />
          {saved ? (
            <span className="project-data-card__saved">
              <BookmarkFilled width={13} height={13} />
              On desk
            </span>
          ) : (
            <StageBadge stage={project.stage} />
          )}
        </div>

        {showCover && (
          <ProjectCover
            project={project}
            ratio="16x9"
            alt={`${project.title} — ${categoryLabel(project.category)} archive photograph`}
          />
        )}

        <h3 className="project-data-card__title">
          <Link to={`/projects/${project.slug}`} onClick={(event) => event.stopPropagation()}>
            {project.title}
          </Link>
        </h3>

        <p className="project-data-card__desc">{project.description}</p>

        <div className="project-data-card__meta">
          <div className="project-data-card__progress">
            <ProgressBar value={project.completion} showValue label={`${project.completion}% complete`} />
          </div>
          <span className="project-data-card__stage">{project.stage}</span>
        </div>

        <div className="project-data-card__tags">
          {project.techStack.slice(0, 3).map((tech) => (
            <span className="tag" key={tech}>
              {tech}
            </span>
          ))}
        </div>

        <div className="project-data-card__need">
          <span className="project-data-card__need-label">Needs</span>
          <span>{project.helpFocus}</span>
        </div>

        <div className="project-data-card__foot">
          <Link
            to={`/projects/${project.slug}`}
            className="project-data-card__open"
            onClick={(event) => event.stopPropagation()}
          >
            Open entry
            <ArrowUpRight width={13} height={13} />
          </Link>
          <span className="project-data-card__drag-note">
            {selected ? 'Selected — drag the grip to act' : 'Drag the grip to act'}
          </span>
        </div>
      </div>
    </DraggableDataCard>
  )
}
