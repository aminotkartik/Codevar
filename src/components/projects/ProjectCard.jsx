import { useRouter, Link } from '../../app/router'
import { categoryLabel, categoryColor } from '../../data/categories'
import { StageBadge } from '../ui/StageBadge'
import { ProgressBar } from '../ui/ProgressBar'
import { ProjectCover } from './ProjectCover'
import { ArrowUpRight } from '../ui/Icons'
import { BookmarkButton } from './BookmarkButton'

/**
 * ProjectCard — the recognisable RE listing component.
 * The whole region is clickable; the bookmark control works on its own.
 */
export function ProjectCard({ project, variant = 'default' }) {
  const { navigate } = useRouter()

  const open = () => navigate(`/projects/${project.slug}`)

  return (
    <article
      className={`project-card${variant === 'feature' ? ' project-card--feature' : ''}`}
      onClick={open}
      data-card-id={project.id}
    >
      <div className="project-card__top">
        <span className="project-card__archive">{project.id.replace('-', '—')}</span>
        <span className="project-card__spacer" />
        <BookmarkButton
          projectId={project.id}
          projectTitle={project.title}
          size="sm"
        />
      </div>

      <ProjectCover
        project={project}
        ratio={variant === 'feature' ? '3x2' : '16x9'}
        alt={`${project.title} — ${categoryLabel(project.category)} archive photograph`}
      />

      <div>
        <span
          className="project-card__category"
          style={{ '--cat-color': categoryColor(project.category) }}
        >
          {categoryLabel(project.category)}
        </span>
      </div>

      <h3 className="project-card__title">
        <Link to={`/projects/${project.slug}`} onClick={(e) => e.stopPropagation()}>
          {project.title}
        </Link>
      </h3>

      <p className="project-card__desc">{project.description}</p>

      <div className="project-card__meta">
        <StageBadge stage={project.stage} />
        <div style={{ minWidth: 120 }}>
          <ProgressBar value={project.completion} showValue />
        </div>
      </div>

      <div className="project-card__tags">
        {project.techStack.slice(0, 3).map((tech) => (
          <span className="tag" key={tech}>
            {tech}
          </span>
        ))}
      </div>

      <div className="project-card__missing">
        <span className="project-card__missing-label">What&apos;s missing</span>
        <span>{project.helpFocus}</span>
      </div>

      <div className="project-card__cta">
        <span>Read the entry</span>
        <ArrowUpRight className="arrow" width={16} height={16} />
      </div>

      <span className="project-card__index" aria-hidden="true">
        {project.id.replace('RE-', '0')}
      </span>
    </article>
  )
}
