import { JSDOM } from 'jsdom'
import React from 'react'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
global.window = dom.window
global.document = dom.window.document
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true })
global.HTMLElement = dom.window.HTMLElement
global.Element = dom.window.Element
global.Node = dom.window.Node
global.Event = dom.window.Event
global.PopStateEvent = dom.window.PopStateEvent
global.requestAnimationFrame = (cb) => setTimeout(cb, 0)
global.cancelAnimationFrame = (id) => clearTimeout(id)
dom.window.requestAnimationFrame = global.requestAnimationFrame
dom.window.cancelAnimationFrame = global.cancelAnimationFrame
dom.window.scrollTo = () => {}
dom.window.setInterval = () => 0
dom.window.clearInterval = () => {}
global.IS_REACT_ACT_ENVIRONMENT = true

let failures = 0
function check(name, condition, extra = '') {
  if (!condition) {
    failures += 1
    console.log(`FAIL  ${name} ${extra}`)
  } else {
    console.log(`ok    ${name}`)
  }
}

const HOUR = 60 * 60 * 1000

function read(key) {
  return JSON.parse(dom.window.localStorage.getItem(key) || 'null')
}

function seed(key, value) {
  dom.window.localStorage.setItem(key, JSON.stringify(value))
}

const ONBOARDED = { onboarded: true, categories: [], intention: '', tutorialDone: true }

const PLAN = {
  id: 'plan-restore-1',
  projectId: 'RE-001',
  projectSlug: 'open-orchard',
  projectTitle: 'Open Orchard',
  type: 'contribution',
  collaboration: 'contributors',
  role: 'Frontend',
  intention: 'Help with the shared plot layer.',
  note: 'Audit the mobile layout',
  createdAt: '2026-09-12T09:30:00.000Z',
  updatedAt: '2026-09-20T11:00:00.000Z',
  status: 'working',
  statusUpdatedAt: '2026-09-21T08:00:00.000Z',
  tasks: [
    { id: 'task-a', label: 'Review the existing work', done: true },
    { id: 'task-b', label: 'Audit the mobile layout', done: false },
  ],
}

const LOCAL_PROJECT = {
  id: 'RE-042',
  slug: 'my-local-project',
  title: 'My local project',
  category: 'dev',
  stage: 'Paused',
  description: 'A half-built thing.',
  summary: 'A half-built thing.',
  techStack: ['React'],
  completion: 40,
  priority: 4,
  updatedAt: '2026-09-01',
  featured: true,
  creator: { name: 'Tester', role: 'Local', note: '' },
}

const LOCAL_PLAN = {
  ...PLAN,
  id: 'plan-cascade-1',
  projectId: 'RE-042',
  projectSlug: 'my-local-project',
  projectTitle: 'My local project',
  createdAt: '2026-09-02T10:00:00.000Z',
}

// helpers -----------------------------------------------------------------

function receiptFor(ctx, kind) {
  return ctx.removals.find((receipt) => receipt.kind === kind)
}

async function drop(act, ctx, item, zone) {
  let result
  await act(async () => {
    result = ctx.performDrop(item, zone)
  })
  return result
}

async function confirm(act, ctx, zone = 'confirm-removal::t') {
  const pending = ctx.pendingRemoval
  return drop(
    act,
    ctx,
    { type: 'pending-removal', removalToken: pending?.token, label: pending?.label || 'x' },
    zone,
  )
}

