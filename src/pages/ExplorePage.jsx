import { useEffect, useMemo, useState } from 'react'
import { useRouter, Link } from '../app/router'
import { useRE } from '../context/REContext'
import { SearchInput } from '../components/discovery/SearchInput'
import { SortControl } from '../components/discovery/SortControl'
import { FilterPanel, FilterDrawer } from '../components/discovery/FilterPanel'
import { ActiveFilterChips } from '../components/discovery/ActiveFilterChips'
import { ProjectCard } from '../components/projects/ProjectCard'
import { EmptyState } from '../components/ui/EmptyState'
import {
  applyFilters,
  countActiveFilters,
  normaliseQuery,
} from '../utils/projectFilters'
import {
  sortProjects as sortList,
  applyInterestBoost,
} from '../utils/projectSorting'
import { Filter, Search as SearchIcon } from '../components/ui/Icons'

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
  const { projects, prefs, localProjects } = useRE()

  const [filters, setFilters] = useState(() => filtersFromParams(params))
  const [drawerOpen, setDrawerOpen] = useState(false)

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
    update({ ...filters, [facet]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] })
  }
  const clearAll = () => update({ ...filters, category: [], stage: [], help: [], availability: [] })
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

  // Projects from the user's own interests, shown above the rest when nothing is filtered.
  const recommended = useMemo(() => {
    if (!prefs.categories.length) return []
    const matched = applyFilters(projects, { ...filters, category: prefs.categories })
    return sortList(matched, 'help').slice(0, 3)
  }, [projects, filters, prefs.categories])

  const showRecommendations =
    prefs.categories.length > 0 &&
    !filters.q &&
    activeCount === 0 &&
    recommended.length > 0 &&
    filtered.length > recommended.length

  const query = normaliseQuery(filters.q)

  return (
    <div className="route-in">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">The archive</span>
          <h1 className="page-head__title">Find something worth finishing.</h1>
          <p className="page-head__sub">
            Browse unfinished projects, find a challenge that matches your skills, and discover
            where you can make a difference.
          </p>
        </header>

        <div className="explore-layout">
          {/* ---------------- filters ---------------- */}
          <aside className="filter-col" aria-label="Filters">
            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">Filters</span>
                <span className="panel__spacer" />
                {activeCount > 0 && (
                  <button type="button" className="link-arrow" onClick={clearAll}>
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel projects={projects} filters={filters} onChange={setFacet} />
            </div>
          </aside>

          {/* ---------------- results ---------------- */}
          <div className="explore-main">
            <div className="explore-toolbar">
              <SearchInput
                id="explore-search"
                value={filters.q}
                onChange={(value) => update({ ...filters, q: value })}
                placeholder="Search projects, skills, ideas..."
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
                {activeCount > 0 && (
                  <span className="chip__count" style={{ color: 'var(--color-accent)' }}>
                    {activeCount}
                  </span>
                )}
              </button>
            </div>

            <ActiveFilterChips
              filters={filters}
              onRemove={toggleFacetValue}
              onClearAll={clearAll}
            />

            <p className="result-meta" aria-live="polite">
              <b>{filtered.length}</b> of {projects.length} projects
              {query ? (
                <>
                  {' '}
                  for <b>&ldquo;{filters.q}&rdquo;</b>
                </>
              ) : null}
              {localProjects.length > 0 && (
                <>
                  {' '}
                  · <b>{localProjects.length}</b> submitted by you
                </>
              )}
            </p>

            {/* ---------------- recommendations ---------------- */}
            {showRecommendations && (
              <section style={{ marginBottom: 'var(--sp-7)' }}>
                <div className="section-rule">
                  <span className="mono">Matched for you</span>
                </div>
                <h2 className="section-heading__title" style={{ fontSize: 'var(--fs-h3)' }}>
                  From the areas you picked
                </h2>
                <div className="cards-grid" style={{ marginTop: 'var(--sp-4)' }}>
                  {recommended.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            )}

            {/* ---------------- results or empty state ---------------- */}
            {sorted.length > 0 ? (
              <div className="cards-grid">
                {sorted.map((project) => (
                  <ProjectCard key={project.id} project={project} />
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
                        onClick={() => clearQueryAndFilters()}
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

            <p className="step-foot__note" style={{ marginTop: 'var(--sp-6)' }}>
              <SearchIcon width={13} height={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />
              Search covers titles, descriptions, categories, technologies, skills and open tasks.
            </p>
          </div>
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
