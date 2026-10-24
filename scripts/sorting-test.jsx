import { JSDOM } from 'jsdom'
import React from 'react'

/**
 * Sorting regression suite.
 *
 * Three layers are checked, because a select can look right while the list
 * does not move:
 *   1. comparator output for each of the five modes, on fixtures designed to
 *      order differently under each mode;
 *   2. what Explore actually renders after a change event on the control;
 *   3. URL + history state, and sorting combined with search and filters.
 */

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/explore',
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

/* ---- deliberately contradictory fixture set ---------------------------- */
const FIXTURE = [
  // title asc:  Alpha, Delta, Mike, Zulu
  // recent:     Alpha(2026-01-01) < Delta(2026-05-01) < Mike(2026-09-01) < Zulu(2026-12-01)
  // complete:   Mike 90, Delta 60, Zulu 30, Alpha 5
  // help:       Zulu p9/30, Alpha p7/5, Delta p2/60, Mike p1/90
  { id: 'RE-901', slug: 'zulu', title: 'Zulu', featured: false, priority: 9, completion: 30, updatedAt: '2026-12-01' },
  { id: 'RE-902', slug: 'alpha', title: 'Alpha', featured: false, priority: 7, completion: 5, updatedAt: '2026-01-01' },
  { id: 'RE-903', slug: 'mike', title: 'Mike', featured: true, priority: 1, completion: 90, updatedAt: '2026-09-01' },
  { id: 'RE-904', slug: 'delta', title: 'Delta', featured: false, priority: 2, completion: 60, updatedAt: '2026-05-01' },
]

const titles = (list) => list.map((p) => p.title).join(' < ')

