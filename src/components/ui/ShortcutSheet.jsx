import { useEffect, useRef } from 'react'
import { Portal } from './Portal'
import { SHORTCUT_GROUPS } from '../../hooks/useKeyboardShortcuts'
import { Close, Grip } from './Icons'

/**
 * ShortcutSheet — the keyboard map, on paper.
 *
 * A dialog and nothing more: it lists what the canvas already does and offers
 * no action of its own beyond closing.
 */
export function ShortcutSheet({ open, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement
    const raf = window.requestAnimationFrame(() =>
      ref.current?.querySelector('button')?.focus({ preventScroll: true }),
    )
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const panel = ref.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll('button, [href], [tabindex="0"]')).filter(
        (node) => !node.hasAttribute('disabled'),
      )
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
      document.removeEventListener('keydown', onKeyDown, true)
      window.cancelAnimationFrame(raf)
      previous?.focus?.({ preventScroll: true })
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <Portal>
      <div className="shortcut-overlay" onMouseDown={onClose} role="presentation">
        <div
          className="shortcut-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcut-title"
          ref={ref}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="shortcut-sheet__head">
            <span className="eyebrow">Keyboard</span>
            <button
              type="button"
              className="icon-btn icon-btn--sm"
              onClick={onClose}
              aria-label="Close keyboard shortcuts"
            >
              <Close width={15} height={15} />
            </button>
          </header>

          <h2 className="shortcut-sheet__title" id="shortcut-title">
            The whole archive, from the keys.
          </h2>
          <p className="shortcut-sheet__sub">
            Cards move by dragging. These keys get you there and pick them up — nothing here
            changes a record on its own.
          </p>

          <div className="shortcut-grid">
            {SHORTCUT_GROUPS.map((group) => (
              <section className="shortcut-group" key={group.id} aria-labelledby={`sc-${group.id}`}>
                <h3 className="shortcut-group__title" id={`sc-${group.id}`}>
                  {group.title}
                </h3>
                <ul className="shortcut-list">
                  {group.items.map((item) => (
                    <li className="shortcut-row" key={`${group.id}-${item.label}`}>
                      <span className="shortcut-row__keys">
                        {item.keys.map((key) => (
                          <kbd key={key}>{key}</kbd>
                        ))}
                      </span>
                      <span className="shortcut-row__label">{item.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <footer className="shortcut-sheet__foot">
            <span className="shortcut-sheet__hint">
              <Grip width={13} height={13} aria-hidden="true" />
              Mouse: the grip drags, the title opens. The rest of the sheet is paper.
            </span>
            <button type="button" className="btn btn--sm" onClick={onClose}>
              Back to the desk
            </button>
          </footer>
        </div>
      </div>
    </Portal>
  )
}
