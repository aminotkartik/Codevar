import { useEffect, useMemo } from 'react'
import { useRouter, Link } from '../app/router'
import { useRE } from '../context/REContext'
import { SectionHeading } from '../components/ui/SectionHeading'
import { StageBadge } from '../components/ui/StageBadge'
import { ProgressBar } from '../components/ui/ProgressBar'

import { ProjectDataCard } from '../components/canvas/ProjectDataCard'
import { ProjectCover } from '../components/projects/ProjectCover'
import { CATEGORIES, categoryLabel, categoryColor } from '../data/categories'
import { countByFacet } from '../utils/projectFilters'
import { ArrowUpRight, Layers, Handoff, Branch } from '../components/ui/Icons'

const STEPS = [
  {
    num: '01 / DISCOVER',
    title: 'Discover',
    text: 'Explore ideas, prototypes and products waiting for another chance.',
    icon: Layers,
  },
  {
    num: '02 / UNDERSTAND',
    title: 'Understand',
    text: 'See what’s complete, what’s missing, and what the original creator learned.',
    icon: Handoff,
  },
  {
    num: '03 / REVIVE',
    title: 'Revive',
    text: 'Offer your skills, propose a next step, or take responsibility for continuing the work.',
    icon: Branch,
  },
]

export function HomePage() {
  const { pathname } = useRouter()
  const { projects } = useRE()

  const categoryCounts = useMemo(() => countByFacet(projects, 'category'), [projects])
  const featured = useMemo(() => projects.filter((p) => p.featured), [projects])
  const heroProject = useMemo(
    () => projects.find((p) => p.id === 'RE-001') || featured[0] || projects[0],
    [projects, featured],
  )
  const shelfProjects = useMemo(() => featured.slice(0, 4), [featured])

  // Support deep links like /#how-it-works
  useEffect(() => {
    if (pathname !== '/') return
    if (!window.location.hash.includes('how-it-works')) return
    const target = document.getElementById('how-it-works')
    if (target) window.setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
  }, [pathname])

  return (
    <div className="route-in">
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="container">
          <div className="hero__grid">
            <div className="hero__copy">
              <span className="eyebrow">An open archive of unfinished possibilities</span>
              <h1 className="hero__title">
                Good ideas deserve
                <br />
                a <em>second draft.</em>
              </h1>
              <p className="hero__lead">
                Discover projects that stopped halfway. Explore what&apos;s already built,
                find where your skills fit, and help something promising come to life.
              </p>

              <div className="hero__cta-row">
                <Link to="/explore" className="btn btn--primary btn--lg">
                  Explore projects
                  <ArrowUpRight width={16} height={16} />
                </Link>
                <Link to="/submit" className="link-arrow">
                  Share an unfinished project
                  <ArrowUpRight width={14} height={14} />
                </Link>
              </div>

              <p className="hero__tagline">
                <span className="cont-mark" aria-hidden="true" />
                Revive ideas. Find collaborators. Build again.
              </p>
            </div>

            {heroProject && (
              <div className="specimen-wrap">
                <div className="specimen">
                  <div className="specimen__head">
                    <span className="mono">RE / ARCHIVE 001</span>
                    <span className="annotation annotation--muted">Featured entry</span>
                  </div>

                  <ProjectCover
                    project={heroProject}
                    ratio="3x2"
                    className="specimen__photo"
                    eager
                    alt={`${heroProject.title} — ${categoryLabel(heroProject.category)} archive photograph`}
                  />

                  <h2 className="specimen__title">{heroProject.title}</h2>

                  <div className="specimen__meta-row">
                    <span style={{ color: categoryColor(heroProject.category) }}>
                      {categoryLabel(heroProject.category)}
                    </span>
                    <StageBadge stage={heroProject.stage} />
                  </div>

                  <p className="specimen__desc">{heroProject.description}</p>

                  <div className="specimen__tags">
                    {heroProject.techStack.slice(0, 3).map((tech) => (
                      <span className="tag" key={tech}>
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="specimen__strip">
                    <span style={{ flex: 1 }}>
                      <ProgressBar
                        value={heroProject.completion}
                        tone="accent"
                        label={`${heroProject.completion} per cent complete`}
                      />
                    </span>
                    <span className="mono" style={{ whiteSpace: 'nowrap' }}>
                      {heroProject.completion}% built
                    </span>
                  </div>

                  <div className="specimen__annotation">
                    <span className="annotation">// What&apos;s missing</span>
                    <span>{heroProject.helpFocus}</span>
                  </div>

                  <div className="specimen__link">
                    <Link to={`/projects/${heroProject.slug}`} className="link-arrow">
                      Open this entry
                      <ArrowUpRight width={15} height={15} />
                    </Link>
                    <span className="specimen__drag-note">
                      Drag a card on Explore to act on it
                    </span>
                  </div>
                </div>

                <div className="specimen__sheet">
                  <strong>Handoff snapshot</strong>
                  <span>4 / 5 documented</span>
                  <span>Updated 04 SEP 2026</span>
                  <span>Stopped before collaboration</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= FEATURED SHELF ================= */}
      <section className="section">
        <div className="container">
          <div className="section-rule">
            <span className="mono">The shelf</span>
          </div>
          <SectionHeading
            eyebrow="Worth picking up"
            title="Unfinished projects with something already in motion."
          />

          <div className="shelf-grid" style={{ marginTop: 'var(--sp-7)' }}>
            <div className="shelf-feature">
              {shelfProjects[0] && (
                <ProjectDataCard
                  project={shelfProjects[0]}
                  dragId={`shelf-${shelfProjects[0].id}`}
                  showCover
                />
              )}
            </div>
            <div className="shelf-side">
              {shelfProjects.slice(1).map((project) => (
                <ProjectDataCard
                  key={project.id}
                  project={project}
                  dragId={`shelf-${project.id}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="section section--subtle" id="how-it-works">
        <div className="container">
          <div className="section-rule">
            <span className="mono">How RE works</span>
          </div>
          <SectionHeading
            title="Three steps from curiosity to a working plan."
            sub="No pitch, no account, no promise of ownership. You look at what exists, decide whether you can help, and record what you intend to do."
          />

          <div className="how-grid" style={{ marginTop: 'var(--sp-7)' }}>
            {STEPS.map((step) => (
              <div className="how-step" key={step.num}>
                <div>
                  <span className="how-step__num">{step.num}</span>
                  <step.icon width={26} height={26} style={{ marginTop: 'var(--sp-3)', color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3 className="how-step__title">{step.title}</h3>
                  <p className="how-step__text">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="section">
        <div className="container">
          <div className="section-rule">
            <span className="mono">Category index</span>
          </div>
          <SectionHeading
            eyebrow="Browse by discipline"
            title="A place for every kind of unfinished thing."
            sub="Counts are calculated from the archive itself — nothing is padded."
          />

          <div className="cat-rail" style={{ marginTop: 'var(--sp-7)' }}>
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/explore?category=${cat.id}`}
                className="cat-tile"
                style={{ '--cat-color': cat.color }}
              >
                <span className="cat-tile__index">{String(i + 1).padStart(2, '0')}</span>
                <span className="cat-tile__mark" style={{ borderColor: cat.color }} />
                <span className="cat-tile__body">
                  <span className="cat-tile__name">{cat.label}</span>
                  <span className="cat-tile__count">
                    {categoryCounts[cat.id] || 0} in the archive
                  </span>
                </span>
                <ArrowUpRight className="cat-tile__arrow" width={18} height={18} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CLOSING ================= */}
      <section className="section section--dark">
        <div className="container">
          <div className="closing">
            <div className="closing__copy">
              <span className="eyebrow" style={{ color: '#d8b49c' }}>
                Before you go
              </span>
              <h2 className="closing__title">
                Your unfinished idea might be someone&apos;s next big thing.
              </h2>
              <p className="closing__sub">
                You don&apos;t have to finish everything you start. Sometimes the most valuable
                next step is letting someone else continue.
              </p>
              <div style={{ marginTop: 'var(--sp-6)' }}>
                <Link to="/submit" className="btn btn--primary btn--lg">
                  Give your project another chance
                  <ArrowUpRight width={16} height={16} />
                </Link>
              </div>
            </div>

            <div className="closing__side">
              <div className="stat">
                <b>{projects.length}</b>
                <span>Entries in the archive</span>
              </div>
              <div className="stat">
                <b>{projects.filter((p) => p.openToStewardship).length}</b>
                <span>Open to stewardship</span>
              </div>
              <div className="stat">
                <b>0</b>
                <span>Requests sent · demo build</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
