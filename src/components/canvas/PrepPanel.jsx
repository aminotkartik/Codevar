import { useEffect, useRef } from 'react'
import { Portal } from '../ui/Portal'
import { Close } from '../ui/Icons'

/**
 * PrepPanel — the side sheet where a card is prepared.
 *
 * It is a dialog but not a modal: the Action Zone dock stays visible and
 * reachable so the prepared card can actually be dropped. It sits below the
 * dock in the overlay stack (dock 180, panel 140), and is portaled to <body>
 * so page stacking contexts cannot cover it.
 */
export function PrepPanel({
  open,
  title,
  eyebrow,
  subtitle,
  onClose,
  children,
  footer,
  labelledBy,
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    const raf = window.requestAnimationFrame(() => {
      const focusable = panelRef.current?.querySelector(
        'input, textarea, select, button, [tabindex]:not([tabindex="-1"])',
      )
      focusable?.focus({ preventScroll: true })
    })
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      window.cancelAnimationFrame(raf)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <Portal>
      <div className="prep-panel" role="dialog" aria-modal="false" aria-labelledby={labelledBy} ref={panelRef}>
        <header className="prep-panel__head">
          <div>
            {eyebrow && <span className="prep-panel__eyebrow">{eyebrow}</span>}
            <h2 className="prep-panel__title" id={labelledBy}>
              {title}
            </h2>
            {subtitle && <p className="prep-panel__sub">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close this preparation panel"
          >
            <Close width={16} height={16} />
          </button>
        </header>

        <div className="prep-panel__body">{children}</div>

        {footer && <footer className="prep-panel__foot">{footer}</footer>}
      </div>
    </Portal>
  )
}
