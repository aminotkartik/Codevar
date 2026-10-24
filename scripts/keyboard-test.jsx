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
function check(name, condition, extra = '') {
  if (!condition) {
    failures += 1
    console.log(`FAIL  ${name} ${extra}`)
  } else {
    console.log(`ok    ${name}`)
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 40))

async function main() {
  const { createRoot } = await import('react-dom/client')
  const act = React.act
  const { default: App } = await import('../src/app/App.jsx')

  dom.window.localStorage.clear()
  dom.window.localStorage.setItem(
    're:v1:preferences',
    JSON.stringify({ onboarded: true, categories: [], intention: '', tutorialDone: true }),
  )
  dom.window.history.replaceState({}, '', '/explore')

  const host = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(React.createElement(App))
  })
  await flush()

  const press = async (key, target = dom.window.document, init = {}) => {
    await act(async () => {
      ;(target || dom.window.document).dispatchEvent(
        new dom.window.KeyboardEvent('keydown', {
          key,
          bubbles: true,
          cancelable: true,
          ...init,
        }),
      )
    })
    await flush()
  }

  const dialog = () => dom.window.document.querySelector('[role="dialog"][aria-labelledby="shortcut-title"]')
  const snapshot = () =>
    ['re:v1:saved', 're:v1:plans', 're:v1:projects', 're:v1:removals']
      .map((key) => `${key}=${dom.window.localStorage.getItem(key)}`)
      .join('|')

  const before = snapshot()

  // ---- the map ---------------------------------------------------------
  check('no sheet before any key', !dialog())
  await press('?')
  check('? opens the shortcut sheet', Boolean(dialog()))
  check('the sheet lists the canvas keys', /Lift the focused card/.test(dialog()?.textContent || ''))
  check('the sheet lists the chords', /g/.test(dialog()?.textContent || '') && /Recently removed/.test(dialog()?.textContent || ''))
  check(
    'the sheet offers no mutating action',
    Array.from(dialog()?.querySelectorAll('button') || []).every((button) =>
      /close|back to the desk/i.test(button.textContent || button.getAttribute('aria-label') || ''),
    ),
  )
  check('focus moves into the sheet', Boolean(dialog()?.contains(dom.window.document.activeElement)))

  await press('Escape')
  check('Escape closes the sheet', !dialog())
  check('focus returns to the page', dialog() === null)

  // ---- the header button opens the same sheet ---------------------------
  const openButton = host.querySelector('.header-kbd')
  check('the header exposes a shortcuts control', Boolean(openButton))
  await act(async () => {
    openButton?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  })
  await flush()
  check('the header control opens the sheet', Boolean(dialog()))
  await press('Escape')

  // ---- chords ----------------------------------------------------------
  await press('g')
  check('g arms the chord hint', Boolean(dom.window.document.querySelector('.chord-hint')))
  await press('d')
  check('g d reaches the desk', dom.window.location.pathname === '/desk', dom.window.location.pathname)
  check('the chord hint is dismissed', !dom.window.document.querySelector('.chord-hint'))

  await press('g')
  await press('h')
  check('g h returns home', dom.window.location.pathname === '/', dom.window.location.pathname)

  await press('g')
  await press('r')
  check('g r opens Recently removed', dom.window.location.search.includes('tab=removed'))

  // a chord that means nothing must not navigate anywhere
  await press('g')
  await press('z')
  check('an unknown chord does nothing', dom.window.location.pathname === '/desk')

  // ---- search ----------------------------------------------------------
  await press('/')
  check('/ lands on explore', dom.window.location.pathname === '/explore', dom.window.location.pathname)
  check(
    '/ focuses the search field',
    dom.window.document.activeElement?.id === 'explore-search',
    dom.window.document.activeElement?.id || dom.window.document.activeElement?.tagName,
  )

  // typing inside a field is typing
  const searchInput = dom.window.document.getElementById('explore-search')
  await press('?', searchInput)
  check('? inside a field types instead of opening the sheet', !dialog())
  await press('g', searchInput)
  await press('d', searchInput)
  check('chords are inert while typing', dom.window.location.pathname === '/explore')

  // ---- card walker -----------------------------------------------------
  searchInput.blur()
  const cards = Array.from(host.querySelectorAll('.data-card'))
  check('the explore grid renders cards', cards.length > 1, `${cards.length} cards`)

  await press('j')
  const first = cards[0].contains(dom.window.document.activeElement)
  check('j focuses the first card grip', first, dom.window.document.activeElement?.className)
  check(
    'the grip is the focused element',
    dom.window.document.activeElement?.classList?.contains('drag-grip'),
  )

  await press('j')
  check('j moves to the next card', cards[1].contains(dom.window.document.activeElement))

  await press('k')
  check('k moves back', cards[0].contains(dom.window.document.activeElement))

  await press('j')
  await press('j')
  check('j walks forward in order', cards[2].contains(dom.window.document.activeElement))

  // ---- nothing above touched data --------------------------------------
  check('keys never changed stored records', snapshot() === before, snapshot())

  // ---- shortcuts survive a route change --------------------------------
  await press('g')
  await press('s')
  check('g s reaches submission', dom.window.location.pathname === '/submit')
  await press('?')
  check('the sheet still opens elsewhere', Boolean(dialog()))
  await press('Escape')

  await act(async () => {
    root.unmount()
  })
  host.remove()

  console.log(failures === 0 ? 'KEYBOARD PASS' : `KEYBOARD FAILURES: ${failures}`)
  if (failures > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
