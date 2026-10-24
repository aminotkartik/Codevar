import { useMemo, useState } from 'react'
import { useRouter, Link } from '../app/router'
import { useRE } from '../context/REContext'
import { RevivalDialog } from '../components/revival/RevivalDialog'
import { StewardshipDialog } from '../components/revival/StewardshipDialog'
import { BookmarkButton } from '../components/projects/BookmarkButton'
import { HandoffChecklist } from '../components/projects/HandoffChecklist'
import { ProjectFieldNotes } from '../components/projects/ProjectFieldNotes'
import { StageBadge } from '../components/ui/StageBadge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { ProjectGlyph } from '../components/ui/ProjectGlyph'
import {
  categoryLabel,
  categoryColor,
  AVAILABILITY_LABELS,
} from '../data/categories'
import { availabilityOf } from '../utils/projectFilters'
import { formatDate, handoffFraction } from '../utils/format'
import {
  ArrowUpRight,
  ArrowLeft,
  Clock,
  Users,
  Target,
  FileNote,
  Pen,
  Layers,
  Branch,
  ArchiveBox,
} from '../components/ui/Icons'

const ASSET_ICONS = {
  prototype: Layers,
  design: Pen,
  research: FileNote,
  model: Branch,
  docs: FileNote,
  code: Layers,
}

