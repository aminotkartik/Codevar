import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { COLLABORATION_OPTIONS, COLLABORATION_LABELS } from '../../data/categories'
import { useRE } from '../../context/REContext'

/**
 * PlanEditDialog — edit the stored revival plan. Local only.
 */
export function PlanEditDialog({ open, onClose, plan }) {
  const { updatePlan, pushToast } = useRE()
  const [values, setValues] = useState({
    collaboration: plan.collaboration || '',
    role: plan.role || '',
    intention: plan.intention || '',
    note: plan.note || '',
  })

  if (!plan) return null

  const setField = (field) => (event) =>
    setValues((prev) => ({ ...prev, [field]: event.target.value }))

  const save = () => {
    updatePlan(plan.id, {
      collaboration: values.collaboration,
      role: values.role.trim(),
      intention: values.intention.trim(),
      note: values.note.trim(),
    })
    pushToast('Revival plan updated.')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit revival plan"
      subtitle={`${plan.projectTitle} — ${plan.type === 'stewardship' ? 'Stewardship plan' : 'Contribution plan'}`}
      footer={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <span className="spacer" style={{ flex: 1 }} />
          <button type="button" className="btn btn--primary" onClick={save}>
            Save changes
          </button>
        </>
      }
    >
      <div className="field">
        <span className="field__label">Involvement</span>
        <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
          {COLLABORATION_OPTIONS.map((option) => (
            <label
              className="choice"
              key={option.id}
              data-checked={values.collaboration === option.id}
            >
              <input
                type="radio"
                name="plan-collaboration"
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
        <span className="field__hint">
          Currently recorded as {COLLABORATION_LABELS[values.collaboration] || '—'}.
        </span>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="plan-role">
          Skill or role
        </label>
        <input id="plan-role" className="input" value={values.role} onChange={setField('role')} />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="plan-intention">
          How you could help
        </label>
        <textarea
          id="plan-intention"
          className="textarea"
          style={{ minHeight: 90 }}
          value={values.intention}
          onChange={setField('intention')}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="plan-note">
          First proposed step
        </label>
        <input id="plan-note" className="input" value={values.note} onChange={setField('note')} />
      </div>
    </Modal>
  )
}