async function main() {
  const { createRoot } = await import('react-dom/client')
  const act = React.act
  const { REProvider, useRE } = await import('../src/context/REContext.jsx')
  const { restoreSummary, isExpired, pruneRemovals } = await import('../src/utils/removals.js')

  let ctx = null
  function Probe() {
    ctx = useRE()
    return null
  }

  // ---- 1. a plan is removed and restored independently -------------------
  dom.window.localStorage.clear()
  seed('re:v1:preferences', ONBOARDED)
  seed('re:v1:plans', [PLAN])

  const container = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(React.createElement(REProvider, null, React.createElement(Probe)))
  })

  await drop(act, ctx, { type: 'plan', id: PLAN.id, label: PLAN.projectTitle }, 'remove-from-desk::r1')
  check('removal still needs confirmation', read('re:v1:plans').length === 1 && Boolean(ctx.pendingRemoval))

  const planRemoval = await confirm(act, ctx)
  check('confirming a plan removal deletes it', planRemoval.ok && read('re:v1:plans').length === 0)

  const planReceipt = receiptFor(ctx, 'plan')
  check('a plan removal leaves a receipt', Boolean(planReceipt))
  check('the receipt keeps the whole plan', planReceipt?.snapshot?.plan?.tasks?.length === 2)
  check(
    'the receipt is announced honestly',
    /\b2 tasks\b/.test(planRemoval.message) && /Restorable for 24 hours/.test(planRemoval.message),
  )
  check(
    'the receipt card is typed for the registry',
    planReceipt?.kind === 'plan' && planReceipt.snapshot.plan.status === 'working',
  )

  // an ordinary button cannot restore: only the zone path exists
  const before = read('re:v1:plans').length
  check('no restore helper is exposed to components', ctx.restoreRemoval === undefined)
  check('nothing restored without a drop', read('re:v1:plans').length === before)

  const restoredPlan = await drop(
    act,
    ctx,
    { type: 'removal-receipt', removalId: planReceipt.id, label: PLAN.projectTitle, restorable: true },
    'restore-records::z1',
  )
  check('a receipt drop restores the plan', restoredPlan.ok === true, JSON.stringify(restoredPlan))

  const afterRestore = read('re:v1:plans')
  check('exactly one plan returns', afterRestore.length === 1)
  check('the original plan ID survives', afterRestore[0]?.id === PLAN.id)
  check('the original status survives', afterRestore[0]?.status === 'working')
  check('the original timestamps survive', afterRestore[0]?.createdAt === PLAN.createdAt)
  check(
    'task identities and completion survive',
    afterRestore[0]?.tasks?.[0]?.id === 'task-a' && afterRestore[0]?.tasks?.[0]?.done === true,
  )
  check('the project reference survives', afterRestore[0]?.projectId === 'RE-001')
  check('the receipt is consumed', ctx.removals.length === 0)

  // ---- 2. a consumed receipt cannot be used twice -----------------------
  const replay = await drop(
    act,
    ctx,
    { type: 'removal-receipt', removalId: planReceipt.id, label: PLAN.projectTitle, restorable: true },
    'restore-records::z2',
  )
  check('replaying a consumed receipt is refused', replay.ok === false && read('re:v1:plans').length === 1)

  // ---- 3. a saved project restores without duplicating anything ---------
  const savedDrop = await drop(
    act,
    ctx,
    { type: 'saved-project', id: 'RE-001', label: 'Open Orchard' },
    'remove-from-desk::r2',
  )
  check('saved removal staged', savedDrop.ok === true)
  const savedRemoval = await confirm(act, ctx)
  const savedReceipt = receiptFor(ctx, 'saved')
  check('a saved removal leaves a receipt', Boolean(savedReceipt))

  const restoreSaved = await drop(
    act,
    ctx,
    { type: 'removal-receipt', removalId: savedReceipt.id, label: 'Open Orchard', restorable: true },
    'restore-records::z3',
  )
  check('a saved project restores', restoreSaved.ok === true)
  check('the saved list has it again', read('re:v1:saved').includes('RE-001'))
  check('no duplicate saved id', read('re:v1:saved').filter((id) => id === 'RE-001').length === 1)
  check('the archive project was never copied', ctx.projects.filter((p) => p.id === 'RE-001').length === 1)
  void savedRemoval

  // ---- 4. discarding a published project restores it with its plans -----
  seed('re:v1:projects', [LOCAL_PROJECT])
  seed('re:v1:plans', [LOCAL_PLAN])
  seed('re:v1:saved', ['RE-042'])
  await act(async () => {
    root.unmount()
  })
  const root2 = createRoot(container)
  await act(async () => {
    root2.render(React.createElement(REProvider, null, React.createElement(Probe)))
  })

  await drop(act, ctx, { type: 'local-project', id: 'RE-042', label: 'My local project' }, 'discard-project::d1')
  check(
    'the discard warning names the dependent plans',
    /1 revival plan/.test(ctx.pendingRemoval?.detail || ''),
    ctx.pendingRemoval?.detail,
  )
  const discarded = await confirm(act, ctx)
  check('discard removes the project', discarded.ok && read('re:v1:projects').length === 0)
  check('discard still cascades to its plans', read('re:v1:plans').length === 0)
  check('discard removes it from saved', !read('re:v1:saved').includes('RE-042'))

  const projectReceipt = receiptFor(ctx, 'project')
  check('the discard receipt holds project + plans', projectReceipt?.snapshot?.plans?.length === 1)
  check(
    'the discard message counts what went',
    /and 1 revival plan/.test(discarded.message),
    discarded.message,
  )
  check(
    'the summary promises original IDs',
    /original IDs/.test(restoreSummary(projectReceipt)),
  )

  const restoreProject = await drop(
    act,
    ctx,
    { type: 'removal-receipt', removalId: projectReceipt.id, label: 'My local project', restorable: true },
    'restore-records::z4',
  )
  check('a discard restores', restoreProject.ok === true, JSON.stringify(restoreProject))

  const projectsBack = read('re:v1:projects')
  const plansBack = read('re:v1:plans')
  check('the project returns once', projectsBack.length === 1 && projectsBack[0].id === 'RE-042')
  check('the dependent plan returns once', plansBack.length === 1 && plansBack[0].id === LOCAL_PLAN.id)
  check('the plan still points at the project', plansBack[0]?.projectId === 'RE-042')
  check('saved state is restored with it', read('re:v1:saved').includes('RE-042'))
  check(
    'project metadata survives',
    projectsBack[0]?.slug === 'my-local-project' && projectsBack[0]?.completion === 40,
  )
  check('the receipt is consumed', ctx.removals.length === 0)

  // ---- 5. duplicate safety: a stale receipt for live records -------------
  dom.window.localStorage.clear()
  seed('re:v1:preferences', ONBOARDED)
  seed('re:v1:plans', [PLAN])
  seed('re:v1:removals', [
    {
      id: 'removal-stale',
      kind: 'plan',
      label: 'Open Orchard',
      removedAt: new Date(Date.now() - HOUR).toISOString(),
      expiresAt: new Date(Date.now() + HOUR).toISOString(),
      snapshot: { plan: PLAN },
    },
  ])
  await act(async () => {
    root2.unmount()
  })
  const root3 = createRoot(container)
  await act(async () => {
    root3.render(React.createElement(REProvider, null, React.createElement(Probe)))
  })

  const staleResult = await drop(
    act,
    ctx,
    { type: 'removal-receipt', removalId: 'removal-stale', label: 'Open Orchard', restorable: true },
    'restore-records::z5',
  )
  check('a receipt whose plan already exists is refused', staleResult.ok === false)
  check('refusal leaves one plan, not two', read('re:v1:plans').length === 1)
  check('the stale receipt is still there to inspect', ctx.removals.length === 1)

  // ---- 6. expired receipts are pruned, not restored ---------------------
  dom.window.localStorage.clear()
  seed('re:v1:preferences', ONBOARDED)
  seed('re:v1:removals', [
    {
      id: 'removal-expired',
      kind: 'saved',
      label: 'Old removal',
      removedAt: new Date(Date.now() - 30 * HOUR).toISOString(),
      expiresAt: new Date(Date.now() - 6 * HOUR).toISOString(),
      snapshot: { projectId: 'RE-001' },
    },
    {
      id: 'removal-broken',
      kind: 'plan',
      label: 'Malformed',
      removedAt: 'not-a-date',
      expiresAt: 'not-a-date',
      snapshot: {},
    },
  ])
  await act(async () => {
    root3.unmount()
  })
  const root4 = createRoot(container)
  await act(async () => {
    root4.render(React.createElement(REProvider, null, React.createElement(Probe)))
  })

  check('expired and malformed receipts never reach the desk', ctx.removals.length === 0)
  check('the expired receipt is pruned from storage', (read('re:v1:removals') || []).length === 0)

  const expiredDrop = await drop(
    act,
    ctx,
    { type: 'removal-receipt', removalId: 'removal-expired', label: 'Old removal', restorable: true },
    'restore-records::z6',
  )
  check('an expired receipt cannot restore anything', expiredDrop.ok === false)
  check('nothing was written by the refused drop', read('re:v1:saved').length === 0)

  check('isExpired is honest about a missing date', isExpired({ snapshot: {} }) === true)
  check('pruneRemovals survives junk input', pruneRemovals('nope').length === 0)

  // ---- 7. receipts are capped -------------------------------------------
  const many = Array.from({ length: 8 }, (_, index) => ({
    id: `removal-${index}`,
    kind: 'saved',
    label: `Saved ${index}`,
    removedAt: new Date(Date.now() - index * 1000).toISOString(),
    expiresAt: new Date(Date.now() + HOUR).toISOString(),
    snapshot: { projectId: 'RE-001' },
  }))
  check('at most five receipts are kept', pruneRemovals(many).length === 5)
  check('the newest receipts are the ones kept', pruneRemovals(many)[0].id === 'removal-0')

  // ---- 8. invalid dependencies -----------------------------------------
  dom.window.localStorage.clear()
  seed('re:v1:preferences', ONBOARDED)
  seed('re:v1:removals', [
    {
      id: 'removal-orphan-plan',
      kind: 'plan',
      label: 'Orphan',
      removedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + HOUR).toISOString(),
      snapshot: { plan: { ...PLAN, projectId: 'RE-DELETED' } },
    },
    {
      id: 'removal-clash',
      kind: 'project',
      label: 'Clashing project',
      removedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + HOUR).toISOString(),
      snapshot: {
        project: { ...LOCAL_PROJECT, id: 'RE-901', slug: 'open-orchard' },
        plans: [],
      },
    },
  ])
  await act(async () => {
    root4.unmount()
  })
  const root5 = createRoot(container)
  await act(async () => {
    root5.render(React.createElement(REProvider, null, React.createElement(Probe)))
  })

  const orphan = await drop(
    act,
    ctx,
    { type: 'removal-receipt', removalId: 'removal-orphan-plan', label: 'Orphan', restorable: true },
    'restore-records::z7',
  )
  check('a plan whose project is gone is refused', orphan.ok === false)
  check('it is refused with a reason', /no longer here/.test(orphan.message || ''))
  check('no orphaned plan was written', read('re:v1:plans').length === 0)

  const clash = await drop(
    act,
    ctx,
    { type: 'removal-receipt', removalId: 'removal-clash', label: 'Clashing project', restorable: true },
    'restore-records::z8',
  )
  check('a project whose address is taken is refused', clash.ok === false)
  check('no duplicate address was written', read('re:v1:projects') === null || read('re:v1:projects').length === 0)

  // ---- 9. the zone contract itself -------------------------------------
  const { zoneAccepts } = await import('../src/dnd/zones.js')
  check(
    'restore accepts a live receipt',
    zoneAccepts('restore-records', { type: 'removal-receipt', removalId: 'x', restorable: true }) === true,
  )
  check(
    'restore rejects an expired receipt card',
    zoneAccepts('restore-records', { type: 'removal-receipt', removalId: 'x', expired: true }) === false,
  )
  check(
    'restore rejects a card it cannot honour',
    zoneAccepts('restore-records', { type: 'removal-receipt', removalId: 'x', restorable: false }) === false,
  )
  check(
    'restore rejects other card types',
    zoneAccepts('restore-records', { type: 'plan', planId: 'x' }) === false,
  )

  await act(async () => {
    root5.unmount()
  })

  // ---- 10. the rendered desk: card, zone, and no click-path ------------
  const { default: App } = await import('../src/app/App.jsx')
  dom.window.localStorage.clear()
  seed('re:v1:preferences', ONBOARDED)
  seed('re:v1:removals', [
    {
      id: 'removal-ui',
      kind: 'saved',
      label: 'Open Orchard',
      removedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      expiresAt: new Date(Date.now() + 5 * HOUR).toISOString(),
      snapshot: { projectId: 'RE-001', projectTitle: 'Open Orchard' },
    },
  ])
  dom.window.history.replaceState({}, '', '/desk?tab=removed')

  const appHost = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(appHost)
  const appRoot = createRoot(appHost)
  await act(async () => {
    appRoot.render(React.createElement(App))
  })

  check(
    'the URL opens the Recently removed tab',
    appHost.querySelector('#desk-tab-removed')?.getAttribute('aria-selected') === 'true',
  )
  check('the receipt card is rendered', appHost.querySelectorAll('.receipt-card').length === 1)
  check(
    'a restorable receipt is draggable',
    appHost.querySelector('.receipt-card')?.getAttribute('data-draggable') === 'true',
  )
  check(
    'the policy explains the window',
    /reversible for 24 hours/i.test(appHost.textContent),
  )
  check(
    'the receipt states what comes back',
    /Nothing is duplicated/i.test(appHost.querySelector('.receipt-card')?.textContent || ''),
  )

  const dock = dom.window.document.querySelector('.action-dock')
  check('the desk offers a Restore zone', Boolean(dock?.querySelector('[data-zone="restore-records"]')))

  // the keyboard path leads to the Restore zone and nowhere else
  const grip = dom.window.document.querySelector('.receipt-card .drag-grip')
  await act(async () => {
    grip?.focus()
  })
  await act(async () => {
    grip?.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', {
        code: 'Space',
        key: ' ',
        bubbles: true,
        cancelable: true,
      }),
    )
  })
  await new Promise((resolve) => setTimeout(resolve, 40))
  const liftedDock = dom.window.document.querySelector('.action-dock')
  check('Space lifts the receipt', liftedDock?.dataset.dragging === 'true')
  const zonesWhileLifted = Array.from(
    dom.window.document.querySelectorAll('.action-dock [data-zone]'),
  ).map((node) => node.dataset.zone)
  check(
    'only Restore accepts a receipt',
    zonesWhileLifted.length === 1 && zonesWhileLifted[0] === 'restore-records',
    zonesWhileLifted.join(','),
  )
  await act(async () => {
    dom.window.document.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true }),
    )
  })
  check('Escape cancels without restoring', (read('re:v1:saved') || []).length === 0)

  // clicking everything that is not a grip must not restore anything; this
  // runs last because some of those controls legitimately navigate.
  const clickable = Array.from(appHost.querySelectorAll('button')).filter(
    (button) =>
      !button.classList.contains('drag-grip') &&
      !button.disabled &&
      !/dismiss|close|cancel/i.test(button.getAttribute('aria-label') || button.textContent || ''),
  )
  for (const button of clickable) {
    await act(async () => {
      button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
    })
  }
  check('no ordinary button restored the record', (read('re:v1:saved') || []).length === 0)
  check('the receipt survives the clicking', (read('re:v1:removals') || []).length === 1)

  await act(async () => {
    appRoot.unmount()
  })
  appHost.remove()

  console.log(failures === 0 ? 'RESTORE PASS' : `RESTORE FAILURES: ${failures}`)
  if (failures > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
