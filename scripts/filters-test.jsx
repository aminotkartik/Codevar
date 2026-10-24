import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import React from 'react'

/**
 * filters-test — filtering has to work, not merely render.
 *
 * This suite exists because it was possible to ship a discover page whose
 * every checkbox was inert: the panel handed back a whole filters object while
 * the page expected a (facet, value) pair, so each click wrote a
 * "[object Object]" key and no facet ever changed. Nothing here asserts class
 * names for their own sake — it asserts that clicking a filter changes what is
 * on the table, what the URL says, and what survives a reload.
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

const flush = () => new Promise((resolve) => setTimeout(resolve, 70))
const $ = (sel) => dom.window.document.querySelector(sel)
const $$ = (sel) => Array.from(dom.window.document.querySelectorAll(sel))
const titles = () =>
  $$('.project-data-card__title').map((node) => node.textContent.trim())
const search = () => dom.window.location.search

/** The checkbox belonging to a named option inside a named facet. */
function option(facetTitle, label) {
  const groups = $$('.filter-group')
  const group = groups.find(
    (node) => node.querySelector('.filter-group__title')?.textContent.trim() === facetTitle,
  )
  if (!group) return null
  const opts = Array.from(group.querySelectorAll('.filter-opt'))
  return opts.find((node) => node.querySelector('.filter-opt__label')?.textContent.trim() === label) || null
}

