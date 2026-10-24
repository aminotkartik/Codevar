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
dom.window.HTMLElement.prototype.scrollIntoView = () => {}
global.IS_REACT_ACT_ENVIRONMENT = true

let failures = 0
const problems = []
const origError = console.error
console.error = (...args) => { problems.push(args.map(String).join(' ')) }
function check(name, condition, extra = '') {
  if (!condition) { failures += 1; console.log(`FAIL  ${name} ${extra}`) } else { console.log(`ok    ${name}`) }
}

const ROUTES = ['/', '/explore', '/projects/open-orchard', '/desk?tab=saved', '/desk?tab=plans', '/desk?tab=mine', '/desk?tab=removed', '/submit', '/nope', '/#how-it-works']

async function main() {
  const { createRoot } = await import('react-dom/client')
  const act = React.act
  const { default: App } = await import('../src/app/App.jsx')

  for (const route of ROUTES) {
    dom.window.localStorage.clear()
    dom.window.localStorage.setItem('re:v1:preferences', JSON.stringify({ onboarded: true, categories: [], intention: '', tutorialDone: true }))
    dom.window.localStorage.setItem('re:v1:saved', JSON.stringify(['RE-002']))
    dom.window.localStorage.setItem('re:v1:plans', JSON.stringify([{ id: 'p1', projectId: 'RE-001', projectSlug: 'open-orchard', projectTitle: 'Open Orchard', type: 'contribution', collaboration: 'contributors', role: 'F', intention: 'H', note: 'n', createdAt: '2026-10-01T10:00:00.000Z', status: 'working', tasks: [{ id: 't', label: 'x', done: false }] }]))
    dom.window.history.replaceState({}, '', route)
    const host = dom.window.document.createElement('div')
    dom.window.document.body.appendChild(host)
    const root = createRoot(host)
    const before = problems.length
    try {
      await act(async () => { root.render(React.createElement(App)) })
      await new Promise((r) => setTimeout(r, 80))
    } catch (e) {
      problems.push(`${route} THREW ${e.message}`)
    }
    await act(async () => { root.unmount() })
    host.remove()
    dom.window.document.body.innerHTML = ''
    const added = problems.slice(before)
    check(`${route} renders with no React warning or error`, added.length === 0, added.join(' | ').slice(0, 300))
  }

  console.log(failures === 0 ? 'CONSOLE PASS' : `CONSOLE FAILURES: ${failures}`)
  if (failures > 0) process.exitCode = 1
}
main()
