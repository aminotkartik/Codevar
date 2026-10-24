import { useMemo, useState } from 'react'
import { useRouter, Link } from '../app/router'
import { useRE } from '../context/REContext'
import { RevivalPlanCard } from '../components/revival/RevivalPlanCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ProjectCard } from '../components/projects/ProjectCard'
import { ArrowUpRight, Plus, ArchiveBox } from '../components/ui/Icons'

const TABS = [
  { id: 'saved', label: 'Saved projects' },
  { id: 'plans', label: 'My revival plans' },
  { id: 'mine', label: 'My projects' },
]

const INTENTION_LABELS = {
  explore: 'explore the archive',
  contribute: "contribute to someone else's work",
  unfinished: 'share something unfinished of your own',
}

const TAB_IDS = TABS.map((t) => t.id)

export function RevivalDeskPage() {
  const { navigate, params } = useRouter()
  const { projects, saved, plans, localProjects, resetDemo, prefs, resetOnboarding, pushToast } = useRE()
  const [confirmReset, setConfirmReset] = useState(false)

  // Sections are addressable so a view can be linked or revisited.
  const [tab, setTab] = useState(() => {
    const requested = params.get('tab')
    return TAB_IDS.includes(requested) ? requested : 'saved'
  })

  const savedProjects = useMemo(
    () => projects.filter((p) => saved.includes(p.id)),
    [projects, saved],
  )

  const activePlans = useMemo(
    () => plans.filter((p) => p.status !== 'archived'),
    [plans],
  )
  const archivedPlans = useMemo(() => plans.filter((p) => p.status === 'archived'), [plans])

  const checklistStats = useMemo(() => {
    let total = 0
    let done = 0
    plans.forEach((p) => {
      ;(p.checklist || []).forEach((item) => {
        total += 1
        if (item.done) done += 1
      })
    })
    return { total, done }
  }, [plans])

  return (
    <div className="route-in">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">Your workbench</span>
          <h1 className="page-head__title">Your next chapters.</h1>
          <p className="page-head__sub">
            Everything you&apos;ve saved, offered to help with, or decided to explore further.
            Stored in this browser only.
          </p>
        </header>

        <div className="desk-grid">
          <div className="desk-main">
            <div className="tabs desk-tabs-wrap" role="tablist" aria-label="Revival Desk sections">
              {TABS.map((item) => {
                const count =
                  item.id === 'saved'
                    ? savedProjects.length
                    : item.id === 'plans'
                      ? activePlans.length
                      : localProjects.length
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    className="tab"
                    aria-selected={tab === item.id}
                    onClick={() => {
                      setTab(item.id)
                      navigate(`/desk?tab=${item.id}`, { replace: true })
                    }}
                  >
                    {item.label}
                    <span className="tab__count">{count}</span>
                  </button>
                )
              })}
            </div>

            {tab === 'saved' &&
              (savedProjects.length > 0 ? (
                <div className="desk-list">
                  {savedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nothing saved yet."
                  text="Your next great build is still out there. Bookmark anything that catches your eye and it will wait here for you."
                  action={
                    <Link to="/explore" className="btn btn--primary">
                      Browse the archive
                      <ArrowUpRight width={15} height={15} />
                    </Link>
                  }
                />
              ))}

            {tab === 'plans' &&
              (activePlans.length > 0 ? (
                <div className="desk-list">
                  {activePlans.map((plan) => (
                    <RevivalPlanCard key={plan.id} plan={plan} />
                  ))}
                  {archivedPlans.length > 0 && (
                    <div style={{ marginTop: 'var(--sp-5)' }}>
                      <div className="section-rule">
                        <span className="mono">Archived</span>
                      </div>
                      <div className="desk-list">
                        {archivedPlans.map((plan) => (
                          <RevivalPlanCard key={plan.id} plan={plan} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No revival plans yet."
                  text="When you record an interest in a project from its page, it lands here with a checklist you can work through."
                  action={
                    <Link to="/explore" className="btn btn--primary">
                      Find something to help with
                      <ArrowUpRight width={15} height={15} />
                    </Link>
                  }
                />
              ))}

            {tab === 'mine' &&
              (localProjects.length > 0 ? (
                <div className="desk-list">
                  {localProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="You haven't shared a project yet."
                  text="RE is built for things that are half done. If you have one sitting in a folder, it is worth handing on."
                  action={
                    <Link to="/submit" className="btn btn--primary">
                      <Plus width={15} height={15} />
                      Submit a project
                    </Link>
                  }
                />
              ))}
          </div>

          {/* ---------------- side ---------------- */}
          <aside className="desk-side" aria-label="Desk summary">
            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">At a glance</span>
              </div>
              <div className="snapshot">
                <div className="snapshot__ring">
                  <span className="snapshot__num">
                    {savedProjects.length}
                    <small> saved</small>
                  </span>
                </div>
                <div className="snapshot__ring">
                  <span className="snapshot__num">
                    {plans.length}
                    <small> plans</small>
                  </span>
                </div>
                <div className="snapshot__ring">
                  <span className="snapshot__num">
                    {localProjects.length}
                    <small> submitted</small>
                  </span>
                </div>
              </div>
              <p className="snapshot__caption">
                Checklist progress across all plans: {checklistStats.done} of{' '}
                {checklistStats.total} items.
              </p>
            </div>

            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">Your interests</span>
              </div>
              {prefs.categories.length > 0 ? (
                <>
                  <div className="chip-row">
                    {prefs.categories.map((id) => (
                      <span className="tag tag--accent" key={id}>
                        {id}
                      </span>
                    ))}
                  </div>
                  <p className="snapshot__caption" style={{ marginTop: 'var(--sp-3)' }}>
                    {prefs.intention
                      ? `You said you want to ${INTENTION_LABELS[prefs.intention] || 'explore'}.`
                      : 'These shape the front of the archive.'}
                  </p>
                  <button
                    type="button"
                    className="btn btn--sm"
                    style={{ marginTop: 'var(--sp-3)' }}
                    onClick={() => {
                      resetOnboarding()
                      pushToast('Interests cleared.')
                    }}
                  >
                    Reset interests
                  </button>
                </>
              ) : (
                <p className="snapshot__caption">
                  No interests recorded. The archive opens the same for everyone until you
                  choose a few.
                </p>
              )}
            </div>

            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">Share your own</span>
                <span className="panel__spacer" />
                <Plus width={15} height={15} style={{ color: 'var(--color-accent)' }} />
              </div>
              <p className="snapshot__caption">
                You don&apos;t have to finish it yourself for it to be worth sharing.
              </p>
              <Link to="/submit" className="btn btn--primary btn--block" style={{ marginTop: 'var(--sp-3)' }}>
                Submit a project
                <ArrowUpRight width={15} height={15} />
              </Link>
            </div>

            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">Demo data</span>
                <span className="panel__spacer" />
                <ArchiveBox width={15} height={15} style={{ color: 'var(--color-muted)' }} />
              </div>
              <p className="snapshot__caption">
                Clearing resets bookmarks, revival plans, submitted projects and onboarding
                preferences. Nothing else in this browser is touched.
              </p>
              <button
                type="button"
                className="btn btn--sm"
                style={{ marginTop: 'var(--sp-3)' }}
                onClick={() => setConfirmReset(true)}
              >
                Reset demo data
              </button>
            </div>

            <p className="step-foot__note">
              Demo build — every plan here is stored locally and no project owner has been
              contacted.
            </p>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemo()
          setConfirmReset(false)
          setTab('saved')
          pushToast('Demo data reset.')
          navigate('/desk?tab=saved', { replace: true })
        }}
        tone="danger"
        title="Reset demo data?"
        confirmLabel="Reset everything"
      >
        This clears your saved projects, revival plans, checklist progress, submitted
        projects and onboarding preferences. The archive itself is unchanged, and nothing in
        the rest of your browser is touched.
      </ConfirmDialog>
    </div>
  )
}