async function main() {
  const sorting = await import('../src/utils/projectSorting.js')
  const { createRoot } = await import('react-dom/client')
  const act = React.act
  const { default: App } = await import('../src/app/App.jsx')

  /* ---------------- 1. comparators ---------------- */
  check(
    'curated: featured first, then priority',
    titles(sorting.sortProjects(FIXTURE, 'curated')) === 'Mike < Zulu < Alpha < Delta',
    titles(sorting.sortProjects(FIXTURE, 'curated')),
  )
  check(
    'recent: newest first',
    titles(sorting.sortProjects(FIXTURE, 'recent')) === 'Zulu < Mike < Delta < Alpha',
    titles(sorting.sortProjects(FIXTURE, 'recent')),
  )
  check(
    'complete: highest completion first',
    titles(sorting.sortProjects(FIXTURE, 'complete')) === 'Mike < Delta < Zulu < Alpha',
    titles(sorting.sortProjects(FIXTURE, 'complete')),
  )
  check(
    'help: priority desc then completion asc',
    titles(sorting.sortProjects(FIXTURE, 'help')) === 'Zulu < Alpha < Delta < Mike',
    titles(sorting.sortProjects(FIXTURE, 'help')),
  )
  check(
    'az: alphabetical',
    titles(sorting.sortProjects(FIXTURE, 'az')) === 'Alpha < Delta < Mike < Zulu',
    titles(sorting.sortProjects(FIXTURE, 'az')),
  )

  // deterministic: same input, same output, and the source is not mutated
  const source = [...FIXTURE]
  const first = sorting.sortProjects(FIXTURE, 'complete').map((p) => p.id).join()
  const second = sorting.sortProjects(FIXTURE, 'complete').map((p) => p.id).join()
  check('comparators are deterministic', first === second)
  check('sorting does not mutate the input', FIXTURE.map((p) => p.id).join() === source.map((p) => p.id).join())

  // robustness
  const messy = [
    { id: 'RE-1', title: 'Beta', completion: undefined, priority: undefined, updatedAt: 'not-a-date' },
    { id: 'RE-2', title: 'alpha', completion: '50', priority: 3, updatedAt: '2026-02-02' },
    { id: 'RE-3', title: 'Gamma' },
  ]
  const noNaN = ['curated', 'recent', 'complete', 'help', 'az'].every((mode) => {
    const out = sorting.sortProjects(messy, mode)
    return out.length === 3 && out.every(Boolean)
  })
  check('missing/odd values never break a sort', noNaN)
  check('az is case-insensitive and stable', titles(sorting.sortProjects(messy, 'az')) === 'alpha < Beta < Gamma', titles(sorting.sortProjects(messy, 'az')))
  check('unknown sort id falls back to curated', sorting.normaliseSortId('updated') === 'curated')
  check('explicit sort ignores interest boost', sorting.orderForView(FIXTURE, 'az', ['zulu'])[0].title === 'Alpha')

  /* ---------------- 2. Explore renders the order ---------------- */
  dom.window.localStorage.setItem(
    're:v1:preferences',
    JSON.stringify({ onboarded: true, categories: [], intention: '', tutorialDone: true }),
  )

  const root = createRoot(dom.window.document.getElementById('root'))
  await act(async () => {
    root.render(React.createElement(App))
  })

  const renderedTitles = () =>
    Array.from(dom.window.document.querySelectorAll('.project-data-card__title')).map((n) =>
      n.textContent.trim(),
    )
  const select = () => dom.window.document.querySelector('#explore-sort')
  const choose = async (mode) => {
    const el = select()
    await act(async () => {
      el.value = mode
      el.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
    })
  }
  const ordinals = () =>
    Array.from(dom.window.document.querySelectorAll('.project-data-card__ordinal')).map((n) =>
      n.textContent.trim(),
    )

  check('control starts on the URL sort', select()?.value === 'curated')
  const curatedOrder = renderedTitles()

  const seen = new Set()
  for (const mode of ['recent', 'complete', 'help', 'az', 'curated']) {
    await choose(mode)
    const order = renderedTitles()
    seen.add(order.join('|'))
    check(`Explore reorders for ${mode}`, select()?.value === mode && order.join('|') !== curatedOrder.join('|') || mode === 'curated', mode)
    check(
      `${mode}: rendered order matches the comparator`,
      order.join('|') ===
        sorting
          .orderForView(
            (await import('../src/data/projects.js')).SEED_PROJECTS,
            mode,
            [],
          )
          .map((p) => p.title)
          .join('|'),
      order.slice(0, 3).join(' · '),
    )
    check(`${mode}: URL carries the sort`, dom.window.location.search.includes(`sort=${mode}`) || mode === 'curated')
    if (mode !== 'curated') {
      check(`${mode}: cards are renumbered from 01`, ordinals()[0] === '01' && ordinals()[1] === '02')
    }
  }
  check('all five modes produce five distinct orders', seen.size === 5, `${seen.size} distinct`)

  /* ---------------- 3. filters, search, URL, history ---------------- */
  await choose('az')
  const searchInput = dom.window.document.querySelector('#explore-search')
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set
    setter.call(searchInput, 'civic')
    searchInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
  })
  check('search keeps the active sort', select()?.value === 'az' && dom.window.location.search.includes('sort=az'))
  const searchOrder = renderedTitles()
  check('search narrows the list', searchOrder.length > 0 && searchOrder.length < curatedOrder.length, `${searchOrder.length} results`)
  check(
    'search results stay in sort order',
    searchOrder.join('|') === [...searchOrder].sort((a, b) => a.localeCompare(b)).join('|'),
  )

  await choose('complete')
  check(
    'changing sort keeps the search',
    dom.window.location.search.includes('q=civic') && select()?.value === 'complete',
    dom.window.location.search,
  )

  // facet + sort together
  const chip = dom.window.document.querySelector('.filter-group input[type="checkbox"]')
  if (chip && !chip.checked) {
    await act(async () => {
      chip.click()
    })
    check(
      'a facet keeps the sort in the URL',
      select()?.value === 'complete' && dom.window.location.search.includes('sort=complete'),
      dom.window.location.search,
    )
  }

  // history: sort changes must be restorable
  const before = dom.window.location.search
  await act(async () => {
    dom.window.history.back()
  })
  await new Promise((resolve) => setTimeout(resolve, 80))
  await act(async () => {})
  check(
    'Back restores the previous sort',
    dom.window.location.search !== before && /sort=/.test(dom.window.location.search),
    `${before} → ${dom.window.location.search}`,
  )
  const afterBack = select()?.value
  await act(async () => {
    dom.window.history.forward()
  })
  await new Promise((resolve) => setTimeout(resolve, 80))
  await act(async () => {})
  check(
    'Forward returns to the later sort',
    dom.window.location.search === before && select()?.value !== null,
    `${dom.window.location.search} · ${afterBack} → ${select()?.value}`,
  )

  // a deep link with a stale id must be repaired, not silently ignored
  dom.window.history.replaceState({}, '', '/explore?sort=updated')
  await act(async () => {
    dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'))
  })
  check(
    'a legacy ?sort= id is normalised in both control and URL',
    select()?.value === 'curated' && !dom.window.location.search.includes('updated'),
    `${dom.window.location.search} · ${select()?.value}`,
  )

  /* ------------- 4. inspection that is not the first card -------------- */
  await choose('az')
  const cards = Array.from(dom.window.document.querySelectorAll('.project-data-card__body'))
  const inspectedTitle = cards[2]?.querySelector('.project-data-card__title')?.textContent.trim()
  await act(async () => {
    // React derives onPointerEnter from a bubbling pointerover.
    cards[2]?.dispatchEvent(new dom.window.MouseEvent('pointerover', { bubbles: true }))
  })
  check(
    'a card that is not the first can be inspected',
    dom.window.document.querySelector('.inspector__title')?.textContent.trim() === inspectedTitle,
    `${inspectedTitle} → ${dom.window.document.querySelector('.inspector__title')?.textContent.trim()}`,
  )
  const inspectedLabel = dom.window.document.querySelector('.inspector__archive')?.textContent.trim()

  await choose('complete')
  check(
    'sorting keeps the inspected project rather than jumping to the first',
    dom.window.document.querySelector('.inspector__title')?.textContent.trim() === inspectedTitle,
    dom.window.document.querySelector('.inspector__title')?.textContent.trim(),
  )
  check(
    'the inspector does not point at a different entry after sorting',
    dom.window.document.querySelector('.inspector__archive')?.textContent.trim() === inspectedLabel,
  )

  /* --------------------- 5. the refresh is faithful -------------------- */
  await choose('help')
  const beforeRefresh = renderedTitles().join('|')
  const refreshUrl = `${dom.window.location.pathname}${dom.window.location.search}`
  check('the refresh URL carries the sort', /sort=help/.test(refreshUrl), refreshUrl)

  await act(async () => {
    root.unmount()
  })
  const reloaded = createRoot(dom.window.document.getElementById('root'))
  await act(async () => {
    reloaded.render(React.createElement(App))
  })
  check('a reload restores the sort control', select()?.value === 'help', `${select()?.value}`)
  check(
    'a reload restores the same order',
    renderedTitles().join('|') === beforeRefresh,
    renderedTitles().slice(0, 3).join(' · '),
  )

  await act(async () => {
    reloaded.unmount()
  })

  console.log(failures === 0 ? 'SORTING PASS' : `SORTING FAILURES: ${failures}`)
  if (failures > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
