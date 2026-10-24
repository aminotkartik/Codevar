import { useEffect, useRef } from 'react'
import { useRouter, Link } from '../../app/router'
import { Wordmark } from '../ui/Wordmark'
import { Keyboard, Menu, Plus } from '../ui/Icons'

const NAV_ITEMS = [
  { id: 'explore', to: '/explore', label: 'Explore' },
  { id: 'how', href: '#how-it-works', label: 'How it works' },
  { id: 'desk', to: '/desk', label: 'Revival Desk' },
]

export function Header({ navOpen, onToggleNav, onOpenShortcuts }) {
  const { pathname, navigate } = useRouter()
  const navButtonRef = useRef(null)

  // Dismiss the mobile menu whenever the route changes.
  useEffect(() => {
    if (navOpen) {
      onToggleNav(false)
      navButtonRef.current?.focus({ preventScroll: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleHowItWorks = () => {
    if (navOpen) onToggleNav(false)
    if (pathname === '/') {
      document.getElementById('how-it-works')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    } else {
      navigate('/#how-it-works')
    }
  }

  const isActive = (to) => pathname === to

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link
          to="/"
          className="site-header__brand"
          aria-label="RE — back to home"
          onClick={() => onToggleNav(false)}
        >
          <Wordmark />
          <span className="site-header__archive">ARCHIVE / 01</span>
        </Link>

        <nav className="primary-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) =>
            item.id === 'how' ? (
              <button
                key="how"
                type="button"
                className="primary-nav__link"
                onClick={handleHowItWorks}
                aria-current={pathname === '/' ? 'page' : undefined}
              >
                How it works
              </button>
            ) : (
              <Link
                key={item.id}
                to={item.to}
                className="primary-nav__link"
                aria-current={isActive(item.to) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="header-actions">
          <span className="demo-badge" title="Local demo build — no data leaves this browser">
            Demo mode
          </span>
          <button
            type="button"
            className="header-kbd"
            onClick={onOpenShortcuts}
            aria-haspopup="dialog"
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <Keyboard width={16} height={16} />
            <span className="header-kbd__label">Shortcuts</span>
            <kbd>?</kbd>
          </button>
          <Link to="/submit" className="btn btn--primary">
            <Plus width={15} height={15} />
            <span>Submit a project</span>
          </Link>
          <button
            type="button"
            className="menu-btn"
            ref={navButtonRef}
            onClick={() => onToggleNav(!navOpen)}
            aria-expanded={navOpen}
            aria-controls="mobile-nav"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
          >
            <Menu width={20} height={20} />
          </button>
        </div>
      </div>
    </header>
  )
}
