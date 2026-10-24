import { JSDOM } from 'jsdom'
import React from 'react'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
global.window = dom.window
global.document = dom.window.document
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true })
global.HTMLElement = dom.window.HTMLElement
global.Element = dom.window.Element
global.Node = dom.window.Node
global.requestAnimationFrame = (cb) => setTimeout(cb, 0)
global.cancelAnimationFrame = (id) => clearTimeout(id)
dom.window.requestAnimationFrame = global.requestAnimationFrame
dom.window.cancelAnimationFrame = global.cancelAnimationFrame
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

async function main() {
  const { createRoot } = await import('react-dom/client')
  const act = React.act
  const { REProvider, useRE } = await import('../src/context/REContext.jsx')

  let ctx = null
  function Probe() {
    ctx = useRE()
    return null
  }

  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(React.createElement(REProvider, null, React.createElement(Probe)))
  })

  const stored = (key) => JSON.parse(dom.window.localStorage.getItem(key) || 'null')

  // 1. save
  let result
  await act(async () => {
    result = ctx.performDrop(
      { type: 'project', id: 'RE-001', label: 'Open Orchard', stewardable: true },
      'save-to-desk::r1',
    )
  })
  check('save drop succeeds', result.ok === true, JSON.stringify(result))
  check('save persists', stored('re:v1:saved')?.includes('RE-001'))

  // 2. duplicate save
  await act(async () => {
    result = ctx.performDrop(
      { type: 'project', id: 'RE-001', label: 'Open Orchard', stewardable: true },
      'save-to-desk::r1',
    )
  })
  check('duplicate save rejected', result.ok === false)
  check('no duplicate stored', stored('re:v1:saved').length === 1)

  // 3. invalid zone
  await act(async () => {
    result = ctx.performDrop({ type: 'project', id: 'RE-001', label: 'Open Orchard' }, 'confirm-removal::r9')
  })
  check('invalid zone rejected', result.ok === false)
  check('invalid zone keeps data', stored('re:v1:saved').length === 1)

  // 4. add plan
  const intent = {
    type: 'contribution-intent',
    projectId: 'RE-001',
    projectSlug: 'open-orchard',
    projectTitle: 'Open Orchard',
    valid: true,
    values: { collaboration: 'contributors', role: 'Frontend dev', intention: 'Shared plot editing', firstTask: 'Audit mobile layout' },
  }
  await act(async () => {
    result = ctx.performDrop(intent, 'add-plan-to-desk::a1')
  })
  const plan = stored('re:v1:plans')?.[0]
  check('plan created', Boolean(plan), JSON.stringify(result))
  check('plan keeps project link', plan?.projectId === 'RE-001')
  check('plan has 3 tasks', plan?.tasks?.length === 3)
  check('plan first task uses input', plan?.tasks?.[1]?.label === 'Audit mobile layout')

  // 5. invalid intent rejected
  await act(async () => {
    result = ctx.performDrop({ ...intent, valid: false }, 'add-plan-to-desk::a1')
  })
  check('incomplete intent rejected', result.ok === false)
  check('no extra plan', stored('re:v1:plans').length === 1)

  // 6. tasks
  const taskId = plan.tasks[0].id
  await act(async () => {
    result = ctx.performDrop(
      { type: 'task', planId: plan.id, taskId, done: false, label: 'Review' },
      'completed::c1',
    )
  })
  check('task completed', result.ok === true && stored('re:v1:plans')[0].tasks[0].done === true)
  await act(async () => {
    result = ctx.performDrop(
      { type: 'task', planId: plan.id, taskId, done: false, label: 'Review' },
      'reopen-task::r1',
    )
  })
  check('stale reopen rejected', result.ok === false)
  await act(async () => {
    result = ctx.performDrop(
      { type: 'task', planId: plan.id, taskId, done: true, label: 'Review' },
      'reopen-task::r1',
    )
  })
  check('task reopened', result.ok === true && stored('re:v1:plans')[0].tasks[0].done === false)

  // 7. update plan
  await act(async () => {
    result = ctx.performDrop(
      {
        type: 'plan-draft',
        planId: plan.id,
        valid: true,
        values: { collaboration: 'coBuilder', role: 'Frontend and design', intention: 'Rewrite the shared layer', firstTask: 'Ship a spike' },
      },
      'update-plan::u1',
    )
  })
  const updated = stored('re:v1:plans')[0]
  check('plan updated', result.ok === true && updated.role === 'Frontend and design')
  check('plan id preserved', updated.id === plan.id)
  check('plan project preserved', updated.projectId === 'RE-001')
  check('plan tasks preserved', updated.tasks?.length === 3)

  // 8. publish
  const payload = {
    title: 'Test Draft',
    category: 'design',
    stage: 'Early Prototype',
    description: 'A draft used by the dispatcher test.',
    summary: 'A draft used by the dispatcher test.',
  }
  await act(async () => {
    result = ctx.performDrop(
      { type: 'project-draft', id: 'draft-x', draftId: 'x', valid: false, payload },
      'publish-to-archive::p1',
    )
  })
  check('invalid draft rejected', result.ok === false && (stored('re:v1:projects') || []).length === 0)
  await act(async () => {
    result = ctx.performDrop(
      { type: 'project-draft', id: 'draft-x', draftId: 'x', valid: true, payload },
      'publish-to-archive::p1',
    )
  })
  const local = stored('re:v1:projects')?.[0]
  check('draft published', result.ok === true && local?.title === 'Test Draft')
  check('published has id + slug', Boolean(local?.id) && Boolean(local?.slug))
  check('published gets next archive id', /^RE-\d{3}$/.test(local?.id || ''))
  check('lastPublished recorded', ctx.lastPublished?.slug === local?.slug)

  // 9. discard guard for seed project
  await act(async () => {
    result = ctx.performDrop({ type: 'project', id: 'RE-001', label: 'Open Orchard' }, 'discard-project::d1')
  })
  check('seed project cannot be discarded', result.ok === false && !ctx.pendingRemoval)

  // 10. two-stage removal of a saved project
  await act(async () => {
    result = ctx.performDrop({ type: 'saved-project', id: 'RE-001', label: 'Open Orchard' }, 'remove-from-desk::m1')
  })
  const removal = ctx.pendingRemoval
  check('pending removal created', result.ok === true && Boolean(removal))
  check('saved project not deleted yet', stored('re:v1:saved').includes('RE-001'))
  await act(async () => {
    result = ctx.performDrop(
      { type: 'pending-removal', removalToken: 'wrong-token', label: 'x' },
      'confirm-removal::k1',
    )
  })
  check('wrong pending token rejected', result.ok === false && stored('re:v1:saved').includes('RE-001'))
  await act(async () => {
    result = ctx.performDrop(
      { type: 'pending-removal', removalToken: removal.token, label: removal.label },
      'confirm-removal::k1',
    )
  })
  check('saved project removed after confirm', result.ok === true && !stored('re:v1:saved').includes('RE-001'))
  check('archive project still exists', ctx.projects.some((p) => p.id === 'RE-001'))
  check('pending cleared', ctx.pendingRemoval === null)

  // 11. removal of a plan keeps the project
  await act(async () => {
    result = ctx.performDrop({ type: 'plan', id: plan.id, label: 'Open Orchard' }, 'remove-from-desk::m2')
  })
  const planRemoval = ctx.pendingRemoval
  await act(async () => {
    result = ctx.performDrop(
      { type: 'pending-removal', removalToken: planRemoval.token, label: planRemoval.label },
      'confirm-removal::k2',
    )
  })
  check('plan removed after confirm', result.ok === true && (stored('re:v1:plans') || []).length === 0)
  check('project survived plan removal', ctx.projects.some((p) => p.id === 'RE-001'))

  // 12. discard local project through two drops
  await act(async () => {
    result = ctx.performDrop(
      { type: 'local-project', id: local.id, label: local.title },
      'discard-project::d2',
    )
  })
  check('local project discard staged', result.ok === true && Boolean(ctx.pendingRemoval))
  const discard = ctx.pendingRemoval
  await act(async () => {
    result = ctx.performDrop(
      { type: 'pending-removal', removalToken: discard.token, label: discard.label },
      'confirm-removal::k3',
    )
  })
  check('local project discarded', (stored('re:v1:projects') || []).length === 0)

  // 13. demo reset, two stage
  await act(async () => {
    result = ctx.performDrop({ type: 'demo-data', id: 'demo', label: 'Demo records' }, 'reset-demo::z1')
  })
  check('reset staged', result.ok === true && ctx.pendingRemoval?.kind === 'demo')
  const reset = ctx.pendingRemoval
  await act(async () => {
    result = ctx.performDrop(
      { type: 'pending-removal', removalToken: reset.token, label: reset.label },
      'confirm-removal::k4',
    )
  })
  check('reset cleared data', result.ok === true && stored('re:v1:plans').length === 0)
  check('reset kept onboarding done', stored('re:v1:preferences')?.onboarded === true)

  // 14. cancel keeps everything
  await act(async () => {
    ctx.performDrop({ type: 'project', id: 'RE-002', label: 'Patchwork Atlas' }, 'save-to-desk::r2')
  })
  await act(async () => {
    ctx.performDrop({ type: 'saved-project', id: 'RE-002', label: 'Patchwork Atlas' }, 'remove-from-desk::m3')
  })
  await act(async () => { ctx.clearPendingRemoval() })
  check('cancel keeps saved item', stored('re:v1:saved').includes('RE-002'))

  await act(async () => { root.unmount() })
  console.log(failures === 0 ? 'DISPATCH PASS' : `DISPATCH FAILURES: ${failures}`)
  if (failures > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
