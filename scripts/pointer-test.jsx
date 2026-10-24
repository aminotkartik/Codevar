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

// jsdom has no layout, so cards get a real box for the tilt maths.
const BOX = { left: 0, top: 0, width: 300, height: 200, right: 300, bottom: 200, x: 0, y: 0 }
dom.window.Element.prototype.getBoundingClientRect = () => BOX
dom.window.HTMLElement.prototype.scrollIntoView = () => {}

function stubPointer({ fine = true, reduced = false } = {}) {
  dom.window.matchMedia = (query) => ({
    matches: query.includes('reduced-motion') ? reduced : fine,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent() {
      return false
    },
  })
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 50))

async function mountAt(createRoot, App, path) {
  dom.window.localStorage.clear()
  dom.window.localStorage.setItem(
    're:v1:preferences',
    JSON.stringify({ onboarded: true, categories: [], intention: '', tutorialDone: true }),
  )
  dom.window.history.replaceState({}, '', path)
  const host = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(host)
  const root = createRoot(host)
  await React.act(async () => {
    root.render(React.createElement(App))
  })
  await flush()
  return { host, root }
}

async function main() {
  const { createRoot } = await import('react-dom/client')
  const { default: App } = await import('../src/app/App.jsx')

  // ---- fine pointer: cards answer the cursor ---------------------------
  stubPointer({ fine: true, reduced: false })
  let { host, root } = await mountAt(createRoot, App, '/explore')

  const card = host.querySelector('.data-card')
  check('explore renders a draggable card', Boolean(card))

  const move = async (x, y) => {
    await React.act(async () => {
      card.dispatchEvent(
        new dom.window.MouseEvent('pointermove', {
          bubbles: true,
          clientX: x,
          clientY: y,
        }),
      )
    })
    await flush()
  }

  await move(240, 40)
  check('the card tracks the pointer', card.dataset.pointer === 'true')
  check('tilt is applied around the Y axis', card.style.getPropertyValue('--tilt-y').endsWith('deg'))
  check('tilt is applied around the X axis', card.style.getPropertyValue('--tilt-x').endsWith('deg'))
  check('the raking light follows the cursor', card.style.getPropertyValue('--glow-x') !== '')
  check(
    'the tilt stays subtle',
    Math.abs(parseFloat(card.style.getPropertyValue('--tilt-y'))) <= 2.6,
    card.style.getPropertyValue('--tilt-y'),
  )

  await React.act(async () => {
    card.dispatchEvent(new dom.window.MouseEvent('pointerleave', { bubbles: true }))
  })
  await flush()
  check('leaving resets the paper', !card.dataset.pointer)
  check('no stale tilt remains', card.style.getPropertyValue('--tilt-x') === '')

  // ---- reduced motion: no listeners, no transform ----------------------
  await React.act(async () => {
    root.unmount()
  })
  host.remove()

  stubPointer({ fine: true, reduced: true })
  ;({ host, root } = await mountAt(createRoot, App, '/explore'))
  const calmCard = host.querySelector('.data-card')
  await React.act(async () => {
    calmCard.dispatchEvent(
      new dom.window.MouseEvent('pointermove', { bubbles: true, clientX: 100, clientY: 100 }),
    )
  })
  await flush()
  check('reduced motion disables the tilt', !calmCard.dataset.pointer)

  // ---- coarse pointer (touch): no listeners either ---------------------
  await React.act(async () => {
    root.unmount()
  })
  host.remove()

  stubPointer({ fine: false, reduced: false })
  ;({ host, root } = await mountAt(createRoot, App, '/explore'))
  const touchCard = host.querySelector('.data-card')
  await React.act(async () => {
    touchCard.dispatchEvent(
      new dom.window.MouseEvent('pointermove', { bubbles: true, clientX: 100, clientY: 100 }),
    )
  })
  await flush()
  check('touch devices are left alone', !touchCard.dataset.pointer)

  // ---- the drag affordances exist as state, not as hover-only styling ---
  const grip = touchCard.querySelector('.drag-grip')
  check('the grip is the only drag activator', Boolean(grip))
  check('the grip is a real button', grip.tagName === 'BUTTON')
  check('the grip is keyboard reachable', grip.tabIndex === 0)
  check('the card declares its draggable state', touchCard.dataset.draggable === 'true')

  await React.act(async () => {
    root.unmount()
  })
  host.remove()

  console.log(failures === 0 ? 'POINTER PASS' : `POINTER FAILURES: ${failures}`)
  if (failures > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
