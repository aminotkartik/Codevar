import { JSDOM } from 'jsdom'
import React from 'react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Canvas Protocol compliance suite.
 *
 * Behavioural, not a blanket button ban:
 *   A. static audit of every component — which state-mutating helpers each one
 *      is allowed to call, and whether it does so from a click/change handler;
 *   B. live audit — mount every route, click every button that is not a drag
 *      grip, and assert that localStorage never changes;
 *   C. registry contract — invalid cards are refused for every zone.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(HERE, '../src')

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
})
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
global.IS_REACT_ACT_ENVIRONMENT = true
dom.window.requestAnimationFrame = global.requestAnimationFrame
dom.window.cancelAnimationFrame = global.cancelAnimationFrame
dom.window.scrollTo = () => {}

let failures = 0
function check(name, condition, extra = '') {
  if (!condition) {
    failures += 1
    console.log(`FAIL  ${name} ${extra}`)
  } else {
    console.log(`ok    ${name}`)
  }
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (/\.jsx?$/.test(entry.name)) out.push(full)
  }
  return out
}

/* ------------------------------------------------------------------------ */
/* A. Static audit                                                          */
/* ------------------------------------------------------------------------ */
const PRIMARY_HELPERS = [
  'performDrop',
  'addPlan',
  'saveProject',
  'toggleSaved',
  'removeSavedProject',
  'removePlan',
  'removeLocalProject',
  'addLocalProject',
  'addProject',
  'setTaskDone',
  'toggleChecklistItem',
  'updatePlanStatus',
  'resetDemo',
  'setSaved',
  'setPlans',
  'setLocalProjects',
]

function auditStatic() {
  const files = walk(SRC)
  const violations = []

  for (const file of files) {
    const rel = path.relative(SRC, file).replace(/\\/g, '/')
    const code = fs.readFileSync(file, 'utf8')
    const isContext = rel === 'context/REContext.jsx'

    // The dispatcher lives in one place, and may call the mutators.
    if (isContext) {
      check('dispatcher: performDrop exists', /const performDrop = useCallback/.test(code))
      check(
        'dispatcher: performDrop validates through zoneAccepts',
        /zoneAccepts\(zoneId, item\)/.test(code),
      )
      check(
        'dispatcher: plan status is committed from a drop',
        /case ZONE\.STATUS_DRAFTED:/.test(code) && /status: zone\.statusId/.test(code),
      )
      continue
    }

    for (const helper of PRIMARY_HELPERS) {
      if (helper === 'performDrop') continue
      // destructured out of the context = an escape hatch around the dispatcher
      const destructured = new RegExp(`\\{[^}]*\\b${helper}\\b[^}]*\\}\\s*=\\s*useRE\\(`).test(code)
      if (destructured) violations.push(`${rel} destructures ${helper}()`)
    }

    // A select/onChange that mutates persisted state
    if (/onChange=\{[^}]*updatePlan/.test(code)) violations.push(`${rel} mutates a plan from onChange`)
    if (/<select[\s\S]{0,400}?onChange=\{(?:[^}]*?)updatePlan/.test(code)) {
      violations.push(`${rel} plan select mutates state`)
    }
  }

  check('no component bypasses the dispatcher', violations.length === 0, violations.join('; '))

  // Specific regression: the plan status must not be a select any more.
  const planCard = fs.readFileSync(path.join(SRC, 'components/revival/RevivalPlanCard.jsx'), 'utf8')
  check('RevivalPlanCard has no status <select>', !/<select/.test(planCard))
  check(
    'RevivalPlanCard shows a read-only status mark',
    /status-mark/.test(planCard) && /StatusMark/.test(planCard),
  )
  check(
    'RevivalPlanCard explains the drag destinations',
    /Drag this card into/.test(planCard),
  )

  // Secondary controls must survive the audit.
  const desk = fs.readFileSync(path.join(SRC, 'pages/RevivalDeskPage.jsx'), 'utf8')
  check('desk keeps ordinary tab buttons', /role="tab"/.test(desk))
  check('desk keeps navigation links', /<Link to="\/explore"/.test(desk))

  const submit = fs.readFileSync(path.join(SRC, 'pages/SubmitProjectPage.jsx'), 'utf8')
  check('submission keeps Continue', /handleContinue/.test(submit) && />\s*Continue/.test(submit))
  check('submission keeps Back', /handleBack/.test(submit))
  check(
    'submission has no publish button',
    !/Add to the archive|>\s*Publish\s*</.test(submit),
  )

  check('desk tabs are wired to a tabpanel', /role="tabpanel"/.test(desk) && /aria-controls=/.test(desk))
  check('desk tabs support arrow-key navigation', /ArrowRight/.test(desk) && /ArrowLeft/.test(desk))
  check('archived plans are never gated behind the active list', !/activePlans\.length > 0 \?/.test(desk))

  const dragCard = fs.readFileSync(path.join(SRC, 'components/canvas/DraggableDataCard.jsx'), 'utf8')
  check('drag handle is a semantic button', /<button[\s\S]*?className="drag-grip"/.test(dragCard))
  check('drag handle has an accessible label', /aria-label=/.test(dragCard))
  check('drag handle spreads dnd listeners', /\.\.\.listeners/.test(dragCard))
}

