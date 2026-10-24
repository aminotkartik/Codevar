import { Link } from '../../app/router'
import { Wordmark } from '../ui/Wordmark'
import { ArrowUpRight } from '../ui/Icons'

export function Footer({ onOpenShortcuts }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="footer-brand">
            <Wordmark size="lg" />
            <p>
              An open archive of unfinished possibilities. Discover projects that stopped
              halfway, see what&apos;s already built, and help something promising come to
              life.
            </p>
          </div>

          <nav className="footer-links" aria-label="Footer">
            <h4>Explore</h4>
            <Link to="/explore">All projects</Link>
            <Link to="/explore?help=Development">Needs development</Link>
            <Link to="/explore?availability=stewardship">Open to stewardship</Link>
            <Link to="/desk">Revival Desk</Link>
          </nav>

          <div className="footer-meta">
            <span>
              <span className="mono">Demo build</span>
            </span>
            <p style={{ marginTop: 0 }}>
              RE / CODE VARIANT 01. Every project here is fictional, created for this
              demonstration. Nothing is stored anywhere but this browser.
            </p>
            <Link to="/submit" className="link-arrow">
              Submit a project
              <ArrowUpRight width={14} height={14} />
            </Link>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>
            Revive ideas. Find collaborators. Build again. <span className="mono">RE—01</span>
          </span>
          <button type="button" className="footer-kbd" onClick={onOpenShortcuts}>
            <kbd>?</kbd>
            Keyboard shortcuts
          </button>
          <span>No real requests are sent. No accounts. No servers.</span>
        </div>
      </div>
    </footer>
  )
}
