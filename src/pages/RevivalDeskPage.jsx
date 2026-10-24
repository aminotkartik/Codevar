import { useMemo, useState } from 'react'
import { useRouter, Link } from '../app/router'
import { useRE } from '../context/REContext'
import { RevivalPlanCard } from '../components/revival/RevivalPlanCard'
import { ProjectDataCard } from '../components/canvas/ProjectDataCard'
import { DraggableDataCard } from '../components/canvas/DraggableDataCard'
import { ActionZone } from '../components/canvas/ActionZone'
import { EmptyState } from '../components/ui/EmptyState'
import { demoDataItem } from '../dnd/items'
import { ZONE } from '../dnd/zones'
import { ArrowUpRight, Plus, Trash, Grip } from '../components/ui/Icons'

const TABS = [
  { id: 'saved', label: 'Saved projects' },
  { id: 'plans', label: 'My revival plans' },
  { id: 'mine', label: 'My projects' },
]

const TAB_IDS = TABS.map((t) => t.id)

export function RevivalDeskPage() {
  const { navigate, params } = useRouter()
  const { projects, plans, localProjects, saved, prefs } = useRE()

  // Sections are addressable so a view can be linked or revisited.
  const [tab, setTab] = useState(() => {
    const requested = params.get('tab')
    return TAB_IDS.includes(requested) ? requested : 'saved'
  })

  const savedProjects = useMemo(
    () => projects.filter((p) => saved.includes(p.id)),
    [projects, saved],
  )

  const activePlans = useMemo(() => plans.filter((p) => p.status !== 'archived'), [plans])
  const archivedPlans = useMemo(() => plans.filter((p) => p.status === 'archived'), [plans])

  const taskStats = useMemo(() => {
    let total = 0
    let done = 0
    plans.forEach((plan) => {
      ;(plan.tasks || []).forEach((task) => {
        total += 1
        if (task.done) done += 1
      })
    })
    return { total, done }
  }, [plans])

  return (
    <div className="route-in canvas-page">
      <div className="container container--wide">
        <header className="canvas-head">
          <div className="canvas-head__text">
            <span className="eyebrow">Your workbench</span>
            <h1 className="canvas-head__title">Your next chapters.</h1>
            <p className="canvas-head__sub">
              Everything you have saved, prepared, or published locally. Pick up any card to
              remove it, complete a task, or update a plan — the dock below is the tool rail.
            </p>
          </div>
          <div className="canvas-head__legend" aria-label="Desk actions">
            <span className="canvas-head__legend-item">
              <Grip width={13} height={13} aria-hidden="true" />
              Drag to remove
            </span>
            <span className="canvas-head__legend-arrow" aria-hidden="true">
              →
            </span>
            <span className="canvas-head__legend-item">Confirm with a second drop</span>
          </div>
        </header>

        <div className="desk-grid">
          <div className="desk-main">
            <div
              className="tabs desk-tabs-wrap"
              role="tablist"
              aria-label="Revival Desk sections"
            >
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
                    <ProjectDataCard
                      key={project.id}
                      project={project}
                      variant="saved"
                      dragId={`desk-saved-${project.id}`}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nothing saved yet."
                  text="On Explore, drag a project card into Save to Revival Desk. It will wait here for you, in this browser only."
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
                    <RevivalPlanCard key={plan.id} plan={plan} dragId={`desk-plan-${plan.id}`} />
                  ))}
                  {archivedPlans.length > 0 && (
                    <div style={{ marginTop: 'var(--sp-5)' }}>
                      <div className="section-rule">
                        <span className="mono">Archived</span>
                      </div>
                      <div className="desk-list">
                        {archivedPlans.map((plan) => (
                          <RevivalPlanCard
                            key={plan.id}
                            plan={plan}
                            dragId={`desk-plan-${plan.id}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  title="No revival plans yet."
                  text="Drag a project into Offer to help or Take stewardship. Prepare the intent card, then drop it into Add plan to desk."
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
                    <div className="mine-item" key={project.id}>
                      <ProjectDataCard
                        project={project}
                        variant="local"
                        dragId={`desk-local-${project.id}`}
                      />
                      <p className="mine-item__note">
                        Published by you in this browser. Drag the card into{' '}
                        <b>Discard project</b> to begin a two-step removal.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="You haven't published a project yet."
                  text="RE is built for things that are half done. Complete a draft on the submission page and drag it into Publish to archive."
                  action={
                    <Link to="/submit" className="btn btn--primary">
                      <Plus width={15} height={15} />
                      Start a submission
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
                    <small> published</small>
                  </span>
                </div>
              </div>
              <p className="snapshot__caption">
                Task progress across all plans: {taskStats.done} of {taskStats.total} done.
                {prefs.tutorialDone ? ' Canvas tutorial completed.' : ''}
              </p>
            </div>

            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">How the desk changes</span>
              </div>
              <ul className="desk-rules">
                <li>Removing a saved project leaves the archive entry untouched.</li>
                <li>Removing a plan never deletes its project.</li>
                <li>Seed projects cannot be discarded from here.</li>
                <li>Tasks move with the dock, not with checkboxes.</li>
              </ul>
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
              <Link
                to="/submit"
                className="btn btn--primary btn--block"
                style={{ marginTop: 'var(--sp-3)' }}
              >
                Start a submission
                <ArrowUpRight width={15} height={15} />
              </Link>
            </div>

            <div className="panel panel--danger">
              <div className="panel__head">
                <span className="panel__title">Demo records</span>
                <span className="panel__spacer" />
                <Trash width={15} height={15} style={{ color: 'var(--color-accent)' }} />
              </div>
              <p className="snapshot__caption">
                This card represents everything stored under RE&apos;s local keys. Nothing
                is removed until the pending card is confirmed.
              </p>
              <DraggableDataCard
                dragId="desk-demo-records"
                item={demoDataItem()}
                className="demo-data-card"
                gripLabel="Drag the demo records card into Reset demo data"
              >
                <div className="demo-data-card__body">
                  <strong>RE demo records</strong>
                  <span>
                    {savedProjects.length} saved · {plans.length} plans · {localProjects.length}{' '}
                    published
                  </span>
                  <span className="demo-data-card__hint">Drag into Reset demo data</span>
                </div>
              </DraggableDataCard>
              <ActionZone zoneId={ZONE.RESET} variant="inline" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