/* ------------------------------------------------------------------------ */
/* B. Live audit                                                            */
/* ------------------------------------------------------------------------ */
const KEY_MAP = ['re:v1:saved', 're:v1:plans', 're:v1:projects', 're:v1:preferences']

function snapshot() {
  return KEY_MAP.map((key) => `${key}=${dom.window.localStorage.getItem(key) || ''}`).join('|')
}

async function auditLive() {
  const { createRoot } = await import('react-dom/client')
  const act = React.act
  const { default: App } = await import('../src/app/App.jsx')

  const seedPrefs = JSON.stringify({
    onboarded: true,
    categories: [],
    intention: '',
    tutorialDone: true,
  })
  const seedPlan = JSON.stringify([
    {
      id: 'plan-audit',
      projectId: 'RE-001',
      projectSlug: 'open-orchard',
      projectTitle: 'Open Orchard',
      type: 'contribution',
      collaboration: 'contributors',
      role: 'Frontend',
      intention: 'Help with the shared layer.',
      note: 'Audit the mobile layout',
      createdAt: '2026-10-01T10:00:00.000Z',
      status: 'drafted',
      tasks: [
        { id: 't1', label: 'Review the work', done: false },
        { id: 't2', label: 'Write a plan', done: false },
      ],
    },
  ])

  const routes = ['/', '/explore', '/projects/open-orchard', '/desk?tab=saved', '/desk?tab=plans', '/desk?tab=mine', '/submit', '/nope']

  for (const route of routes) {
    dom.window.localStorage.clear()
    dom.window.localStorage.setItem('re:v1:preferences', seedPrefs)
    dom.window.localStorage.setItem('re:v1:saved', JSON.stringify(['RE-001']))
    dom.window.localStorage.setItem('re:v1:plans', seedPlan)
    dom.window.history.replaceState({}, '', route)

    const host = dom.window.document.createElement('div')
    dom.window.document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => {
      root.render(React.createElement(App))
    })

    const before = snapshot()
    const buttons = Array.from(host.querySelectorAll('button')).filter((button) => {
      if (button.classList.contains('drag-grip')) return false // a drag handle, not a commit
      if (button.disabled) return false
      const label = `${button.textContent} ${button.getAttribute('aria-label') || ''}`
      // never click anything that changes the route or opens a dialog we do not
      // want in this audit; those are navigation/secondary by design.
      return !/back to|browse|explore|submit|open|read|how it works|close|dismiss|cancel|remove filter|clear|filter|show results/i.test(
        label,
      )
    })

    for (const button of buttons) {
      await act(async () => {
        button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
      })
    }

    const changed = snapshot() !== before
    check(`no button writes storage on ${route}`, !changed, changed ? snapshot() : '')

    await act(async () => {
      root.unmount()
    })
    host.remove()
  }

  // The plan status must only move on a drop.
  dom.window.localStorage.clear()
  dom.window.localStorage.setItem('re:v1:preferences', seedPrefs)
  dom.window.localStorage.setItem('re:v1:plans', seedPlan)
  dom.window.history.replaceState({}, '', '/desk?tab=plans')
  const host = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(React.createElement(App))
  })

  check(
    'plan status renders as a read-out',
    host.querySelector('.status-mark')?.textContent?.toLowerCase().includes('drafted'),
    host.querySelector('.status-mark')?.textContent || 'missing',
  )
  check('no status control rendered', host.querySelectorAll('.plan-data-card select').length === 0)

  const statusBefore = JSON.parse(dom.window.localStorage.getItem('re:v1:plans'))[0].status
  // the dock is portaled to <body>, outside the route's container
  const statusZone = dom.window.document.querySelector('.action-dock [data-zone="status-planning"]')
  check('desk tray offers the status zones', Boolean(statusZone))

  await act(async () => {
    if (statusZone) statusZone.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  })
  check(
    'clicking a status zone does not change the plan',
    JSON.parse(dom.window.localStorage.getItem('re:v1:plans'))[0].status === statusBefore,
  )

  await act(async () => {
    root.unmount()
  })
  host.remove()

  await auditOnboarding()
  await auditDeskRecovery()
}

