import { useEffect, useMemo, useState } from 'react'
import { useRE } from '../../context/REContext'
import { COLLABORATION_OPTIONS } from '../../data/categories'
import { archiveLabel } from '../../dnd/items'
import { ZONE } from '../../dnd/zones'
import { PrepPanel } from './PrepPanel'
import { ActionZone } from './ActionZone'
import { IntentCard } from './IntentCard'

const EMPTY = { collaboration: '', role: '', intention: '', firstTask: '' }

const HELP_OPTIONS = COLLABORATION_OPTIONS.filter((option) => option.id !== 'stewardship')

/**
 * Zone B — OFFER TO HELP.
 * The project is preselected by the drop. The only way to commit the intent is
 * to drag its card into Add plan to desk; there is no Send or Save button.
 */
export function HelpComposer() {
  const { composer, closeComposer, projectsById } = useRE()
  const project = composer?.kind === 'help' ? projectsById.get(composer.projectId) : null
  const [values, setValues] = useState(EMPTY)
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (composer?.kind === 'help') {
      setValues({ ...EMPTY, collaboration: HELP_OPTIONS[0]?.id || '' })
      setTouched({})
    }
  }, [composer?.kind, composer?.projectId])

  const errors = useMemo(() => {
    const next = {}
    if (!values.collaboration) next.collaboration = 'Choose how you would like to join.'
    if (!values.role.trim()) next.role = 'Add the skill or role you would bring.'
    if (values.intention.trim().length < 10)
      next.intention = 'Write at least a sentence on how you could help.'
    return next
  }, [values])

  const valid = Object.keys(errors).length === 0
  const setField = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  if (!project) return null

  return (
    <PrepPanel
      open
      labelledBy="help-composer-title"
      eyebrow={`Zone B · Offer to help · ${archiveLabel(project)}`}
      title={`Contribute to ${project.title}`}
      subtitle="Prepare an intent card, then drag it into Add plan to desk. No message is sent to anyone."
      onClose={closeComposer}
      footer={
        <>
          <span className="prep-panel__foot-note">
            Nothing is sent. This plan lives in your browser only.
          </span>
          <button type="button" className="btn" onClick={closeComposer}>
            Cancel
          </button>
        </>
      }
    >
      <div className="prep-field">
        <span className="field__label" id="help-collab-label">
          How would you like to join? <span className="req">*</span>
        </span>
        <div className="prep-options" role="radiogroup" aria-labelledby="help-collab-label">
          {HELP_OPTIONS.map((option) => (
            <label
              className="choice"
              key={option.id}
              data-checked={values.collaboration === option.id}
            >
              <input
                type="radio"
                name="help-collaboration"
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
        <label className="field__label" htmlFor="help-role">
          Your skill or role <span className="req">*</span>
        </label>
        <input
          id="help-role"
          className="input"
          value={values.role}
          onChange={setField('role')}
          placeholder="e.g. Frontend developer, service designer"
          aria-invalid={Boolean(touched.role && errors.role)}
          aria-describedby={touched.role && errors.role ? 'help-role-error' : undefined}
        />
        {touched.role && errors.role && (
          <p className="prep-error" id="help-role-error" role="alert">
            {errors.role}
          </p>
        )}
      </div>

      <div className="prep-field">
        <label className="field__label" htmlFor="help-intention">
          How you could help <span className="req">*</span>
        </label>
        <textarea
          id="help-intention"
          className="textarea"
          style={{ minHeight: 92 }}
          value={values.intention}
          onChange={setField('intention')}
          placeholder="A sentence or two on what you could pick up."
          aria-invalid={Boolean(touched.intention && errors.intention)}
          aria-describedby={
            touched.intention && errors.intention ? 'help-intention-error' : undefined
          }
        />
        {touched.intention && errors.intention && (
          <p className="prep-error" id="help-intention-error" role="alert">
            {errors.intention}
          </p>
        )}
      </div>

      <div className="prep-field">
        <label className="field__label" htmlFor="help-first-task">
          First proposed step <span className="field__hint">(optional)</span>
        </label>
        <input
          id="help-first-task"
          className="input"
          value={values.firstTask}
          onChange={setField('firstTask')}
          placeholder="e.g. Audit keyboard navigation in the prototype"
        />
      </div>

      <div className="prep-preview">
        <div className="prep-preview__head">
          <span className="mono">Live intent card</span>
          <span className="prep-preview__state" data-valid={valid}>
            {valid ? 'Ready to drag' : 'Incomplete'}
          </span>
        </div>
        <IntentCard
          project={project}
          kind="contribution"
          values={values}
          valid={valid}
          dragId={`intent-${project.id}`}
        />
        <div className="prep-preview__zone">
          <ActionZone zoneId={ZONE.ADD_PLAN} variant="inline" />
        </div>
      </div>
    </PrepPanel>
  )
}
