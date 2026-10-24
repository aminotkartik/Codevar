import { useEffect, useMemo, useState } from 'react'
import { useRouter, Link } from '../app/router'
import { useRE } from '../context/REContext'
import { SearchInput } from '../components/discovery/SearchInput'
import { SortControl } from '../components/discovery/SortControl'
import { FilterPanel, FilterDrawer } from '../components/discovery/FilterPanel'
import { ActiveFilterChips } from '../components/discovery/ActiveFilterChips'
import { ProjectDataCard } from '../components/canvas/ProjectDataCard'
import { DraggableDataCard } from '../components/canvas/DraggableDataCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StageBadge } from '../components/ui/StageBadge'
import { archiveLabel, projectItem } from '../dnd/items'
import { categoryLabel, categoryColor, AVAILABILITY_LABELS } from '../data/categories'
import {
  applyFilters,
  availabilityOf,
  countActiveFilters,
  normaliseQuery,
} from '../utils/projectFilters'
import { sortProjects as sortList, applyInterestBoost } from '../utils/projectSorting'
import { Filter, Grip, Search as SearchIcon, ArrowUpRight } from '../components/ui/Icons'

const FACETS = ['category', 'stage', 'help', 'availability']

function filtersFromParams(params) {
  return {
    q: params.get('q') || '',
    category: params.getAll('category'),
    stage: params.getAll('stage'),
    help: params.getAll('help'),
    availability: params.getAll('availability'),
    sort: params.get('sort') || 'curated',
  }
}