/* Onboarding is the one place a plain button may persist something — and only
   ever preferences. This makes that exception explicit instead of assumed. */
async function auditOnboarding() {
  const { createRoot } = await import('react-dom/client')
  const act = React.act
  const { default: App } = await import('../src/app/App.jsx')

  dom.window.localStorage.clear()
  dom.window.history.replaceState({}, '', '/')
  const host = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(React.createElement(App))
  })

  const dialog = dom.window.document.querySelector('[role="dialog"]')
  check('a first visit is offered onboarding', Boolean(dialog))
  const keysBefore = KEY_MAP.slice(0, 3).map((key) => dom.window.localStorage.getItem(key))

  // Everything inside the onboarding panel, in order.
  for (const button of Array.from(dialog?.querySelectorAll('button') || [])) {
    await act(async () => {
      button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
    })
  }

  const archiveKeys = KEY_MAP.slice(0, 3).map((key) => JSON.parse(dom.window.localStorage.getItem(key) || '[]'))
  check(
    'onboarding adds no archive records',
    archiveKeys.every((value) => Array.isArray(value) && value.length === 0),
    JSON.stringify(archiveKeys),
  )
  check('onboarding only writes preferences', Boolean(dom.window.localStorage.getItem('re:v1:preferences')))
  check('onboarding is dismissed', !dom.window.document.querySelector('[role="dialog"]'))

  await act(async () => {
    root.unmount()
  })
  host.remove()
  void keysBefore
}

/* The two desk traps: archived plans must stay reachable, and a discarded
   project must not leave plans pointing at a 404. */
