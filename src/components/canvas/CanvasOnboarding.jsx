import { useEffect, useRef, useState } from 'react'
import { useRouter } from '../../app/router'
import { useRE } from '../../context/REContext'
import { archiveLabel, projectItem } from '../../dnd/items'
import { ZONE } from '../../dnd/zones'
import { Portal } from '../ui/Portal'
import { ActionZone } from './ActionZone'
import { DraggableDataCard } from './DraggableDataCard'
import { ArrowUpRight, Close, Grip } from '../ui/Icons'

const STEPS = [
  {
    number: '01',
    title: 'Pick up',
    text: 'Take a project card by its grip. The card lifts, and the source stays visible.',
  },
  {
    number: '02',
    title: 'Drag',
    text: 'Every card has a destination. Compatible Action Zones light up as you move.',
  },
  {
    number: '03',
    title: 'Drop',
    text: 'Release over a zone and the real action happens — saved, published, completed.',
  },
]

/**
 * First-visit onboarding for the Canvas Protocol.
 * The demonstration uses the real drag system and the real dispatcher: the
 * sample project genuinely lands on the Revival Desk.
 */
export function CanvasOnboarding() {
  const { navigate } = useRouter()
  const { prefs, projects, saved, completeOnboarding, completeTutorial } = useRE()
  const [trying, setTrying] = useState(false)
  const panelRef = useRef(null)

  const sample = projects.find((project) => project.slug === 'open-orchard') || projects[0]
  const savedSample = Boolean(sample && saved.includes(sample.id))

  useEffect(() => {
    if (prefs.onboarded) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const raf = window.requestAnimationFrame(() =>
      panelRef.current?.focus({ preventScroll: true }),
    )
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        completeOnboarding([], '')
        return
      }
      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(
        panel.querySelectorAll(
          'button:not([disabled]), a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.body.style.overflow = previousOverflow
      window.cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [prefs.onboarded, completeOnboarding])

  if (prefs.onboarded || !sample) return null

  const finish = (destination) => {
    completeOnboarding([], '')
    if (destination) navigate(destination)
  }

  return (
    <Portal>
      <div className="onboard-overlay">
        <div
          className="onboard"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboard-title"
          tabIndex={-1}
          ref={panelRef}
        >
          <button
            type="button"
            className="icon-btn onboard__close"
            onClick={() => finish('/explore')}
            aria-label="Close the introduction"
          >
            <Close width={16} height={16} />
          </button>

          <span className="eyebrow">The canvas protocol</span>
          <h2 className="onboard__title" id="onboard-title">
            Your next move starts with a drag.
          </h2>
          <p className="onboard__sub">
            Pick up a project card. Drop it into an Action Zone. RE will help you turn
            unfinished work into a concrete next step.
          </p>

          <ul className="onboard__steps">
            {STEPS.map((step) => (
              <li className="onboard__step" key={step.number}>
                <span className="onboard__step-num">{step.number}</span>
                <span className="onboard__step-title">{step.title}</span>
                <p className="onboard__step-text">{step.text}</p>
              </li>
            ))}
          </ul>

          <div className="onboard__try" data-saved={savedSample}>
            <div className="onboard__try-head">
              <span className="mono">
                {savedSample ? 'Saved — for real' : 'Try it with this card'}
              </span>
              <span className="onboard__try-note">
                {savedSample
                  ? 'Open Orchard is now on your Revival Desk.'
                  : 'Drag it into the zone below.'}
              </span>
            </div>

            <div className="onboard__try-grid">
              <DraggableDataCard
                dragId={`onboard-${sample.id}`}
                item={projectItem(sample)}
                className="onboard__sample"
                gripLabel={`Drag the sample card ${sample.title} into Save to Revival Desk`}
              >
                <div className="onboard__sample-body">
                  <span className="onboard__sample-archive">{archiveLabel(sample)}</span>
                  <strong className="onboard__sample-title">{sample.title}</strong>
                  <span className="onboard__sample-meta">{sample.stage}</span>
                </div>
              </DraggableDataCard>

              <ActionZone zoneId={ZONE.SAVE} variant="inline" />
            </div>

            {savedSample && (
              <p className="onboard__saved">
                That was a real state change, not an animation. Find it in your Revival Desk
                whenever you like.
              </p>
            )}
          </div>

          <div className="onboard__actions">
            <button type="button" className="btn btn--primary" onClick={() => finish('/explore')}>
              Start exploring
              <ArrowUpRight width={15} height={15} />
            </button>
            <button type="button" className="btn" onClick={() => setTrying((prev) => !prev)}>
              <Grip width={14} height={14} />
              {trying ? 'Hide instructions' : 'How dragging works'}
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => {
              completeTutorial()
            }}>
              Skip for now
            </button>
          </div>

          {trying && (
            <p className="onboard__keyboard">
              Keyboard: focus a card’s grip and press <kbd>Space</kbd> to lift it. Use the
              arrow keys to move between compatible Action Zones, <kbd>Space</kbd> to drop,
              and <kbd>Escape</kbd> to cancel. On touch, press and hold the grip for a moment
              before moving.
            </p>
          )}
        </div>
      </div>
    </Portal>
  )
}
