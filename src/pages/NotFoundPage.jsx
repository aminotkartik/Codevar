import { useRouter, Link } from '../app/router'
import { ArrowUpRight, ArrowLeft } from '../components/ui/Icons'

export function NotFoundPage() {
  const { navigate } = useRouter()

  return (
    <div className="container">
      <div className="notfound">
        <p className="notfound__code" aria-hidden="true">
          RE—404
        </p>
        <span className="eyebrow">Out of the archive</span>
        <h1 className="notfound__title">This page was never finished either.</h1>
        <p className="notfound__text">
          The address you followed is not part of RE. It may be a typo, an old link, or a
          section that was planned and never written.
        </p>
        <div className="empty-state__actions">
          <Link to="/explore" className="btn btn--primary">
            Browse the archive
            <ArrowUpRight width={15} height={15} />
          </Link>
          <button type="button" className="btn" onClick={() => navigate('/')}>
            <ArrowLeft width={15} height={15} />
            Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