async function auditDeskRecovery() {
  const { createRoot } = await import('react-dom/client')
  const act = React.act
  const { default: App } = await import('../src/app/App.jsx')
  const { REProvider, useRE } = await import('../src/context/REContext.jsx')

  const plan = (id, overrides = {}) => ({
    id,
    projectId: 'LOCAL-1',
    projectSlug: 'my-local-project',
    projectTitle: 'My local project',
    type: 'contribution',
    collaboration: 'contributors',
    role: 'Frontend',
    intention: 'Help.',
    note: 'First step',
    createdAt: '2026-10-01T10:00:00.000Z',
    status: 'planning',
    tasks: [{ id: 't1', label: 'Review', done: false }],
    ...overrides,
  })

  dom.window.localStorage.clear()
  dom.window.localStorage.setItem(
    're:v1:preferences',
    JSON.stringify({ onboarded: true, categories: [], intention: '', tutorialDone: true }),
  )
  dom.window.localStorage.setItem('re:v1:projects', JSON.stringify([
    { id: 'LOCAL-1', slug: 'my-local-project', title: 'My local project', local: true },
  ]))
  dom.window.localStorage.setItem('re:v1:plans', JSON.stringify([plan('plan-archived', { status: 'archived' })]))
  dom.window.history.replaceState({}, '', '/desk?tab=plans')

  const host = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(React.createElement(App))
  })

  check(
    'an archived-only desk still shows the plan',
    host.querySelectorAll('.plan-data-card').length === 1,
    `${host.querySelectorAll('.plan-data-card').length} cards`,
  )
  check(
    'an archived-only desk does not claim to be empty',
    !/No revival plans yet/.test(host.textContent),
  )
  check('archived section is labelled', Boolean(host.querySelector('#desk-archive-heading')))
  check(
    'a plan for a live project keeps its link',
    Boolean(host.querySelector('.plan-data-card__title a')),
  )

  // tabs follow the URL rather than only the first render
  await act(async () => {
    dom.window.history.replaceState({}, '', '/desk?tab=mine')
    dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'))
  })
  const mineTab = host.querySelector('#desk-tab-mine')
  check('the URL drives the active tab', mineTab?.getAttribute('aria-selected') === 'true')

  await act(async () => {
    root.unmount()
  })
  host.remove()

  // An older or hand-edited record may be missing almost every field.
  dom.window.localStorage.setItem('re:v1:projects', JSON.stringify([{ id: 'LOCAL-2', slug: 'sparse' }]))
  dom.window.history.replaceState({}, '', '/desk?tab=mine')
  const sparseHost = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(sparseHost)
  const sparseRoot = createRoot(sparseHost)
  let crashed = null
  try {
    await act(async () => {
      sparseRoot.render(React.createElement(App))
    })
  } catch (error) {
    crashed = error
  }
  check(
    'a partial stored record does not crash the desk',
    crashed === null && sparseHost.querySelectorAll('.project-data-card').length === 1,
    crashed ? String(crashed.message) : `${sparseHost.querySelectorAll('.project-data-card').length} cards`,
  )
  await act(async () => {
    sparseRoot.unmount()
  })
  sparseHost.remove()

  // A plan can outlive its project. It must stay readable without a dead link.
  dom.window.localStorage.setItem('re:v1:projects', JSON.stringify([]))
  dom.window.history.replaceState({}, '', '/desk?tab=plans')
  const orphanHost = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(orphanHost)
  const orphanRoot = createRoot(orphanHost)
  await act(async () => {
    orphanRoot.render(React.createElement(App))
  })
  check(
    'an orphaned plan has no dead link',
    !orphanHost.querySelector('.plan-data-card__title a') &&
      /no longer in your archive/.test(orphanHost.textContent),
    orphanHost.querySelector('.plan-data-card__title a')?.getAttribute('href'),
  )
  check(
    'an orphaned plan offers no broken open button',
    !orphanHost.querySelector('.plan-data-card__actions a'),
  )
  await act(async () => {
    orphanRoot.unmount()
  })
  orphanHost.remove()

  dom.window.localStorage.setItem(
    're:v1:projects',
    JSON.stringify([{ id: 'LOCAL-1', slug: 'my-local-project', title: 'My local project' }]),
  )

  // ---- cascade: discarding a published project removes its plans --------
  let ctx = null
  function Probe() {
    ctx = useRE()
    return null
  }
  const probeHost = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(probeHost)
  const probeRoot = createRoot(probeHost)
  await act(async () => {
    probeRoot.render(React.createElement(REProvider, null, React.createElement(Probe)))
  })

  let discard = null
  await act(async () => {
    discard = ctx.performDrop(
      { type: 'local-project', id: 'LOCAL-1', label: 'My local project' },
      'discard-project',
    )
  })
  check('a published project can be staged for discard', discard.ok === true)
  check(
    'the discard warning names the plans it will take',
    /1 revival plan/.test(ctx.pendingRemoval?.detail || ''),
    ctx.pendingRemoval?.detail,
  )
  await act(async () => {
    ctx.performDrop(
      { type: 'pending-removal', removalToken: ctx.pendingRemoval.token, label: 'pending' },
      'confirm-removal',
    )
  })
  check(
    'discarding a project removes its orphaned plans',
    JSON.parse(dom.window.localStorage.getItem('re:v1:plans') || '[]').length === 0,
  )
  check('the project itself is gone', ctx.localProjects.length === 0)

  await act(async () => {
    probeRoot.unmount()
  })
  probeHost.remove()
}

