import { useEffect, useRef } from 'react'
import { useRouter, Link } from '../../app/router'
import { Close, ArrowUpRight, Plus } from '../ui/Icons'

const SECTIONS = [
  { to: '/', label: 'Home', hint: 'Overview' },
  { to: '/explore', label: 'Explore', hint: 'The archive' },
  { to: '/desk', label: 'Revival Desk', hint: 'Your plans' },
  { to: '/submit', label: 'Submit a project', hint: 'Share one' },
]

/**
 * Mobile navigation — opens beneath the header, keyboard accessible, and
 * closes on route selection.
 */
export function MobileNav({ open, onClose }) {
  const { pathname } = useRouter()
  const headingRef = useRef(null)

  useEffect(() => {
    if (open) {
      const raf = window.requestAnimationFrame(() => headingRef.current?.focus())
      return () => window.cancelAnimationFrame(raf)
    }
    return undefined
  }, [open])

  // Close when the user presses Escape anywhere while the menu is open.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="mobile-nav" id="mobile-nav" data-open="true">
      <div className="mobile-nav__head">
        <span className="mobile-nav__title" ref={headingRef} tabIndex={-1}>
          Menu
        </span>
        <button
          type="button"
          className="mobile-nav__close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <Close width={18} height={18} />
        </button>
      </div>

      <nav className="mobile-nav__list" aria-label="Mobile">
        {SECTIONS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="mobile-nav__link"
            aria-current={pathname === item.to ? 'page' : undefined}
          >
            <span>{item.label}</span>
            <small>{item.hint}</small>
          </Link>
        ))}
      </nav>

      <div className="mobile-nav__foot">
        <span className="mobile-nav__title">Ready to share something?</span>
        <span className="mobile-nav__demo">
          Demo mode — all projects here are fictional. Nothing leaves this browser.
        </span>
        <Link to="/submit" className="btn btn--primary btn--block">
          <Plus width={15} height={15} />
          <span>Submit a project</span>
        </Link>
        <Link
          to="/explore"
          className="link-arrow"
          style={{ justifyContent: 'center' }}
        >
          Browse the archive
          <ArrowUpRight width={14} height={14} />
        </Link>
      </div>
    </div>
  )
}
