import { useState } from 'react'
import { useRouter } from '../../app/router'
import { useRE } from '../../context/REContext'
import { Modal } from '../ui/Modal'

const EMPTY = { why: '', first: '', skills: '', acknowledged: false }

/**
 * StewardshipDialog — proposing to lead the next chapter of a project.
 * Explicitly subject to the original creator's agreement.
 */
export function StewardshipDialog({ open, onClose, project }) {
  const { navigate } = useRouter()
  const { addPlan, pushToast } = useRE()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [phase, setPhase] = useState('form')

  const setField = (field) => (event) => {
    const value = field === 'acknowledged' ? event.target.checked : event.target.value
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!values.why.trim()) next.why = 'Tell them why you want to continue it.'
    if (!values.first.trim()) next.first = 'Name what you would do first.'
    if (!values.acknowledged)
      next.acknowledged = 'Please read and acknowledge the note below.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleContinue = () => {
    if (!validate()) return
    setPhase('summary')
  }

  const handleConfirm = () => {
    addPlan({
      projectId: project.id,
      projectSlug: project.slug,
      projectTitle: project.title,
      type: 'stewardship',
      collaboration: 'stewardship',
      role: values.skills.trim(),
      intention: values.why.trim(),
      note: values.first.trim(),
    })
    setPhase('done')
    pushToast('Stewardship plan saved to your desk.')
  }

  const handleReset = () => {
    setValues(EMPTY)
    setErrors({})
    setPhase('form')
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const goToDesk = () => {
    handleReset()
    onClose()
    navigate('/desk')
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      wide
      title={
        phase === 'form'
          ? 'Request stewardship'
          : phase === 'summary'
            ? 'Check your stewardship proposal'
            : 'Stewardship plan saved'
      }
      subtitle={
        phase === 'done'
          ? undefined
          : `${project.title} — ${project.id.replace('-', '—')}`
      }
      footer={
        phase === 'form' ? (
          <>
            <span className="step-foot__note">
              This is a local plan. Ownership is not transferred.
            </span>
            <span className="spacer" style={{ flex: 1 }} />
            <button type="button" className="btn" onClick={handleClose}>
              Cancel
            </button>
            <button type="button" className="btn btn--primary" onClick={handleContinue}>
              Continue
            </button>
          </>
        ) : phase === 'summary' ? (
          <>
            <button type="button" className="btn" onClick={() => setPhase('form')}>
              Back
            </button>
            <span className="spacer" style={{ flex: 1 }} />
            <button type="button" className="btn btn--primary" onClick={handleConfirm}>
              Save stewardship plan
            </button>
          </>
        ) : (
          <>
            <button type="button" className="btn" onClick={handleClose}>
              Back to project
            </button>
            <span className="spacer" style={{ flex: 1 }} />
            <button type="button" className="btn btn--primary" onClick={goToDesk}>
              View in Revival Desk
            </button>
          </>
        )
      }
    >
      {phase === 'form' && (
        <>
          <div className="panel" style={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent-line)' }}>
            <p style={{ fontSize: 'var(--fs-small)' }}>
              Stewardship means proposing to lead the next chapter of this project, subject
              to the original creator&apos;s agreement. It is not a transfer of ownership,
              and it is not a request the creator will necessarily see.
            </p>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="stew-why">
              Why do you want to continue it? <span className="req">*</span>
            </label>
            <textarea
              id="stew-why"
              className="textarea"
              style={{ minHeight: 90 }}
              placeholder="What drew you to this project, and what do you think it still has to give?"
              value={values.why}
              onChange={setField('why')}
            />
            {errors.why && <p className="field__hint" style={{ color: 'var(--color-accent)' }}>{errors.why}</p>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="stew-first">
              What would you do first? <span className="req">*</span>
            </label>
            <textarea
              id="stew-first"
              className="textarea"
              style={{ minHeight: 90 }}
              placeholder="One concrete first step, taken from the project's own list of what's missing."
              value={values.first}
              onChange={setField('first')}
            />
            {errors.first && <p className="field__hint" style={{ color: 'var(--color-accent)' }}>{errors.first}</p>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="stew-skills">
              Skills you can bring <span className="field__hint">(optional)</span>
            </label>
            <input
              id="stew-skills"
              className="input"
              placeholder="e.g. Maintenance, testing, documentation"
              value={values.skills}
              onChange={setField('skills')}
            />
          </div>

          <label className="choice" data-checked={values.acknowledged}>
            <input
              type="checkbox"
              checked={values.acknowledged}
              onChange={setField('acknowledged')}
            />
            <span className="choice__box" aria-hidden="true" />
            <span className="choice__body">
              <span className="choice__title">
                I understand this is a local demo proposal.
              </span>
              <span className="choice__desc">
                No request is sent to the project owner and no ownership is transferred.
              </span>
            </span>
          </label>
          {errors.acknowledged && (
            <p className="field__hint" style={{ color: 'var(--color-accent)' }}>{errors.acknowledged}</p>
          )}
        </>
      )}

      {phase === 'summary' && (
        <>
          <div className="panel" style={{ background: 'var(--color-canvas)' }}>
            <div className="panel__head">
              <span className="annotation">DEMO — LOCAL ONLY</span>
              <span className="panel__spacer" />
              <span className="annotation annotation--muted">{project.id}</span>
            </div>
            <dl style={{ display: 'grid', gap: 'var(--sp-3)' }}>
              {[
                ['Project', project.title],
                ['Proposal', 'Stewardship — lead the next chapter'],
                ['Why', values.why],
                ['First step', values.first],
                ['Skills', values.skills || '—'],
              ].map(([label, value]) => (
                <div className="dossier__row" key={label} style={{ gridTemplateColumns: '130px 1fr' }}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="step-foot__note">
            Confirming stores this on your Revival Desk. The original creator has not been
            contacted, and ownership has not changed.
          </p>
        </>
      )}

      {phase === 'done' && (
        <div className="complete" style={{ border: 'none', padding: 0, textAlign: 'left' }}>
          <span className="complete__check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
              <path d="m5 12.5 4.5 4.5L19 7" />
            </svg>
          </span>
          <h3 className="complete__title">Stewardship plan drafted</h3>
          <p className="complete__text">
            Your proposal is stored locally against “{project.title}”. Nothing was sent to
            the original creator, and the project still belongs to whoever made it.
          </p>
          <div className="complete__actions">
            <button type="button" className="btn btn--primary" onClick={goToDesk}>
              View in Revival Desk
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