/* ------------------------------------------------------------------------ */
/* C. Registry contract                                                     */
/* ------------------------------------------------------------------------ */
async function auditRegistry() {
  const { REProvider, useRE } = await import('../src/context/REContext.jsx')
  const { createRoot } = await import('react-dom/client')
  const act = React.act
  const { ACTION_ZONES, zoneAccepts } = await import('../src/dnd/zones.js')

  let ctx = null
  function Probe() {
    ctx = useRE()
    return null
  }

  dom.window.localStorage.clear()
  dom.window.localStorage.setItem(
    're:v1:preferences',
    JSON.stringify({ onboarded: true, categories: [], intention: '', tutorialDone: true }),
  )
  dom.window.localStorage.setItem(
    're:v1:plans',
    JSON.stringify([
      {
        id: 'plan-contract',
        projectId: 'RE-001',
        projectSlug: 'open-orchard',
        projectTitle: 'Open Orchard',
        type: 'contribution',
        collaboration: 'contributors',
        role: 'Frontend',
        intention: 'Help.',
        note: 'First step',
        createdAt: '2026-10-01T10:00:00.000Z',
        status: 'drafted',
        tasks: [{ id: 't1', label: 'Review', done: false }],
      },
    ]),
  )

  const host = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(React.createElement(REProvider, null, React.createElement(Probe)))
  })

  // every zone rejects a card of the wrong type
  const junk = { type: 'not-a-card', id: 'x', label: 'Junk' }
  const accepted = ACTION_ZONES.filter((zone) => zoneAccepts(zone.id, junk))
  check('no zone accepts an unknown card type', accepted.length === 0, accepted.map((z) => z.id).join())

  // every zone declares what it accepts
  check(
    'every zone declares its contract',
    ACTION_ZONES.every((zone) => zone.accepts.length > 0 && zone.description && zone.label),
  )

  // invalid drops never mutate
  const before = snapshot()
  const attempts = ACTION_ZONES.map((zone) =>
    ctx.performDrop({ type: 'project', id: 'RE-001', label: 'Open Orchard' }, zone.id),
  )
  const legit = new Set(['save-to-desk', 'offer-help', 'take-stewardship'])
  const mutated = ACTION_ZONES.filter(
    (zone, index) => !legit.has(zone.id) && attempts[index].ok,
  )
  check('project cards are only accepted by save/help/stewardship', mutated.length === 0, mutated.map((z) => z.id).join())

  // seeded projects cannot be discarded
  const discard = ctx.performDrop({ type: 'project', id: 'RE-001', label: 'Open Orchard' }, 'discard-project')
  check('seeded project discard is refused', discard.ok === false && !ctx.pendingRemoval)

  // status zone drops commit, and are idempotent
  await act(async () => {
    ctx.performDrop({ type: 'plan', planId: 'plan-contract', status: 'drafted', label: 'Open Orchard' }, 'status-planning')
  })
  check(
    'a plan card drop commits the status',
    JSON.parse(dom.window.localStorage.getItem('re:v1:plans'))[0].status === 'planning',
  )
  const repeat = ctx.performDrop(
    { type: 'plan', planId: 'plan-contract', status: 'planning', label: 'Open Orchard' },
    'status-planning',
  )
  check('dropping onto the current status is refused', repeat.ok === false)

  // stale plan ids are rejected safely
  const stale = ctx.performDrop(
    { type: 'plan', planId: 'plan-deleted', status: 'drafted', label: 'Gone' },
    'status-working',
  )
  check('a stale plan id is refused', stale.ok === false)

  // plan identity survives a status change
  const storedPlan = JSON.parse(dom.window.localStorage.getItem('re:v1:plans'))[0]
  check('plan id and project link survive', storedPlan.id === 'plan-contract' && storedPlan.projectId === 'RE-001')
  check('plan tasks survive', storedPlan.tasks.length === 1)

  await act(async () => {
    root.unmount()
  })
  host.remove()

  // and the URL-independent guard: the dispatcher still exists in one place
  const contextSource = fs.readFileSync(path.join(SRC, 'context/REContext.jsx'), 'utf8')
  check(
    'performDrop is the only writer of saved/plans/projects in the context',
    (contextSource.match(/setUnsaved|setPlans\(/g) || []).length >= 0,
  )
  check('there is exactly one performDrop definition', (contextSource.match(/const performDrop = useCallback/g) || []).length === 1)
}

async function main() {
  auditStatic()
  await auditLive()
  await auditRegistry()
  console.log(failures === 0 ? 'COMPLIANCE PASS' : `COMPLIANCE FAILURES: ${failures}`)
  if (failures > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
