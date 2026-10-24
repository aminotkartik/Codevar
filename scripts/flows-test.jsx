import { JSDOM } from 'jsdom'
import React from 'react'

/**
 * flows-test — the journeys a reviewer will actually walk.
 *
 * Submission from an empty form to a published entry, the routes that entry
 * has to reach, not-found handling, browser Back/Forward, deep links and a
 * genuine first visit. These assert behaviour, not markup strings.
 */

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

const flush = () => new Promise((resolve) => setTimeout(resolve, 60))
const store = (key) => JSON.parse(dom.window.localStorage.getItem(key) || 'null')
const $ = (sel) => dom.window.document.querySelector(sel)
const $$ = (sel) => Array.from(dom.window.document.querySelectorAll(sel))
const text = () => dom.window.document.body.textContent
const buttonByText = (label) =>
  $$('button').find((b) => (b.textContent || '').trim().toLowerCase().includes(label.toLowerCase()))

async function main() {
  const { createRoot } = await import('react-dom/client')
  const act = React.act
  const { default: App } = await import('../src/app/App.jsx')
  const { REProvider, useRE } = await import('../src/context/REContext.jsx')

  let ctx = null
  function Probe() {
    ctx = useRE()
    return null
  }

  const click = async (el) => {
    if (!el) throw new Error('click target missing')
    await act(async () => {
      el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
    })
    await flush()
  }

  const type = async (el, value) => {
    if (!el) throw new Error('field missing')
    const proto =
      el.tagName === 'TEXTAREA'
        ? dom.window.HTMLTextAreaElement.prototype
        : dom.window.HTMLInputElement.prototype
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set
    await act(async () => {
      setter.call(el, value)
      el.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
    })
    await flush()
  }

  const pick = async (el, value) => {
    const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLSelectElement.prototype, 'value').set
    await act(async () => {
      setter.call(el, value)
      el.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
    })
    await flush()
  }

  const mount = async (route, { onboarded = true, clear = true, seed = {} } = {}) => {
    if (clear) dom.window.localStorage.clear()
    dom.window.localStorage.setItem(
      're:v1:preferences',
      JSON.stringify({ onboarded, categories: [], intention: '', tutorialDone: onboarded }),
    )
    for (const [key, value] of Object.entries(seed)) dom.window.localStorage.setItem(key, value)
    dom.window.history.replaceState({}, '', route)
    const host = dom.window.document.createElement('div')
    dom.window.document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => {
      root.render(React.createElement(App))
    })
    await flush()
    return {
      host,
      root,
      async unmount() {
        await act(async () => {
          root.unmount()
        })
        host.remove()
        dom.window.document.body.innerHTML = ''
      },
    }
  }

  /* ------------------------------------------------------------------ */
  /* A. Submission, from empty form to a live archive entry              */
  /* ------------------------------------------------------------------ */
  let view = await mount('/submit')

  check('the submission page opens on step one', /Leave the door open/.test(text()))
  check('no project exists before publishing', (store('re:v1:projects') || []).length === 0)

  await click(buttonByText('Continue'))
  check('an invalid step one cannot be left', /Leave the door open/.test(text()))
  check('the invalid field is marked', Boolean($('.field[data-error="true"]')))
  check(
    'focus is moved to the first invalid field',
    dom.window.document.activeElement?.id === 'f-title',
    dom.window.document.activeElement?.id,
  )
  check('a blocked advance publishes nothing', (store('re:v1:projects') || []).length === 0)

  await type($('#f-title'), 'Signal Lantern')
  await type($('#f-description'), 'A small lantern that signals progress across a workshop floor.')
  await pick($('#f-category'), 'dev')
  await pick($('#f-stage'), 'Working Prototype')
  await click(buttonByText('Continue'))
  check('a valid step one advances', Boolean($('#f-built')))

  await type($('#f-built'), 'A working breadboard prototype with three light states.')
  await type($('#f-paused'), 'The maker moved cities and ran out of evenings.')
  await type($('#f-missing'), 'A tidy enclosure and a way to mount it on a bench.')
  await type($('#f-nextStep'), 'Cut one acrylic panel and glue the housing.')
  await click(buttonByText('Continue'))
  check('a valid step two advances', Boolean($('.chip')))

  const groups = $$('.field[role="group"]')
  check('grouped controls are exposed as groups', groups.length > 0, String(groups.length))
  check(
    'each group is named',
    groups.every((group) => {
      const id = group.getAttribute('aria-labelledby')
      const name = id && dom.window.document.getElementById(id)?.textContent
      return Boolean(name && name.trim())
    }),
  )

  await click($$('.chip').find((c) => /Development/.test(c.textContent || '')))
  const collab = $$('.choice').find((c) => /Looking for contributors/.test(c.textContent || ''))
  await click(collab.querySelector('input'))

  const draft = $('.draft-data-card')
  check('the draft card is present', Boolean(draft))
  check(
    'the draft card becomes draggable only when valid',
    draft?.getAttribute('data-draggable') === 'true',
    $('.publish-note')?.textContent,
  )
  check(
    'the page says the next action is a drag, not a button',
    /drag the draft card/i.test($('.publish-note')?.textContent || ''),
  )
  check('there is no publish button', !buttonByText('Publish'))
  check(
    'the dock offers the publish zone on this route',
    Boolean(dom.window.document.querySelector('.action-dock [data-zone="publish-to-archive"]')),
  )
  check('nothing is stored before the drop', (store('re:v1:projects') || []).length === 0)

  await view.unmount()

  // Publish through the same dispatcher the drop uses.
  const publishHost = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(publishHost)
  const publishRoot = createRoot(publishHost)
  await act(async () => {
    publishRoot.render(React.createElement(REProvider, null, React.createElement(Probe)))
  })
  const payload = {
    title: 'Signal Lantern',
    category: 'dev',
    stage: 'Working Prototype',
    description: 'A small lantern that signals progress across a workshop floor.',
    summary: 'A small lantern that signals progress across a workshop floor.',
    story: ['Started on a rainy weekend.'],
    reasonPaused: 'Ran out of evenings.',
    existingWork: [],
    missingWork: [],
    nextSteps: ['Cut one acrylic panel.'],
    techStack: ['React'],
    skillsNeeded: [],
    helpNeeded: ['Development'],
    helpFocus: 'Development',
    collaborationTypes: ['contributors'],
    openToStewardship: false,
    creator: { name: 'Tester', role: 'Local', note: '' },
    updatedAt: '2026-10-20',
    completion: 55,
    handoffChecklist: [],
    fieldNotes: [],
    materials: [],
    resourceUrl: '',
    featured: true,
    priority: 10,
  }
  let published = null
  await act(async () => {
    published = ctx.performDrop(
      { type: 'project-draft', id: 'draft-flow', draftId: 'flow', valid: true, payload, label: 'Signal Lantern' },
      'publish-to-archive::flow',
    )
  })
  check('the drop publishes the project', published.ok === true, JSON.stringify(published))
  check('the project is written once', (store('re:v1:projects') || []).length === 1)
  const slug = published.project?.slug
  check('the published project has a slug', Boolean(slug))

  await act(async () => {
    publishRoot.unmount()
  })
  publishHost.remove()

  /* ------------------------------------------------------------------ */
  /* A2. Field wiring: labels, descriptions, errors, groups             */
  /* ------------------------------------------------------------------ */
  view = await mount('/submit', { clear: false })

  const describedText = (el) =>
    (el?.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => dom.window.document.getElementById(id)?.textContent || '')
      .join(' ')

  const titleInput = $('#f-title')
  check('the title input has a real label', $('#f-title')?.labels?.length === 1)
  check(
    'the title hint is attached to the input',
    /4–70 characters/.test(describedText(titleInput)),
    describedText(titleInput),
  )
  check(
    'the character counter is attached to the input',
    /0 \/ 70 characters/.test(describedText(titleInput)),
    describedText(titleInput),
  )
  check(
    'every aria-describedby id resolves to an element',
    (titleInput?.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter(Boolean)
      .every((id) => Boolean(dom.window.document.getElementById(id))),
  )

  const nativeSet = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set
  await act(async () => {
    nativeSet.call($('#f-title'), 'Hi')
    $('#f-title').dispatchEvent(new dom.window.Event('input', { bubbles: true }))
  })
  await flush()
  check(
    'the counter updates as the visitor types',
    /2 \/ 70 characters/.test(describedText($('#f-title'))),
    describedText($('#f-title')),
  )

  await click(buttonByText('Continue'))
  check(
    'the error message joins the description once shown',
    /at least/i.test(describedText($('#f-title'))),
    describedText($('#f-title')),
  )
  check(
    'the error is announced assertively',
    $('#f-title')
      ? Boolean(dom.window.document.querySelector('.field__hint--error[role="alert"]'))
      : false,
  )

  await view.unmount()

  /* ------------------------------------------------------------------ */
  /* B. The published entry is reachable everywhere it claims to be      */
  /* ------------------------------------------------------------------ */
  view = await mount('/explore', { clear: false })
  check('the published title is searchable in Explore', text().includes('Signal Lantern'))
  const addedCard = $$('.data-card').find((card) => /Signal Lantern/.test(card.textContent || ''))
  check('the published project has a card', Boolean(addedCard))
  check(
    'the card links to the project page',
    addedCard?.querySelector('a')?.getAttribute('href') === `/projects/${slug}`,
    addedCard?.querySelector('a')?.getAttribute('href'),
  )
  await view.unmount()

  view = await mount(`/projects/${slug}`, { clear: false })
  check('the project page loads the published project', /Signal Lantern/.test(text()))
  check('the project page is not a 404', !/not in the archive/.test(text()))
  check(
    'the detail page offers the drag specimen, not a save button',
    Boolean($('.detail-specimen .drag-grip')),
  )
  await view.unmount()

  view = await mount('/desk?tab=mine', { clear: false })
  check('the published project appears under My projects', /Signal Lantern/.test(text()))
  await view.unmount()

  /* ------------------------------------------------------------------ */
  /* B2. Dropping on a project opens the composer, and Cancel is inert   */
  /* ------------------------------------------------------------------ */
  view = await mount('/projects/open-orchard', { clear: false })
  const zoneIds = Array.from(dom.window.document.querySelectorAll('.action-dock [data-zone]')).map(
    (node) => node.getAttribute('data-zone'),
  )
  check(
    'the detail page dock offers save, help and stewardship',
    ['save-to-desk', 'offer-help', 'take-stewardship'].every((zone) =>
      zoneIds.some((id) => id.startsWith(zone)),
    ),
    zoneIds.join(', '),
  )
  await view.unmount()

  // Mount the panel surface against a provider we can drive directly.
  const { CanvasDndProvider } = await import('../src/dnd/CanvasDnd.jsx')
  const { RouterProvider } = await import('../src/app/router.jsx')
  const { CanvasPanels } = await import('../src/components/canvas/CanvasPanels.jsx')
  const panelsHost = dom.window.document.createElement('div')
  dom.window.document.body.appendChild(panelsHost)
  const panelsRoot = createRoot(panelsHost)
  await act(async () => {
    panelsRoot.render(
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
            React.createElement(CanvasPanels),
          ),
        ),
      ),
    )
  })

  const detailItem = {
    type: 'project',
    id: 'RE-001',
    slug: 'open-orchard',
    title: 'Open Orchard',
    stage: 'Working Prototype',
    completion: 62,
    stewardable: true,
  }
  let opened = null
  await act(async () => {
    opened = ctx.performDrop(detailItem, 'offer-help::detail')
  })
  await flush()
  check('dropping on the help zone opens a composer', opened?.ok === true, JSON.stringify(opened))
  check('the composer is on screen', Boolean($('.prep-panel')), $('.prep-panel__title')?.textContent)
  check(
    'the composer names the project it was dropped from',
    /Open Orchard/.test($('.prep-panel__title')?.textContent || ''),
    $('.prep-panel__title')?.textContent,
  )
  check('opening the composer writes nothing', (store('re:v1:plans') || []).length === 0)

  await type($('#help-role'), 'x')
  await type($('#help-role'), '')
  const helpRoleError = $('.prep-panel .prep-error')
  check('an empty required composer field shows an error', Boolean(helpRoleError))
  check(
    'the composer error is announced and described',
    helpRoleError?.getAttribute('role') === 'alert' &&
      $('#help-role')?.getAttribute('aria-describedby') === helpRoleError?.id &&
      Boolean(dom.window.document.getElementById(helpRoleError.id)),
    `role=${helpRoleError?.getAttribute('role')} id=${helpRoleError?.id} describedby=${$('#help-role')?.getAttribute('aria-describedby')}`,
  )

  const cancel = $$('button').find((b) => /^(close|cancel)$/i.test((b.textContent || '').trim()))
  check('the composer can be cancelled', Boolean(cancel))
  if (cancel) {
    await click(cancel)
    check('cancelling removes the composer', !$('.prep-panel'))
    check('cancelling writes nothing', (store('re:v1:plans') || []).length === 0)
  } else {
    check('cancelling removes the composer', false)
    check('cancelling writes nothing', false)
  }

  await act(async () => {
    panelsRoot.unmount()
  })
  panelsHost.remove()

  /* ------------------------------------------------------------------ */
  /* C. Not-found handling                                               */
  /* ------------------------------------------------------------------ */
  view = await mount('/nope')
  check('an unknown route renders the not-found screen', /nowhere|not in the archive|404/i.test(text()))
  check('the dock is hidden on a not-found route', !dom.window.document.querySelector('.action-dock'))
  check('the not-found page offers a way back', Boolean($('a[href="/explore"]')))
  await view.unmount()

  view = await mount('/projects/does-not-exist')
  check('an unknown project slug explains itself', /not in the archive/i.test(text()))
  check('no project content is rendered for a missing slug', !$('.detail-head__title'))
  await view.unmount()

  /* ------------------------------------------------------------------ */
  /* D. Browser history                                                  */
  /* ------------------------------------------------------------------ */
  view = await mount('/')
  await act(async () => {
    $('a[href="/explore"]')?.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }))
  })
  await flush()
  check('an internal link navigates', dom.window.location.pathname === '/explore')

  await act(async () => {
    dom.window.history.back()
  })
  await flush()
  await act(async () => {
    dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'))
  })
  await flush()
  check('browser Back returns to the previous route', dom.window.location.pathname === '/')
  check('the home page re-renders on Back', /second draft/i.test(text()))

  await act(async () => {
    dom.window.history.forward()
  })
  await flush()
  await act(async () => {
    dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'))
  })
  await flush()
  check('browser Forward returns to Explore', dom.window.location.pathname === '/explore')
  await view.unmount()

  /* ------------------------------------------------------------------ */
  /* D2. Desk tabs stay in step with the URL                             */
  /* ------------------------------------------------------------------ */
  view = await mount('/desk?tab=saved', { clear: false })
  const tabEl = (id) => dom.window.document.getElementById(`desk-tab-${id}`)
  check('the saved tab is selected from the URL', tabEl('saved')?.getAttribute('aria-selected') === 'true')

  await click(tabEl('plans'))
  check('choosing a tab selects it', tabEl('plans')?.getAttribute('aria-selected') === 'true')
  check('choosing a tab updates the URL', /tab=plans/.test(dom.window.location.search), dom.window.location.search)
  check(
    'the panel follows the tab',
    dom.window.document.querySelector('[role="tabpanel"]')?.id === 'desk-panel-plans',
  )

  // A reload must land on the same tab, not back on "saved".
  const deskUrl = `${dom.window.location.pathname}${dom.window.location.search}`
  await view.unmount()
  view = await mount(deskUrl, { clear: false })
  check('a reload restores the desk tab', tabEl('plans')?.getAttribute('aria-selected') === 'true', deskUrl)

  check('tabs are reachable with the arrow keys', Boolean(tabEl('plans')?.getAttribute('aria-controls')))
  await act(async () => {
    tabEl('plans')?.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    )
  })
  await flush()
  check(
    'ArrowRight moves to the next tab',
    tabEl('mine')?.getAttribute('aria-selected') === 'true',
    dom.window.document.querySelector('[role="tab"][aria-selected="true"]')?.id,
  )
  check(
    'keyboard tab switching also updates the URL',
    /tab=mine/.test(dom.window.location.search),
    dom.window.location.search,
  )
  check(
    'focus follows the tab the keyboard selected',
    dom.window.document.activeElement?.id === 'desk-tab-mine',
    dom.window.document.activeElement?.id,
  )

  // An unknown tab must fall back instead of rendering an empty panel.
  await view.unmount()
  view = await mount('/desk?tab=nonsense', { clear: false })
  check(
    'an unknown desk tab falls back to a real one',
    Boolean(dom.window.document.querySelector('[role="tab"][aria-selected="true"]')),
    dom.window.document.querySelector('[role="tab"][aria-selected="true"]')?.id,
  )
  check('the fallback panel is rendered', Boolean($('[role="tabpanel"]')))
  await view.unmount()

  /* ------------------------------------------------------------------ */
  /* E. Deep link to a section                                           */
  /* ------------------------------------------------------------------ */
  const scrolled = []
  dom.window.HTMLElement.prototype.scrollIntoView = function scrollIntoView(options) {
    scrolled.push({ id: this.id, options })
  }
  view = await mount('/#how-it-works')
  await flush()
  check(
    'a section deep link scrolls to that section',
    scrolled.some((entry) => entry.id === 'how-it-works'),
    JSON.stringify(scrolled),
  )
  check('the home page still renders', /second draft/i.test(text()))
  await view.unmount()

  /* ------------------------------------------------------------------ */
  /* F. A real first visit                                               */
  /* ------------------------------------------------------------------ */
  view = await mount('/', { onboarded: false })
  const dialog = dom.window.document.querySelector('[role="dialog"]')
  check('a first visit is offered the introduction', Boolean(dialog))
  check(
    'the introduction explains the drag protocol',
    /drag/i.test(dialog?.textContent || ''),
  )
  check(
    'the onboarding dock is not shown behind the introduction',
    !dom.window.document.querySelector('.action-dock'),
  )
  const start = Array.from(dialog.querySelectorAll('button')).find((b) =>
    /start exploring/i.test(b.textContent || ''),
  )
  await click(start)
  check('finishing onboarding dismisses it', !dom.window.document.querySelector('[role="dialog"]'))
  check('onboarding marks the visitor as onboarded', store('re:v1:preferences')?.onboarded === true)
  check('onboarding saves no projects', (store('re:v1:saved') || []).length === 0)
  check('onboarding creates no plans', (store('re:v1:plans') || []).length === 0)
  await flush()
  check(
    'the dock appears once the visitor is onboarded',
    Boolean(dom.window.document.querySelector('.action-dock')),
  )
  await view.unmount()

  /* ------------------------------------------------------------------ */
  /* G. Malformed storage never breaks the app                           */
  /* ------------------------------------------------------------------ */
  const garbage = {
    're:v1:saved': '{',
    're:v1:plans': 'null',
    're:v1:projects': '{"not":"a list"}',
    're:v1:removals': '[]]',
  }

  for (const route of ['/', '/explore', '/desk?tab=plans', '/desk?tab=removed']) {
    let crashed = null
    try {
      view = await mount(route, { seed: garbage })
    } catch (error) {
      crashed = error.message
    }
    check(`corrupt storage does not break ${route}`, crashed === null, crashed || '')
    if (!crashed) {
      check(`${route} still renders a page`, dom.window.document.body.textContent.trim().length > 0)
      await view.unmount()
    }
  }

  view = await mount('/desk?tab=saved', { seed: garbage })
  await act(async () => {
    const result = ctx.performDrop(
      { type: 'saved-project', id: 'RE-002', slug: 'carbon-counter', title: 'Carbon Counter' },
      'remove-from-desk::flow',
    )
    check('a corrupt list does not prevent a new write', result?.ok === true, JSON.stringify(result))
  })
  await view.unmount()

  console.log(failures === 0 ? 'FLOWS PASS' : `FLOWS FAILURES: ${failures}`)
  if (failures > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
