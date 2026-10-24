import { useEffect } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * useFocusTrap — keep Tab inside an open modal dialog.
 *
 * Only for surfaces that really are modal (`aria-modal="true"`). Panels that
 * must stay compatible with the Action Zone dock deliberately do not use it.
 * Focus is returned to whatever was focused before the dialog opened.
 */
export function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active) return undefined
    const previous = document.activeElement
    const raf = window.requestAnimationFrame(() => {
      const node = ref.current
      if (!node) return
      if (!node.contains(document.activeElement)) {
        const first = node.querySelector(FOCUSABLE)
        first?.focus({ preventScroll: true })
      }
    })

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return
      const node = ref.current
      if (!node) return
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

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown, true)
      if (previous && typeof previous.focus === 'function') {
        previous.focus({ preventScroll: true })
      }
    }
  }, [ref, active])
}
