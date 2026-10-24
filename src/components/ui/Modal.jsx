import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Close } from './Icons'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal — focus trap, Escape to close, focus restore, overlay dismissal,
 * and a short exit transition.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide = false,
  ariaLabel,
}) {
  const panelRef = useRef(null)
  const overlayRef = useRef(null)
  const previouslyFocused = useRef(null)
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef(null)
  const titleId = `modal-${useId()}`

  const requestClose = useCallback(() => {
    setClosing(true)
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => onClose(), 200)
  }, [onClose])

  // Dismiss when the backdrop itself is clicked (not when a child is clicked).
  const onOverlayClick = useCallback(
    (event) => {
      if (event.target === overlayRef.current) requestClose()
    },
    [requestClose],
  )

  useEffect(() => {
    if (open) setClosing(false)
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    previouslyFocused.current = document.activeElement
    const node = panelRef.current

    const focusFirst = () => {
      const target = node?.querySelector(FOCUSABLE)
      ;(target || node)?.focus()
    }
    // wait a tick so the panel is in the DOM
    const raf = window.requestAnimationFrame(focusFirst)

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        requestClose()
        return
      }
      if (event.key !== 'Tab' || !node) return

      const items = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.cancelAnimationFrame(raf)
      window.clearTimeout(closeTimer.current)
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused.current?.focus) {
        previouslyFocused.current.focus({ preventScroll: true })
      }
    }
  }, [open, requestClose])

  if (!open) return null

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      data-closing={closing}
      onMouseDown={onOverlayClick}
      role="presentation"
    >
      <div
        className={`modal${wide ? ' modal--wide' : ''}`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={ariaLabel || undefined}
        data-closing={closing}
        tabIndex={-1}
      >
        {(title || ariaLabel) && (
          <header className="modal__head">
            <div>
              {title && (
                <h2 className="modal__title" id={titleId}>
                  {title}
                </h2>
              )}
              {subtitle && <p className="modal__sub">{subtitle}</p>}
            </div>
            <button
              type="button"
              className="icon-btn modal__close"
              onClick={requestClose}
              aria-label="Close dialog"
            >
              <Close width={18} height={18} />
            </button>
          </header>
        )}

        <div className="modal__body">{children}</div>

        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  )
}
