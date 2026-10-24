import { JSDOM } from 'jsdom'
import { renderToString } from 'react-dom/server'
import React from 'react'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
})
global.window = dom.window
global.document = dom.window.document
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true })
global.HTMLElement = dom.window.HTMLElement
global.Element = dom.window.Element
global.Node = dom.window.Node
global.getComputedStyle = dom.window.getComputedStyle
global.requestAnimationFrame = (cb) => setTimeout(cb, 0)
global.cancelAnimationFrame = (id) => clearTimeout(id)
dom.window.requestAnimationFrame = global.requestAnimationFrame
dom.window.cancelAnimationFrame = global.cancelAnimationFrame

let App

async function start() {
  const mod = await import('../src/app/App.jsx')
  App = mod.default
  run()
}

function run() {

const prefs = { onboarded: true, categories: ['sustainability'], intention: 'contribute', tutorialDone: true }

const scenarios = [
  { path: '/', seed: {} },
  { path: '/explore', seed: { prefs } },
  { path: '/explore?q=orchard', seed: { prefs } },
  { path: '/projects/open-orchard', seed: { prefs, saved: ['RE-001'] } },
  { path: '/projects/does-not-exist', seed: { prefs }, notFound: true },
  { path: '/desk?tab=saved', seed: { prefs, saved: ['RE-001', 'RE-002'] } },
  {
    path: '/desk?tab=plans',
    seed: {
      prefs,
      plans: [
        {
          id: 'plan-abc123',
          projectId: 'RE-001',
          projectSlug: 'open-orchard',
          projectTitle: 'Open Orchard',
          type: 'contribution',
          collaboration: 'contributors',
          role: 'Frontend',
          intention: 'I could help with the shared plot editing.',
          note: 'Audit the mobile layout',
          createdAt: '2026-10-01T10:00:00.000Z',
          status: 'planning',
          tasks: [
            { id: 't1', label: 'Review the work', done: true },
            { id: 't2', label: 'Write a plan', done: false },
          ],
        },
      ],
    },
  },
  {
    path: '/desk?tab=mine',
    seed: {
      prefs,
      projects: [
        {
          id: 'RE-013',
          slug: 'my-test-project',
          title: 'My Test Project',
          category: 'design',
          stage: 'Early Prototype',
          description: 'A locally published project used to exercise the desk.',
          summary: 'A locally published project used to exercise the desk.',
          story: ['Story.'],
          reasonPaused: 'Time.',
          existingWork: [{ title: 'Work', detail: 'Detail', status: 'Partial', kind: 'prototype' }],
          missingWork: [{ title: 'Missing', detail: 'Detail', skill: 'Design', difficulty: 'Medium', status: 'Not started' }],
          nextSteps: ['Do a thing'],
          techStack: ['React'],
          skillsNeeded: ['Design'],
          helpNeeded: ['Design'],
          helpFocus: 'Design',
          collaborationTypes: ['contributors'],
          openToStewardship: false,
          creator: { name: 'Demo', role: 'Demo', note: 'Demo' },
          updatedAt: '2026-10-01',
          completion: 30,
          handoffChecklist: [],
          fieldNotes: [],
          materials: [],
        },
      ],
    },
  },
  { path: '/submit', seed: { prefs } },
  { path: '/nope', seed: { prefs }, notFound: true },
]

const KEY_MAP = {
  prefs: 're:v1:preferences',
  saved: 're:v1:saved',
  plans: 're:v1:plans',
  projects: 're:v1:projects',
}

let failures = 0
for (const scenario of scenarios) {
  dom.window.localStorage.clear()
  for (const [key, value] of Object.entries(scenario.seed)) {
    dom.window.localStorage.setItem(KEY_MAP[key], JSON.stringify(value))
  }
  dom.window.history.replaceState({}, '', scenario.path)
  try {
    const html = renderToString(React.createElement(App))
    const checks = [
      [
        'drag affordance',
        scenario.notFound ? html.includes('notfound') : html.includes('drag-grip') || html.includes('Drag'),
      ],
      ['no NaN', !html.includes('NaN')],
      ['no [object Object]', !html.includes('[object Object]')],
    ]
    const failed = checks.filter(([, ok]) => !ok)
    if (failed.length) failures += 1
    console.log(`${failed.length ? 'FAIL' : 'ok  '} ${scenario.path} (${html.length}b)`, failed.map(([n]) => n).join(', '))
  } catch (error) {
    failures += 1
    console.log(`ERROR ${scenario.path}:`, error.message)
    console.log(error.stack?.split('\n').slice(0, 6).join('\n'))
  }
}
console.log(failures === 0 ? 'SMOKE PASS' : `SMOKE FAILURES: ${failures}`)
}

start()
