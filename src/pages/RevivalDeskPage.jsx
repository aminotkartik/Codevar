import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, Link } from '../app/router'
import { useRE } from '../context/REContext'
import { RevivalPlanCard } from '../components/revival/RevivalPlanCard'
import { RemovalReceiptCard } from '../components/canvas/RemovalReceiptCard'
import { ProjectDataCard } from '../components/canvas/ProjectDataCard'
import { DraggableDataCard } from '../components/canvas/DraggableDataCard'
import { ActionZone } from '../components/canvas/ActionZone'
import { EmptyState } from '../components/ui/EmptyState'
import { demoDataItem } from '../dnd/items'
import { ZONE } from '../dnd/zones'
import { PLAN_STATUSES } from '../context/REContext'
import { REMOVAL_TTL_HOURS, validateRestore } from '../utils/removals'
import { ArrowUpRight, Plus, Restore, Trash, Grip } from '../components/ui/Icons'

const TABS = [
  { id: 'saved', label: 'Saved projects' },
  { id: 'plans', label: 'My revival plans' },
  { id: 'mine', label: 'My projects' },
  { id: 'removed', label: 'Recently removed' },
]

const TAB_IDS = TABS.map((t) => t.id)

export function RevivalDeskPage() {
  const { navigate, params } = useRouter()
  const { projects, projectsById, projectsBySlug, plans, localProjects, saved, prefs, removals } =
    useRE()

  // Sections are addressable so a view can be linked or revisited.
  const requestedTab = params.get('tab')
  const [tab, setTab] = useState(() =>
    TAB_IDS.includes(requestedTab) ? requestedTab : 'saved',
  )
  const tabRefs = useRef({})

  // The URL wins: deep links, Back/Forward and hand-edited addresses all agree
  // with the visible section instead of only the first render.
  useEffect(() => {
    if (TAB_IDS.includes(requestedTab) && requestedTab !== tab) setTab(requestedTab)
  }, [requestedTab, tab])

  const selectTab = (id) => {
    if (id === tab) return
    setTab(id)
    // Keeping the entry count stable means Back leaves the desk rather than
    // stepping through sections the visitor never meant to navigate.
    navigate(`/desk?tab=${id}`, { replace: true })
  }

  const onTabKeyDown = (event) => {
    const index = TAB_IDS.indexOf(tab)
    let next = null
    if (event.key === 'ArrowRight') next = (index + 1) % TAB_IDS.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + TAB_IDS.length) % TAB_IDS.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = TAB_IDS.length - 1
    if (next === null) return
    event.preventDefault()
    const id = TAB_IDS[next]
    selectTab(id)
    tabRefs.current[id]?.focus()
  }

  const savedProjects = useMemo(
    () => projects.filter((p) => saved.includes(p.id)),
    [projects, saved],
  )

  const activePlans = useMemo(() => plans.filter((p) => p.status !== 'archived'), [plans])
  const archivedPlans = useMemo(() => plans.filter((p) => p.status === 'archived'), [plans])

  // One verdict per receipt, so the card, the count and the offer to restore
  // can never disagree about whether a snapshot is still usable.
  const receiptVerdicts = useMemo(
    () =>
      removals.map((receipt) => ({
        receipt,
        verdict: validateRestore(receipt, { saved, plans, projectsById, projectsBySlug }),
      })),
    [removals, saved, plans, projectsById, projectsBySlug],
  )
  const restorableCount = receiptVerdicts.filter((entry) => entry.verdict.ok).length

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
              Drag to change
            </span>
            <span className="canvas-head__legend-arrow" aria-hidden="true">
              →
            </span>
            <span className="canvas-head__legend-item">Drop into the tray</span>
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
                      ? plans.length
                      : item.id === 'removed'
                        ? removals.length
                        : localProjects.length
                const selected = tab === item.id
                return (
                  <button
                    key={item.id}
                    ref={(node) => {
                      tabRefs.current[item.id] = node
                    }}
                    type="button"
                    role="tab"
                    id={`desk-tab-${item.id}`}
                    className="tab"
                    aria-selected={selected}
                    aria-controls={`desk-panel-${item.id}`}
                    tabIndex={selected ? 0 : -1}
                    onKeyDown={onTabKeyDown}
                    onClick={() => selectTab(item.id)}
                  >
                    {item.label}
                    <span className="tab__count" aria-hidden="true">
                      {count}
                    </span>
                    <span className="sr-only">{` (${count})`}</span>
                  </button>
                )
              })}
            </div>

            <div
              id={`desk-panel-${tab}`}
              className="desk-panel"
              role="tabpanel"
              aria-labelledby={`desk-tab-${tab}`}
              tabIndex={0}
            >
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

            {tab === 'plans' && (
              <div className="status-legend" aria-hidden="false">
                <span className="mono">Plan status</span>
                <div className="status-legend__items">
                  {PLAN_STATUSES.map((status) => (
                    <span className="status-legend__item" key={status.id} data-status={status.id}>
                      <span className="status-mark__dot" aria-hidden="true" />
                      {status.label}
                    </span>
                  ))}
                </div>
                <span className="status-legend__note">
                  Drag a plan card onto a status tab in the tray below. No menu, no switch.
                </span>
              </div>
            )}

            {tab === 'plans' && plans.length === 0 && (
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
            )}

            {tab === 'plans' && activePlans.length > 0 && (
              <div className="desk-list">
                {activePlans.map((plan) => (
                  <RevivalPlanCard key={plan.id} plan={plan} dragId={`desk-plan-${plan.id}`} />
                ))}
              </div>
            )}

            {/* Archived plans are never hidden behind the active list: if the last
                active plan is archived, this is the only way back. */}
            {tab === 'plans' && archivedPlans.length > 0 && (
              <section className="desk-archive" aria-labelledby="desk-archive-heading">
                <div className="section-rule">
                  <span className="mono" id="desk-archive-heading">
                    Archived · {archivedPlans.length}
                  </span>
                </div>
                <p className="desk-archive__note">
                  Set aside, not deleted. Drag an archived plan onto{' '}
                  <b>Working locally</b> — or any other status — to bring it back.
                </p>
                <div className="desk-list">
                  {archivedPlans.map((plan) => (
                    <RevivalPlanCard key={plan.id} plan={plan} dragId={`desk-plan-${plan.id}`} />
                  ))}
                </div>
              </section>
            )}

            {tab === 'removed' && (
              <>
                <div className="receipt-policy">
                  <span className="receipt-policy__icon" aria-hidden="true">
                    <Restore width={14} height={14} />
                  </span>
                  <div>
                    <p className="receipt-policy__title">Removals are reversible for {REMOVAL_TTL_HOURS} hours.</p>
                    <p className="receipt-policy__text">
                      Confirming a removal keeps a snapshot of exactly what left your desk — the
                      record, its original ID, and anything that went with it. Drag a receipt into{' '}
                      <b>Restore</b> to write it back. After {REMOVAL_TTL_HOURS} hours, or once five
                      newer removals arrive, the snapshot is deleted and the card stops offering a
                      drop.
                    </p>
                  </div>
                </div>

                {removals.length > 0 ? (
                  <>
                    <div className="desk-list">
                      {receiptVerdicts.map(({ receipt, verdict }) => (
                        <RemovalReceiptCard
                          key={receipt.id}
                          receipt={receipt}
                          verdict={verdict}
                        />
                      ))}
                    </div>
                    {restorableCount > 0 ? (
                      <div className="receipt-restore">
                        <ActionZone zoneId={ZONE.RESTORE} variant="inline" />
                      </div>
                    ) : (
                      <p className="receipt-policy__text receipt-restore">
                        None of these can be restored right now — the receipts above say why.
                      </p>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="Nothing recently removed."
                    text={`When you remove a saved project, a revival plan, or a project you published, its receipt waits here for ${REMOVAL_TTL_HOURS} hours.`}
                    action={
                      <Link to="/explore" className="btn btn--primary">
                        Browse the archive
                        <ArrowUpRight width={15} height={15} />
                      </Link>
                    }
                  />
                )}
              </>
            )}

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
                <li>Drag a plan onto a status tab to change its local status.</li>
                <li>Drag a task slip onto Completed or Reopen task — there is no checkbox.</li>
                <li>Removing a saved project leaves the archive entry untouched.</li>
                <li>Removing a plan never deletes its project.</li>
                <li>Seed projects cannot be discarded from here.</li>
                <li>Archived plans stay on this page, so you can always bring one back.</li>
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
