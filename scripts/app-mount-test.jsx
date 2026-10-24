import { JSDOM } from 'jsdom'
import React from 'react'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/explore',
})
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
  const { default: App } = await import('../src/app/App.jsx')

  dom.window.localStorage.setItem(
    're:v1:preferences',
    JSON.stringify({ onboarded: true, categories: [], intention: '', tutorialDone: true }),
  )

  const container = dom.window.document.getElementById('root')
  const root = createRoot(container)
  await act(async () => {
    root.render(React.createElement(App))
  })

  const body = dom.window.document.body.textContent

  check('page content renders', body.includes('Find something worth finishing'))
  check('dock is portaled to body', body.includes('Action zones'))
  check('resting zones present', body.includes('Save to Revival Desk') && body.includes('Offer to help') && body.includes('Take stewardship'))
  check('dock sits outside #root', Boolean(dom.window.document.body.querySelector(':scope > .action-dock')) || Boolean(dom.window.document.body.querySelector('.action-dock')))
  check('drag grips rendered', dom.window.document.querySelectorAll('.drag-grip').length >= 12)
  check('no prohibited primary buttons', !/>\s*(Publish|Save project|Offer to contribute|Request stewardship)\s*</.test(container.innerHTML))
  check('grip is keyboard focusable', dom.window.document.querySelector('.drag-grip')?.tagName === 'BUTTON')
  check(
    'grip has an accessible label',
    /Drag “.+?” to an action zone|Drag/.test(dom.window.document.querySelector('.drag-grip')?.getAttribute('aria-label') || ''),
  )

  await act(async () => { root.unmount() })

  // The onboarding overlay must also mount in the browser, above everything.
  dom.window.localStorage.clear()
  dom.window.history.replaceState({}, '', '/explore')
  const container2 = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(container2)
  const root2 = createRoot(container2)
  await act(async () => {
    root2.render(React.createElement(App))
  })
  const text2 = dom.window.document.body.textContent
  check('first visit shows canvas onboarding', text2.includes('Your next move starts with a drag'))
  check('onboarding includes a real save zone', Boolean(dom.window.document.querySelector('.onboard .action-zone[data-zone="save-to-desk"]')))
  check('dock stays hidden during onboarding', !dom.window.document.querySelector('.action-dock'))
  await act(async () => { root2.unmount() })

  console.log(failures === 0 ? 'APP MOUNT PASS' : `APP MOUNT FAILURES: ${failures}`)
  if (failures > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