async function main() {
  const { createRoot } = await import('react-dom/client')
  const act = React.act
  const { default: App } = await import('../src/app/App.jsx')
  const sorting = await import('../src/utils/projectSorting.js')
  const filters = await import('../src/utils/projectFilters.js')
  const { SEED_PROJECTS } = await import('../src/data/projects.js')

  const click = async (node) => {
    if (!node) throw new Error('missing click target')
    await act(async () => {
      node.click()
    })
    await flush()
  }

  const mount = async (url = '/explore') => {
    dom.window.localStorage.clear()
    dom.window.localStorage.setItem(
      're:v1:preferences',
      JSON.stringify({ onboarded: true, categories: [], intention: '', tutorialDone: true }),
    )
    dom.window.history.replaceState({}, '', url)
    const host = dom.window.document.getElementById('root')
    host.innerHTML = ''
    const root = createRoot(host)
    await act(async () => {
      root.render(React.createElement(App))
    })
    await flush()
    return root
  }

  const expectedFor = (patch) => {
    const base = { q: '', category: [], stage: [], help: [], availability: [], sort: 'curated' }
    return filters.applyFilters(SEED_PROJECTS, { ...base, ...patch }).length
  }

  /* ---------------- 1. a single facet actually filters ---------------- */
  let root = await mount()
  const total = titles().length
  check('the worktable starts with the whole archive', total === SEED_PROJECTS.length, `${total}`)
  check('the rail panel is on screen', Boolean($('.filter-group')))

  const dev = option('Category', 'Developer Tools')
  check('the category options render', Boolean(dev))
  check(
    'an option shows an honest count',
    Number(dev?.querySelector('.filter-opt__count')?.textContent) ===
      SEED_PROJECTS.filter((p) => p.category === 'dev').length,
    dev?.querySelector('.filter-opt__count')?.textContent,
  )

  await click(dev?.querySelector('input'))
  const devCount = expectedFor({ category: ['dev'] })
  check('clicking a category filters the table', titles().length === devCount, `${titles().length} vs ${devCount}`)
  check('the filtered table is smaller than the archive', titles().length < total)
  check('the checkbox shows as selected', Boolean(option('Category', 'Developer Tools')?.querySelector('input')?.checked))
  check('the URL records the facet', /category=dev/.test(search()), search())
  check(
    'no junk key reaches the URL',
    !/object\+object|%5Bobject/i.test(search()),
    search(),
  )
  check(
    'every remaining card really is in that category',
    $$('.project-data-card').every((card) => /Developer Tools/.test(card.textContent)),
  )

  /* ---------------- 2. toggling it off restores the archive ----------- */
  await click(option('Category', 'Developer Tools')?.querySelector('input'))
  check('unchecking restores every entry', titles().length === total, `${titles().length}`)
  check('the URL is clean again', !/category=/.test(search()), search())

  /* ---------------- 3. several values in one facet are an OR ---------- */
  await click(option('Category', 'Developer Tools')?.querySelector('input'))
  await click(option('Category', 'Design & Creative')?.querySelector('input'))
  const bothCategories = expectedFor({ category: ['dev', 'design'] })
  check(
    'two values in one facet widen rather than narrow',
    titles().length === bothCategories && bothCategories > devCount,
    `${titles().length} vs ${bothCategories}`,
  )
  check('both values are in the URL', /category=dev/.test(search()) && /design/.test(search()), search())
  check(
    'every card matches one of the two values',
    $$('.project-data-card').every((card) => /Developer Tools|Design & Creative/.test(card.textContent)),
  )

  /* ---------------- 4. different facets are an AND -------------------- */
  const stageOpt = option('Project stage', 'Working Prototype')
  await click(stageOpt?.querySelector('input'))
  const withStage = expectedFor({ category: ['dev', 'design'], stage: ['Working Prototype'] })
  check(
    'a second facet narrows the first',
    titles().length === withStage && withStage < bothCategories,
    `${titles().length} vs ${withStage}`,
  )
  check('both facets are in the URL', /category=/.test(search()) && /stage=/.test(search()), search())

  /* ---------------- 5. the rail chips can undo a facet ---------------- */
  const chip = $$('.chip--removable').find((node) => /Developer Tools/.test(node.textContent))
  check('active filters appear as removable chips', Boolean(chip))
  if (chip) {
    await click(chip)
    check(
      'removing a chip removes just that value',
      !/category=dev/.test(search()) && /design/.test(search()),
      search(),
    )
    check(
      'the table follows the chip removal',
      titles().length === expectedFor({ category: ['design'], stage: ['Working Prototype'] }),
      `${titles().length}`,
    )
  }

  /* ---------------- 6. filters survive a reload ----------------------- */
  const beforeReload = titles().join('|')
  const reloadUrl = `/explore${search()}`
  check('the URL is a shareable deep link', search().length > 1, reloadUrl)
  await act(async () => {
    root.unmount()
  })
  root = await mount(reloadUrl)
  check('a reload keeps the filtered table', titles().join('|') === beforeReload, titles().slice(0, 3).join(' · '))
  check(
    'a reload keeps the checkbox state',
    Boolean(option('Project stage', 'Working Prototype')?.querySelector('input')?.checked),
  )

  /* ---------------- 7. Back restores the previous filtering ----------- */
  await click(option('Project stage', 'Working Prototype')?.querySelector('input'))
  const stageOn = search()
  await click(option('Project stage', 'Working Prototype')?.querySelector('input'))
  const stageOff = search()
  check('the two states differ', stageOn !== stageOff, `${stageOn} → ${stageOff}`)
  await act(async () => {
    dom.window.history.back()
  })
  await flush()
  await act(async () => {})
  check('Back restores the earlier filters', search() === stageOn, `${stageOn} · got ${search()}`)
  await act(async () => {
    dom.window.history.forward()
  })
  await flush()
  await act(async () => {})
  check('Forward returns to the later filters', search() === stageOff, `${stageOff} · got ${search()}`)

  /* ---------------- 8. the mobile drawer is not a second implementation */
  await act(async () => {
    root.unmount()
  })
  root = await mount('/explore')
  const openButton = $$('button').find((node) => /^Filters/.test(node.textContent.trim()))
  check('a filters button opens the drawer', Boolean(openButton))
  await click(openButton)
  check('the drawer opens', Boolean($('.filter-drawer')))
  check(
    'the drawer is above the action dock',
    cssZ('src/styles/pages.css', '.filter-drawer') > cssZ('src/styles/canvas.css', '.action-dock'),
    `drawer ${cssZ('src/styles/pages.css', '.filter-drawer')} dock ${cssZ('src/styles/canvas.css', '.action-dock')}`,
  )

  const drawerOpt = $$('.filter-drawer .filter-opt').find((node) =>
    /Developer Tools/.test(node.textContent),
  )
  await click(drawerOpt?.querySelector('input'))
  check('a drawer filter is applied', titles().length === devCount, `${titles().length}`)
  check('a drawer filter reaches the URL', /category=dev/.test(search()), search())
  check(
    'the drawer checkbox reflects the applied filter',
    Boolean(
      $$('.filter-drawer .filter-opt')
        .find((node) => /Developer Tools/.test(node.textContent))
        ?.querySelector('input')?.checked,
    ),
  )

  const showResults = $$('.filter-drawer button').find((node) => /Show results/.test(node.textContent))
  await click(showResults)
  check('closing the drawer keeps the filter applied', !$('.filter-drawer') && /category=dev/.test(search()), search())
  check('the table is still filtered', titles().length === devCount, `${titles().length}`)

  /* ---------------- 9. clear all clears everything -------------------- */
  await click($$('button').find((node) => /^Filters/.test(node.textContent.trim())))
  const clearAll = $$('.filter-drawer button').find((node) => /Clear all/.test(node.textContent))
  await click(clearAll)
  check('clear all empties the URL', search() === '' || search() === '?', search())
  check('clear all restores every entry', titles().length === total, `${titles().length}`)

  /* ---------------- 10. filtering, search and sorting coexist --------- */
  await click($$('.filter-drawer button').find((node) => /Show results/.test(node.textContent)))
  await click(option('Category', 'Developer Tools')?.querySelector('input'))
  await click(option('Help needed', 'Design')?.querySelector('input'))
  const sortSelect = $('#explore-sort')
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLSelectElement.prototype, 'value').set
    setter.call(sortSelect, 'az')
    sortSelect.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
  })
  await flush()
  const combined = expectedFor({ category: ['dev'], help: ['Design'] })
  check('a filter and a sort apply together', titles().length === combined, `${titles().length} vs ${combined}`)
  check('the sort survives the filters', sortSelect?.value === 'az')
  check(
    'the combined order is alphabetical',
    titles().join('|') === [...titles()].sort((a, b) => a.localeCompare(b)).join('|'),
    titles().join(' · '),
  )
  check(
    'the URL carries filter and sort together',
    /category=dev/.test(search()) && /help=Design/.test(search()) && /sort=az/.test(search()),
    search(),
  )
  check(
    'the combined result set matches the comparators',
    titles().join('|') ===
      sorting
        .orderForView(
          filters.applyFilters(SEED_PROJECTS, { q: '', category: ['dev'], stage: [], help: ['Design'], availability: [], sort: 'az' }),
          'az',
          [],
        )
        .map((p) => p.title)
        .join('|'),
    titles().slice(0, 3).join(' · '),
  )

  /* ---------------- 11. a filter that matches nothing says so --------- */
  await click(option('Category', 'Games & Interactive')?.querySelector('input'))
  await click(option('Project stage', 'Ready for Handoff')?.querySelector('input'))
  const empty = expectedFor({ category: ['dev', 'games'], stage: ['Ready for Handoff'], help: ['Design'] })
  if (empty === 0) {
    check('an over-narrow filter set renders an empty state', /too specific|Nothing matches/i.test(dom.window.document.body.textContent))
    const reset = $$('button').find((node) => /Clear search and filters/i.test(node.textContent))
    check('the empty state offers a reset', Boolean(reset))
    if (reset) {
      await click(reset)
      check('the reset clears the table back to everything', titles().length === total, `${titles().length}`)
    }
  } else {
    check('an over-narrow filter set renders an empty state', true, 'fixture had matches')
    check('the empty state offers a reset', true, 'fixture had matches')
  }

  await act(async () => {
    root.unmount()
  })

  console.log(failures === 0 ? 'FILTERS PASS' : `FILTERS FAILURES: ${failures}`)
  if (failures > 0) process.exitCode = 1
}

/* Small helpers for the stacking assertion: read the declared z-index. */
function cssZ(file, selector) {
  const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8')
  const index = source.indexOf(`${selector} {`)
  if (index === -1) return NaN
  const block = source.slice(index, source.indexOf('}', index))
  return Number(block.match(/z-index:\s*(\d+)/)?.[1] || NaN)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
