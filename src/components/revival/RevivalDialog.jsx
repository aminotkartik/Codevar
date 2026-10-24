import { useMemo, useState } from 'react'
import { useRouter } from '../../app/router'
import { useRE } from '../../context/REContext'
import { Modal } from '../ui/Modal'
import { COLLABORATION_OPTIONS, COLLABORATION_LABELS } from '../../data/categories'

const EMPTY = { collaboration: '', role: '', intention: '', note: '' }

/**
 * RevivalDialog — records a local expression of interest in helping a
 * project. It never claims a real request was sent.
 */
export function RevivalDialog({ open, onClose, project }) {
  const { navigate } = useRouter()
  const { addPlan, pushToast } = useRE()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [phase, setPhase] = useState('form') // form | summary | done

  const setField = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!values.collaboration) next.collaboration = 'Choose how you would like to join.'
    if (!values.role.trim() && !values.intention.trim())
      next.role = 'Say what you could bring, in a word or a sentence.'
    if (!values.intention.trim()) next.intention = 'A sentence on how you could help.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleContinue = () => {
    if (!validate()) return
    setPhase('summary')
  }

  const handleConfirm = () => {
    const plan = addPlan({
      projectId: project.id,
      projectSlug: project.slug,
      projectTitle: project.title,
      type: 'contribution',
      collaboration: values.collaboration,
      role: values.role.trim(),
      intention: values.intention.trim(),
      note: values.note.trim(),
    })
    setPhase('done')
    pushToast('Revival plan saved to your desk.')
    return plan
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

  const summary = useMemo(
    () => [
      { label: 'Project', value: project.title },
      { label: 'You are offering', value: COLLABORATION_LABELS[values.collaboration] || '—' },
      { label: 'Skill or role', value: values.role || '—' },
      { label: 'How you could help', value: values.intention || '—' },
      { label: 'First proposed step', value: values.note || 'Not yet proposed' },
    ],
    [project, values],
  )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      wide
      title={
        phase === 'form'
          ? 'Offer to contribute'
          : phase === 'summary'
            ? 'Check your expression of interest'
            : 'Saved to your Revival Desk'
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
              Nothing is sent anywhere. This is recorded in your browser only.
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
              Save this plan
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
          <div className="field">
            <span className="field__label">
              How would you like to join? <span className="req">*</span>
            </span>
            <span className="field__hint">
              This is a local demo plan. No project owner is notified.
            </span>
            <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
              {COLLABORATION_OPTIONS.filter((o) => o.id !== 'stewardship').map((option) => (
                <label
                  className="choice"
                  key={option.id}
                  data-checked={values.collaboration === option.id}
                >
                  <input
                    type="radio"
                    name="collaboration"
                    value={option.id}
                    checked={values.collaboration === option.id}
                    onChange={setField('collaboration')}
                  />
                  <span className="choice__box" aria-hidden="true" />
                  <span className="choice__body">
                    <span className="choice__title">{option.label}</span>
                    <span className="choice__desc">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.collaboration && <p className="field__hint" style={{ color: 'var(--color-accent)' }}>{errors.collaboration}</p>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="rev-role">
              Your skill or role <span className="req">*</span>
            </label>
            <input
              id="rev-role"
              className="input"
              placeholder="e.g. Frontend developer, service designer"
              value={values.role}
              onChange={setField('role')}
            />
            {errors.role && <p className="field__hint" style={{ color: 'var(--color-accent)' }}>{errors.role}</p>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="rev-intention">
              How you could help <span className="req">*</span>
            </label>
            <textarea
              id="rev-intention"
              className="textarea"
              style={{ minHeight: 96 }}
              placeholder="A sentence or two on what you could pick up."
              value={values.intention}
              onChange={setField('intention')}
            />
            {errors.intention && <p className="field__hint" style={{ color: 'var(--color-accent)' }}>{errors.intention}</p>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="rev-note">
              First proposed step <span className="field__hint">(optional)</span>
            </label>
            <input
              id="rev-note"
              className="input"
              placeholder="e.g. Audit keyboard navigation in the prototype"
              value={values.note}
              onChange={setField('note')}
            />
          </div>
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
              {summary.map((row) => (
                <div className="dossier__row" key={row.label} style={{ gridTemplateColumns: '130px 1fr' }}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="step-foot__note">
            Confirming stores this on your Revival Desk. It does not contact the project
            owner or commit you to anything.
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
          <h3 className="complete__title">Recorded as a local demo plan</h3>
          <p className="complete__text">
            Nothing was sent to the project owner. This intention is stored in your
            browser, tied to “{project.title}”, and appears on your Revival Desk.
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