function filtersToParams(filters) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  FACETS.forEach((facet) => {
    filters[facet].forEach((value) => params.append(facet, value))
  })
  if (filters.sort !== 'curated') params.set('sort', filters.sort)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function ExplorePage() {
  const { pathname, params, navigate } = useRouter()
  const { projects, prefs, localProjects, isSaved } = useRE()

  const [filters, setFilters] = useState(() => filtersFromParams(params))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  // Keep local state in step with the URL (back, forward, deep link).
  useEffect(() => {
    setFilters(filtersFromParams(params))
  }, [params])

  const update = (next, { replace = true } = {}) => {
    setFilters(next)
    navigate(`${pathname}${filtersToParams(next)}`, { replace })
  }

  const setFacet = (facet, values) => update({ ...filters, [facet]: values })
  const toggleFacetValue = (facet, value) => {
    const current = filters[facet]
    update({
      ...filters,
      [facet]: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    })
  }
  const clearAll = () =>
    update({ ...filters, category: [], stage: [], help: [], availability: [] })
  const clearQuery = () => update({ ...filters, q: '' })

  const activeCount = countActiveFilters(filters)
  const filtered = useMemo(() => applyFilters(projects, filters), [projects, filters])

  const sorted = useMemo(() => {
    const ordered = sortList(filtered, filters.sort)
    // Interests only reorder the default curated view — explicit sorts win.
    return filters.sort === 'curated'
      ? applyInterestBoost(ordered, prefs.categories)
      : ordered
  }, [filtered, filters.sort, prefs.categories])

  const query = normaliseQuery(filters.q)
  const selected = useMemo(
    () => sorted.find((project) => project.id === selectedId) || sorted[0] || null,
    [sorted, selectedId],
  )

  return (
    <div className="route-in canvas-page">
      <div className="container container--wide">
        <header className="canvas-head">
          <div className="canvas-head__text">
            <span className="eyebrow">The archive · worktable</span>
            <h1 className="canvas-head__title">Find something worth finishing.</h1>
            <p className="canvas-head__sub">
              Every card can be picked up. Inspect an entry with the link, or take the card
              by its grip and drop it into an Action Zone to act on it.
            </p>
          </div>
          <div className="canvas-head__legend" aria-label="How the worktable works">
            <span className="canvas-head__legend-item">
              <Grip width={13} height={13} aria-hidden="true" />
              Drag a card
            </span>
            <span className="canvas-head__legend-arrow" aria-hidden="true">
              →
            </span>
            <span className="canvas-head__legend-item">Drop into a zone</span>
          </div>
        </header>

        <div className="canvas-layout">
          {/* ---------------- library rail ---------------- */}
          <aside className="canvas-rail" aria-label="Library filters and sorting">
            <div className="canvas-rail__tools">
              <SearchInput
                id="explore-search"
                value={filters.q}
                onChange={(value) => update({ ...filters, q: value })}
                placeholder="Search projects, skills, ideas…"
              />
              <SortControl
                id="explore-sort"
                value={filters.sort}
                onChange={(value) => update({ ...filters, sort: value })}
              />
              <button
                type="button"
                className="btn filter-drawer-btn"
                onClick={() => setDrawerOpen(true)}
                aria-label={`Open filters${activeCount ? `, ${activeCount} active` : ''}`}
              >
                <Filter width={16} height={16} />
                Filters
                {activeCount > 0 && <span className="chip__count">{activeCount}</span>}
              </button>
            </div>

            <ActiveFilterChips
              filters={filters}
              onRemove={toggleFacetValue}
              onClearAll={clearAll}
            />

            <div className="canvas-rail__panel">
              <div className="canvas-rail__head">
                <span className="mono">Filters</span>
                {activeCount > 0 && (
                  <button type="button" className="link-arrow" onClick={clearAll}>
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel projects={projects} filters={filters} onChange={setFacet} />
            </div>

            <p className="result-meta result-meta--rail" aria-live="polite">
              <b>{filtered.length}</b> of {projects.length} entries
              {query ? (
                <>
                  {' '}
                  for <b>&ldquo;{filters.q}&rdquo;</b>
                </>
              ) : null}
            </p>
            {localProjects.length > 0 && (
              <p className="canvas-rail__note">
                {localProjects.length} published by you · in this browser only
              </p>
            )}
          </aside>

          {/* ---------------- worktable ---------------- */}
          <section className="canvas-worktable" aria-label="Projects on the worktable">
            <div className="worktable-head">
              <span className="mono">
                Worktable / {sorted.length} {sorted.length === 1 ? 'entry' : 'entries'}
              </span>
              <span className="worktable-head__hint">
                Drag to act
                {selected ? ` · inspecting ${archiveLabel(selected)}` : ''}
              </span>
            </div>

            {sorted.length > 0 ? (
              <div className="worktable-grid">
                {sorted.map((project) => (
                  <ProjectDataCard
                    key={project.id}
                    project={project}
                    dragId={`archive-${project.id}`}
                    selected={selected?.id === project.id}
                    onInspect={() => setSelectedId(project.id)}
                    showCover={false}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title={
                  query
                    ? `Nothing matches “${filters.q}”.`
                    : activeCount > 0
                      ? 'These filters are too specific.'
                      : 'The archive is empty.'
                }
                text={
                  query
                    ? 'No entry combines that search with the filters you have active. Try removing a filter, or searching a broader word.'
                    : 'No project matches the combination of filters you have selected. Try removing one.'
                }
                action={
                  <>
                    {(query || activeCount > 0) && (
                      <button
                        type="button"
                        className="btn btn--primary"
                        onClick={clearQueryAndFilters}
                      >
                        Clear search and filters
                      </button>
                    )}
                    <Link to="/explore" className="btn">
                      Browse everything
                    </Link>
                  </>
                }
              />
            )}

            <p className="step-foot__note worktable-foot">
              <SearchIcon
                width={13}
                height={13}
                style={{ verticalAlign: '-2px', marginRight: 6 }}
              />
              Search covers titles, descriptions, categories, technologies, skills and open
              tasks. Filters change what is on the table; they never change your desk.
            </p>
          </section>

          {/* ---------------- inspector ---------------- */}
          <aside className="canvas-inspector" aria-label="Inspector">
            {selected ? (
              <Inspector project={selected} saved={isSaved(selected.id)} />
            ) : (
              <div className="inspector-empty">
                <span className="mono">Inspector</span>
                <p>
                  Nothing is selected. Hover or focus a card to inspect it here, or use the
                  link on any card to open its full entry.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        projects={projects}
        filters={filters}
        onChange={setFacet}
      />
    </div>
  )

  function clearQueryAndFilters() {
    update({ q: '', category: [], stage: [], help: [], availability: [], sort: 'curated' })
  }
}

/* --------------------------------------------------------------------------
   Inspector — the contextual read-out for the card currently under attention.
   It carries its own draggable specimen, so a project can be acted on from
   here without leaving the worktable.
   -------------------------------------------------------------------------- */
function Inspector({ project, saved }) {
  const available = availabilityOf(project)

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

      <p className="inspector__summary">{project.summary}</p>

      <div className="inspector__progress">
        <ProgressBar
          value={project.completion}
          showValue
          tone="accent"
          label={`${project.completion} per cent complete`}
        />
        <span className="inspector__progress-note">How far the work has come</span>
      </div>

      <dl className="inspector__rows">
        <div>
          <dt>Needs</dt>
          <dd>{project.helpFocus}</dd>
        </div>
        <div>
          <dt>Skills wanted</dt>
          <dd>{project.skillsNeeded.slice(0, 3).join(' · ') || 'Not specified'}</dd>
        </div>
        <div>
          <dt>Next step</dt>
          <dd>{project.nextSteps[0]}</dd>
        </div>
        <div>
          <dt>Availability</dt>
          <dd>{available.map((a) => AVAILABILITY_LABELS[a]).join(' · ') || 'Not open'}</dd>
        </div>
      </dl>

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
              {saved ? 'On your desk — drag to remove it there' : project.stage}
            </span>
          </div>
        </DraggableDataCard>
        <p className="inspector__hint">
          Drag this card into <b>Save to Revival Desk</b>, <b>Offer to help</b> or{' '}
          <b>Take stewardship</b>. The zones are in the dock at the bottom of the screen.
        </p>
        <Link to={`/projects/${project.slug}`} className="link-arrow inspector__open">
          Open the full entry
          <ArrowUpRight width={13} height={13} />
        </Link>
      </div>
    </div>
  )
}
