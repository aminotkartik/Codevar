import { JSDOM } from 'jsdom'
import React from 'react'

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/desk' })
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
  const { RouterProvider } = await import('../src/app/router.jsx')
  const { CanvasDndProvider } = await import('../src/dnd/CanvasDnd.jsx')
  const { HelpComposer } = await import('../src/components/canvas/HelpComposer.jsx')
  const { StewardshipComposer } = await import('../src/components/canvas/StewardshipComposer.jsx')
  const { PlanEditor } = await import('../src/components/canvas/PlanEditor.jsx')
  const { RemovalPanel } = await import('../src/components/canvas/RemovalPanel.jsx')
  const { ActionZoneDock } = await import('../src/components/canvas/ActionZoneDock.jsx')

  dom.window.localStorage.setItem(
    're:v1:preferences',
    JSON.stringify({ onboarded: true, categories: [], intention: '', tutorialDone: true }),
  )

  let ctx = null
  function Probe() {
    ctx = useRE()
    return null
  }

  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () => {
    root.render(
      React.createElement(
        REProvider,
        null,
        React.createElement(
          RouterProvider,
          null,
          React.createElement(
            CanvasDndProvider,
            null,
            React.createElement(Probe),
            React.createElement(HelpComposer),
            React.createElement(StewardshipComposer),
            React.createElement(PlanEditor),
            React.createElement(RemovalPanel),
            React.createElement(ActionZoneDock),
          ),
        ),
      ),
    )
  })

  const text = () => document.body.textContent

  check('dock renders at rest', text().includes('Action zones') && text().includes('Remove from desk'))

  await act(async () => {
    ctx.performDrop({ type: 'project', id: 'RE-001', label: 'Open Orchard', stewardable: true }, 'offer-help::x')
  })
  check('help composer opens', text().includes('Contribute to Open Orchard'))
  check('help composer has no send button', !/Send|Save plan|Offer to contribute/i.test(text()))

  await act(async () => {
    ctx.performDrop(
      {
        type: 'contribution-intent',
        projectId: 'RE-001',
        valid: true,
        values: { collaboration: 'contributors', role: 'Frontend', intention: 'Help with plot editing', firstTask: 'Audit layout' },
      },
      'add-plan-to-desk::y',
    )
  })
  check('composer closes after add plan', !text().includes('Contribute to Open Orchard'))
  check('plan stored', ctx.plans.length === 1)

  await act(async () => {
    ctx.performDrop({ type: 'project', id: 'RE-001', label: 'Open Orchard', stewardable: true }, 'take-stewardship::x')
  })
  check('stewardship composer opens', text().includes('Continue Open Orchard'))
  check('stewardship states no transfer', text().includes('subject to the original creator'))
  await act(async () => { ctx.closeComposer() })

  await act(async () => {
    ctx.openComposer('edit-plan', { planId: ctx.plans[0].id })
  })
  check('plan editor opens', text().includes('Edit the plan for Open Orchard'))
  check('plan editor offers no save button', !/Save changes/i.test(text()))
  await act(async () => { ctx.closeComposer() })

  await act(async () => {
    ctx.performDrop({ type: 'project', id: 'RE-001', label: 'Open Orchard', stewardable: true }, 'save-to-desk::x')
  })
  check('project saved for removal', ctx.saved.includes('RE-001'))
  await act(async () => {
    ctx.performDrop({ type: 'saved-project', id: 'RE-001', label: 'Open Orchard' }, 'remove-from-desk::x')
  })
  check('removal panel stages', text().includes('Nothing removed yet') && text().includes('Confirm removal'))
  check('removal panel keeps item', ctx.saved.includes('RE-001'))
  await act(async () => { ctx.clearPendingRemoval() })
  check('cancel clears pending', ctx.pendingRemoval === null && ctx.saved.includes('RE-001'))

  await act(async () => { root.unmount() })
  console.log(failures === 0 ? 'PANELS PASS' : `PANEL FAILURES: ${failures}`)
  if (failures > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