export function ProjectPage({ slug }) {
  const { navigate } = useRouter()
  const { projects, projectsBySlug } = useRE()
  const [dialog, setDialog] = useState(null) // 'revival' | 'stewardship'

  const project = useMemo(() => projectsBySlug.get(slug), [projectsBySlug, slug])

  if (!project) {
    return (
      <div className="container">
        <div className="notfound">
          <p className="notfound__code" aria-hidden="true">
            404
          </p>
          <h1 className="notfound__title">That entry is not in the archive.</h1>
          <p className="notfound__text">
            The address you followed does not match a project. It may have been written by
            hand, or it may be a link to something that never existed.
          </p>
          <div className="empty-state__actions">
            <Link to="/explore" className="btn btn--primary">
              Browse the archive
              <ArrowUpRight width={15} height={15} />
            </Link>
            <button type="button" className="btn" onClick={() => navigate('/')}>
              <ArrowLeft width={15} height={15} />
              Back to home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const available = availabilityOf(project)
  const handoff = handoffFraction(project)

  return (
    <div className="route-in">
      <div className="container">
        <nav aria-label="Breadcrumb" style={{ marginBottom: 'var(--sp-5)' }}>
          <Link to="/explore" className="link-arrow" style={{ fontSize: 'var(--fs-micro)' }}>
            <ArrowLeft width={13} height={13} />
            Back to explore
          </Link>
        </nav>

        {/* ================= HEAD ================= */}
        <header className="detail-head">
          <div className="archive-id">
            <span className="archive-id__num">{project.id.replace('-', '—')}</span>
            <span>·</span>
            <span>{project.stage}</span>
          </div>

          <h1 className="detail-head__title">{project.title}</h1>

          <p className="detail-head__summary">{project.summary}</p>

          <dl className="detail-head__meta">
            <div>
              <dt>Category</dt>
              <dd style={{ color: categoryColor(project.category) }}>
                {categoryLabel(project.category)}
              </dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{formatDate(project.updatedAt)}</dd>
            </div>
            <div>
              <dt>Created by</dt>
              <dd>{project.creator?.name || 'Anonymous'}</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>{available.map((a) => AVAILABILITY_LABELS[a]).join(' · ')}</dd>
            </div>
          </dl>

          <div className="detail-head__actions">
            <button
              type="button"
              className="btn btn--primary btn--lg"
              onClick={() => setDialog('revival')}
            >
              Offer to contribute
              <ArrowUpRight width={16} height={16} />
            </button>
            <button
              type="button"
              className="btn btn--lg"
              onClick={() => setDialog('stewardship')}
              disabled={!project.openToStewardship && !available.includes('stewardship')}
              title={
                project.openToStewardship
                  ? 'Propose leading the next chapter'
                  : 'This project is not open to stewardship'
              }
            >
              Request stewardship
            </button>
            <BookmarkButton projectId={project.id} projectTitle={project.title} />
          </div>
        </header>

        {/* ================= BODY ================= */}
        <div className="detail-grid">
          <div className="detail-main">
            {/* ---- Story ---- */}
            <section className="story-block">
              <div className="story-block__head">
                <h2 className="story-block__title">The story so far</h2>
                <span className="annotation annotation--muted">Origin</span>
              </div>
              {project.story.map((paragraph, i) => (
                <p className="story-block__note" key={i}>
                  {paragraph}
                </p>
              ))}
            </section>

            {/* ---- What exists ---- */}
            <section className="story-block">
              <div className="story-block__head">
                <h2 className="story-block__title">What already exists</h2>
                <span className="cont-mark" aria-hidden="true" />
              </div>
              <ul className="asset-list">
                {project.existingWork.map((work) => {
                  const Icon = ASSET_ICONS[work.kind] || Layers
                  return (
                    <li className="asset-item" key={work.title}>
                      <span className="asset-item__icon">
                        <Icon width={15} height={15} />
                      </span>
                      <div>
                        <p className="asset-item__title">{work.title}</p>
                        <p className="asset-item__detail">{work.detail}</p>
                      </div>
                      <span className="asset-item__status">{work.status}</span>
                    </li>
                  )
                })}
              </ul>
            </section>

            {/* ---- What's missing ---- */}
            <section className="story-block">
              <div className="story-block__head">
                <h2 className="story-block__title">What still needs work</h2>
                <span className="annotation">{project.missingWork.length} open tasks</span>
              </div>
              <ul className="task-list">
                {project.missingWork.map((task) => (
                  <li className="task-item" key={task.title}>
                    <div>
                      <p className="task-item__title">{task.title}</p>
                      <p className="task-item__detail">{task.detail}</p>
                      <div className="task-item__meta">
                        <span className="tag">{task.skill}</span>
                        <span className="tag">Difficulty: {task.difficulty}</span>
                      </div>
                    </div>
                    <div className="task-item__right">
                      <span
                        className="tag"
                        data-status={task.status.toLowerCase()}
                        style={
                          task.status === 'Done'
                            ? { color: '#4a7a3f', borderColor: '#a9c79a', background: '#eef4e9' }
                            : task.status === 'In progress'
                              ? { color: '#8a6b4a', borderColor: '#d6c3a8', background: '#f7f0e5' }
                              : undefined
                        }
                      >
                        {task.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* ---- Why it paused ---- */}
            <section className="story-block">
              <div className="story-block__head">
                <h2 className="story-block__title">Why it went quiet</h2>
                <Clock width={16} height={16} style={{ color: 'var(--color-muted)' }} />
              </div>
              <p className="story-block__note" style={{ fontSize: 'var(--fs-body)' }}>
                {project.reasonPaused}
              </p>
            </section>

            {/* ---- Next steps ---- */}
            <section className="story-block">
              <div className="story-block__head">
                <h2 className="story-block__title">Suggested next steps</h2>
                <ArrowUpRight width={16} height={16} style={{ color: 'var(--color-accent)' }} />
              </div>
              <ol style={{ display: 'grid', gap: 'var(--sp-3)', counterReset: 'step' }}>
                {project.nextSteps.map((step, i) => (
                  <li
                    key={step}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr',
                      gap: 'var(--sp-3)',
                      alignItems: 'baseline',
                    }}
                  >
                    <span className="mono" style={{ color: 'var(--color-accent)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 'var(--fs-body)' }}>{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* ---- Materials ---- */}
            {project.materials?.length > 0 && (
              <section className="story-block">
                <div className="story-block__head">
                  <h2 className="story-block__title">Available project materials</h2>
                  <span className="annotation annotation--muted">Demo handoff notes</span>
                </div>
                <ul className="asset-list">
                  {project.materials.map((material) => (
                    <li className="asset-item" key={material.label}>
                      <span className="asset-item__icon">
                        <FileNote width={15} height={15} />
                      </span>
                      <div>
                        <p className="asset-item__title">{material.label}</p>
                        <p className="asset-item__detail">{material.detail}</p>
                      </div>
                      <span className="asset-item__status">On file</span>
                    </li>
                  ))}
                </ul>
                <p className="step-foot__note" style={{ marginTop: 'var(--sp-4)' }}>
                  These are described as handoff notes for the demo. No files are served and no
                  link is live.
                </p>
              </section>
            )}

            {/* ---- Field notes ---- */}
            <section className="story-block">
              <div className="story-block__head">
                <h2 className="story-block__title">Field notes</h2>
                <ArchiveBox width={16} height={16} style={{ color: 'var(--color-muted)' }} />
              </div>
              <ProjectFieldNotes notes={project.fieldNotes} />
            </section>
          </div>

          {/* ================= ASIDE ================= */}
          <aside className="detail-aside" aria-label="Project actions and context">
            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">Revival status</span>
                <span className="panel__spacer" />
                <span className="annotation annotation--muted">{project.id}</span>
              </div>

              <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                  <StageBadge stage={project.stage} />
                  {available.map((a) => (
                    <span className="tag tag--dot" key={a}>
                      {AVAILABILITY_LABELS[a]}
                    </span>
                  ))}
                </div>

                <div>
                  <span className="label">Progress so far</span>
                  <div style={{ marginTop: 'var(--sp-2)' }}>
                    <ProgressBar
                      value={project.completion}
                      tone="accent"
                      showValue
                      label={`${project.completion} per cent complete`}
                    />
                  </div>
                  <p className="snapshot__caption">
                    Reflects how far the work has progressed, not how good it is.
                  </p>
                </div>

                <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                  <button
                    type="button"
                    className="btn btn--primary btn--block"
                    onClick={() => setDialog('revival')}
                  >
                    Offer to contribute
                    <ArrowUpRight width={15} height={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn--block"
                    onClick={() => setDialog('stewardship')}
                    disabled={!project.openToStewardship && !available.includes('stewardship')}
                  >
                    Request stewardship
                  </button>
                  <BookmarkButton
                    projectId={project.id}
                    projectTitle={project.title}
                    variant="block"
                  />
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">Handoff snapshot</span>
                <span className="panel__spacer" />
                <span className="mono">{handoff.assessed ? `${handoff.met}/${handoff.total}` : '—'}</span>
              </div>
              <HandoffChecklist project={project} />
            </div>

            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">What help is needed</span>
                <span className="panel__spacer" />
                <Target width={15} height={15} style={{ color: 'var(--color-accent)' }} />
              </div>
              <ul className="help-list">
                {project.helpNeeded.map((help, i) => (
                  <li className="help-item" key={help}>
                    <span className="help-item__bar">
                      <span
                        className="help-item__fill"
                        style={{ width: `${40 + ((project.priority * 6) % 45) + i * 8}%` }}
                      />
                    </span>
                    <span className="help-item__name">{help}</span>
                    <span className="help-item__level">
                      {help === project.helpFocus ? 'Primary' : 'Supporting'}
                    </span>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)', marginTop: 'var(--sp-4)' }}>
                {project.skillsNeeded.map((skill) => (
                  <span className="tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">Creator</span>
                <span className="panel__spacer" />
                <Users width={15} height={15} style={{ color: 'var(--color-muted)' }} />
              </div>
              <div className="creator-card">
                <span className="creator-card__avatar" aria-hidden="true">
                  {(project.creator?.name || '?')
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <div>
                  <p className="creator-card__name">{project.creator?.name}</p>
                  <p className="creator-card__role">{project.creator?.role}</p>
                  <p className="creator-card__note">{project.creator?.note}</p>
                </div>
              </div>
              <p className="snapshot__caption" style={{ marginTop: 'var(--sp-3)' }}>
                Fictional identity, written for this demonstration. This person is not
                contactable.
              </p>
            </div>

            <div className="panel" style={{ background: 'var(--color-subtle)' }}>
              <span className="annotation">// NEXT STEP</span>
              <p style={{ fontSize: 'var(--fs-small)', marginTop: 'var(--sp-3)', marginBottom: 0 }}>
                {project.nextSteps[0]}
              </p>
              <Link
                to="/explore"
                className="link-arrow"
                style={{ marginTop: 'var(--sp-4)', fontSize: 'var(--fs-micro)' }}
              >
                See similar entries
                <ArrowUpRight width={13} height={13} />
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <RevivalDialog
        open={dialog === 'revival'}
        onClose={() => setDialog(null)}
        project={project}
      />
      <StewardshipDialog
        open={dialog === 'stewardship'}
        onClose={() => setDialog(null)}
        project={project}
      />
    </div>
  )
}
