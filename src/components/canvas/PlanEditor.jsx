import { useEffect, useMemo, useState } from 'react'
import { useRE } from '../../context/REContext'
import { COLLABORATION_OPTIONS } from '../../data/categories'
import { ZONE } from '../../dnd/zones'
import { PrepPanel } from './PrepPanel'
import { ActionZone } from './ActionZone'
import { PlanDraftCard } from './IntentCard'

/**
 * Zone F — UPDATE PLAN.
 * Editing produces a draggable draft card that keeps the original plan ID.
 * The drop into Update plan is the save; there is no Save changes button.
 */
export function PlanEditor() {
  const { composer, plans, closeComposer } = useRE()
  const plan = composer?.kind === 'edit-plan' ? plans.find((p) => p.id === composer.planId) : null

  const [values, setValues] = useState({
    collaboration: '',
    role: '',
    intention: '',
    firstTask: '',
  })

  useEffect(() => {
    if (plan) {
      setValues({
        collaboration: plan.collaboration || 'contributors',
        role: plan.role || '',
        intention: plan.intention || '',
        firstTask: plan.note || '',
      })
    }
  }, [plan?.id])

  const errors = useMemo(() => {
    const next = {}
    if (!values.collaboration) next.collaboration = 'Choose how you are involved.'
    if (!values.role.trim()) next.role = 'Keep a skill or role on the plan.'
    if (!values.intention.trim()) next.intention = 'The plan needs a short intention.'
    return next
  }, [values])

  const valid = Object.keys(errors).length === 0
  const setField = (field) => (event) =>
    setValues((prev) => ({ ...prev, [field]: event.target.value }))

  if (!plan) return null

  return (
    <PrepPanel
      open
      labelledBy="plan-editor-title"
      eyebrow="Zone F · Update plan"
      title={`Edit the plan for ${plan.projectTitle}`}
      subtitle="Changes are written only when the edited plan card is dropped into Update plan."
      onClose={closeComposer}
      footer={
        <>
          <span className="prep-panel__foot-note">
            The plan ID and project link stay the same.
          </span>
          <button type="button" className="btn" onClick={closeComposer}>
            Cancel
          </button>
        </>
      }
    >
      <div className="prep-field">
        <span className="field__label" id="plan-involvement-label">
          Involvement
        </span>
        <div className="prep-options" role="radiogroup" aria-labelledby="plan-involvement-label">
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
      </div>

      <div className="prep-field">
        <label className="field__label" htmlFor="plan-role">
          Skill or role
        </label>
        <input
          id="plan-role"
          className="input"
          value={values.role}
          onChange={setField('role')}
          aria-invalid={Boolean(errors.role)}
          aria-describedby={errors.role ? 'plan-role-error' : undefined}
        />
        {errors.role && (
          <p className="prep-error" id="plan-role-error" role="alert">
            {errors.role}
          </p>
        )}
      </div>

      <div className="prep-field">
        <label className="field__label" htmlFor="plan-intention">
          How you could help
        </label>
        <textarea
          id="plan-intention"
          className="textarea"
          style={{ minHeight: 92 }}
          value={values.intention}
          onChange={setField('intention')}
          aria-invalid={Boolean(errors.intention)}
          aria-describedby={errors.intention ? 'plan-intention-error' : undefined}
        />
        {errors.intention && (
          <p className="prep-error" id="plan-intention-error" role="alert">
            {errors.intention}
          </p>
        )}
      </div>

      <div className="prep-field">
        <label className="field__label" htmlFor="plan-first-task">
          First proposed step
        </label>
        <input
          id="plan-first-task"
          className="input"
          value={values.firstTask}
          onChange={setField('firstTask')}
        />
      </div>

      <div className="prep-preview">
        <div className="prep-preview__head">
          <span className="mono">Edited plan card</span>
          <span className="prep-preview__state" data-valid={valid}>
            {valid ? 'Ready to drag' : 'Incomplete'}
          </span>
        </div>
        <PlanDraftCard plan={plan} values={values} valid={valid} dragId={`plan-draft-${plan.id}`} />
        <div className="prep-preview__zone">
          <ActionZone zoneId={ZONE.UPDATE_PLAN} variant="inline" />
        </div>
      </div>
    </PrepPanel>
  )
}
