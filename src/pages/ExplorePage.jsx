import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, Link } from '../app/router'
import { useRE } from '../context/REContext'
import { SearchInput } from '../components/discovery/SearchInput'
import { SortControl } from '../components/discovery/SortControl'
import { FilterPanel, FilterDrawer } from '../components/discovery/FilterPanel'
import { ActiveFilterChips } from '../components/discovery/ActiveFilterChips'
import { ProjectDataCard } from '../components/canvas/ProjectDataCard'
import { Inspector } from '../components/canvas/Inspector'
import { EmptyState } from '../components/ui/EmptyState'
import {
  applyFilters,
  countActiveFilters,
  normaliseQuery,
} from '../utils/projectFilters'
import { DEFAULT_SORT, normaliseSortId, orderForView, sortOption } from '../utils/projectSorting'
import { Filter, Grip, Search as SearchIcon, Sort } from '../components/ui/Icons'

const FACETS = ['category', 'stage', 'help', 'availability']
const SORT_PARAM = 'sort'

/**
 * Read discovery state from the URL.
 * The sort id is normalised here so a stale link can never put the control in
 * an unknown state while the list falls back to a different order.
 */
function filtersFromParams(params) {
  return {
    q: params.get('q') || '',
    category: params.getAll('category'),
    stage: params.getAll('stage'),
    help: params.getAll('help'),
    availability: params.getAll('availability'),
    sort: normaliseSortId(params.get(SORT_PARAM)),
  }
}

function filtersToParams(filters) {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  FACETS.forEach((facet) => {
    ;(filters[facet] || []).forEach((value) => params.append(facet, value))
  })
  const sort = normaliseSortId(filters.sort)
  if (sort !== DEFAULT_SORT) params.set(SORT_PARAM, sort)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function ExplorePage() {
  const { pathname, params, navigate } = useRouter()
  const { projects, prefs, localProjects } = useRE()

  const [filters, setFilters] = useState(() => filtersFromParams(params))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const lastWritten = useRef(`${window.location.pathname}${window.location.search}`)

  // Keep local state in step with the URL (back, forward, deep link).
  useEffect(() => {
    setFilters(filtersFromParams(params))

    // Repair hand-written or legacy URLs, e.g. ?sort=updated.
    const rawSort = params.get(SORT_PARAM)
    if (rawSort !== null && rawSort !== normaliseSortId(rawSort)) {
      const repaired = filtersFromParams(params)
      navigate(`${pathname}${filtersToParams(repaired)}`, { replace: true, scroll: 'never' })
    }
  }, [params, pathname, navigate])

  /**
   * Write discovery state to the URL.
   *
   * Facet and sort changes push a history entry, so Back and Forward restore
   * the previous ordering. Typing in the search box replaces, so a single
   * query does not leave twelve entries behind.
   */
  const update = (next, { history = 'push' } = {}) => {
    setFilters(next)
    const target = `${pathname}${filtersToParams(next)}`
    if (target === `${window.location.pathname}${window.location.search}`) return
    lastWritten.current = target
    navigate(target, { replace: history !== 'push', scroll: 'never' })
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
  const setQuery = (q) => update({ ...filters, q }, { history: 'replace' })
  const setSort = (sort) => update({ ...filters, sort: normaliseSortId(sort) })
  const clearAll = () =>
    update({ ...filters, category: [], stage: [], help: [], availability: [] })
  const clearQuery = () => setQuery('')
  const clearQueryAndFilters = () =>
    update({ q: '', category: [], stage: [], help: [], availability: [], sort: DEFAULT_SORT })

  const activeCount = countActiveFilters(filters)
  const filtered = useMemo(() => applyFilters(projects, filters), [projects, filters])

  // Single source of truth for the rendered order.
  const sorted = useMemo(
    () => orderForView(filtered, filters.sort, prefs.categories),
    [filtered, filters.sort, prefs.categories],
  )

  const query = normaliseQuery(filters.q)
  const activeSort = sortOption(filters.sort)
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
              Pick up a card
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
                onChange={setQuery}
                placeholder="Search projects, skills, ideas…"
              />
              <SortControl id="explore-sort" value={filters.sort} onChange={setSort} />
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
              <span className="worktable-head__hint" aria-live="polite">
                <Sort width={12} height={12} aria-hidden="true" />
                {activeSort.short}: {activeSort.description}
              </span>
            </div>

            {sorted.length > 0 ? (
              <div className="worktable-grid" key={filters.sort} data-sort={filters.sort}>
                {sorted.map((project, index) => (
                  <ProjectDataCard
                    key={project.id}
                    project={project}
                    ordinal={index + 1}
                    dragId={`archive-${project.id}`}
                    selected={selected?.id === project.id}
                    onInspect={() => setSelectedId(project.id)}
                    sortKey={activeSort.metric(project)}
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
              tasks. Filters and sorting only change what is on the table — never your desk.
            </p>
          </section>

          {/* ---------------- inspector ---------------- */}
          <aside className="canvas-inspector" aria-label="Inspector">
            {selected ? (
              <Inspector project={selected} ordinal={sorted.indexOf(selected) + 1} />
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
}
