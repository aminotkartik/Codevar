import { useEffect, useState } from 'react'
import { useRouter, Link } from '../app/router'
import { useRE } from '../context/REContext'
import { Modal } from '../components/ui/Modal'
import { CATEGORIES } from '../data/categories'
import { countByFacet } from '../utils/projectFilters'
import { ArrowUpRight } from '../components/ui/Icons'

const INTENTIONS = [
  {
    id: 'explore',
    label: 'I want to explore',
    description: 'Browse and save things that interest you.',
  },
  {
    id: 'contribute',
    label: 'I want to contribute',
    description: 'Find work you can pick up and help with.',
  },
  {
    id: 'unfinished',
    label: 'I have something unfinished',
    description: 'Share a project of your own.',
  },
]

/**
 * Onboarding — a small, optional, non-blocking welcome.
 * No account, no email, no personal data.
 */
export function OnboardingDialog() {
  const { navigate } = useRouter()
  const { projects, completeOnboarding } = useRE()
  const [categories, setCategories] = useState([])
  const [intention, setIntention] = useState('')
  const [done, setDone] = useState(false)

  const counts = countByFacet(projects, 'category')

  // Open on first visit.
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      document.querySelector('.modal-overlay .modal')?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(raf)
  }, [])

  const toggleCategory = (id) => {
    setCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const handleContinue = () => {
    setDone(true)
    completeOnboarding(categories, intention)
  }

  const handleFinish = () => {
    if (intention === 'unfinished') navigate('/submit')
    else navigate('/explore')
  }

  return (
    <Modal
      open
      onClose={handleContinue}
      title="What would you like to bring back?"
      subtitle="Optional, and stored only in this browser. Skip it and RE works exactly the same."
      footer={
        <>
          <button type="button" className="btn" onClick={handleContinue}>
            Skip for now
          </button>
          <span className="spacer" style={{ flex: 1 }} />
          <button type="button" className="btn btn--primary" onClick={handleContinue}>
            {done ? 'Continue' : 'Continue'}
          </button>
        </>
      }
    >
      <div className="field">
        <span className="field__label">
          What are you drawn to? <span className="field__hint">Pick any, or none.</span>
        </span>
        <div className="onboard-grid">
          {CATEGORIES.map((cat) => {
            const checked = categories.includes(cat.id)
            return (
              <label
                className="interest-opt"
                key={cat.id}
                data-checked={checked}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(cat.id)}
                />
                <span className="interest-opt__box" aria-hidden="true" />
                <span className="interest-opt__name">{cat.label}</span>
                <span className="interest-opt__count">{counts[cat.id] || 0}</span>
              </label>
            )
          })}
        </div>
      </div>

      <div className="field">
        <span className="field__label">And what are you here for?</span>
        <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
          {INTENTIONS.map((item) => (
            <label
              className="choice"
              key={item.id}
              data-checked={intention === item.id}
            >
              <input
                type="radio"
                name="intention"
                value={item.id}
                checked={intention === item.id}
                onChange={() => setIntention(item.id)}
              />
              <span className="choice__box" aria-hidden="true" />
              <span className="choice__body">
                <span className="choice__title">{item.label}</span>
                <span className="choice__desc">{item.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {intention === 'unfinished' && (
        <div className="panel" style={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent-line)' }}>
          <p style={{ fontSize: 'var(--fs-small)', margin: 0 }}>
            You don&apos;t have to finish it yourself for it to be worth sharing.{' '}
            <Link to="/submit" className="link-arrow" style={{ display: 'inline-flex' }}>
              Start a submission
              <ArrowUpRight width={13} height={13} />
            </Link>
          </p>
        </div>
      )}

      <p className="step-foot__note">
        Your choices narrow the front of the archive a little. Nothing is hidden, and you
        can reset this any time from your Revival Desk.
      </p>
    </Modal>
  )
}
