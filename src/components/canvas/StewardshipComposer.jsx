import { useEffect, useMemo, useState } from 'react'
import { useRE } from '../../context/REContext'
import { archiveLabel } from '../../dnd/items'
import { ZONE } from '../../dnd/zones'
import { PrepPanel } from './PrepPanel'
import { ActionZone } from './ActionZone'
import { IntentCard } from './IntentCard'

const EMPTY = { role: '', intention: '', firstTask: '' }

/**
 * Zone C — TAKE STEWARDSHIP.
 * Prepares a proposal card. Dropping it into Add plan to desk records a local
 * intention; it does not transfer ownership or imply any approval.
 */
export function StewardshipComposer() {
  const { composer, closeComposer, projectsById } = useRE()
  const project =
    composer?.kind === 'stewardship' ? projectsById.get(composer.projectId) : null
  const [values, setValues] = useState(EMPTY)
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (composer?.kind === 'stewardship') {
      setValues(EMPTY)
      setTouched({})
    }
  }, [composer?.kind, composer?.projectId])

  const errors = useMemo(() => {
    const next = {}
    if (!values.role.trim()) next.role = 'Add the skills you would bring to the work.'
    if (values.intention.trim().length < 20)
      next.intention = 'Write a little more about why you want to continue it.'
    if (!values.firstTask.trim()) next.firstTask = 'Name a first milestone.'
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
      labelledBy="stewardship-composer-title"
      eyebrow={`Zone C · Take stewardship · ${archiveLabel(project)}`}
      title={`Continue ${project.title}`}
      subtitle="Stewardship is an intention to maintain a project, subject to the original creator’s agreement. Nothing is transferred here."
      onClose={closeComposer}
      footer={
        <>
          <span className="prep-panel__foot-note">
            Prepared locally. No approval is implied and nobody is contacted.
          </span>
          <button type="button" className="btn" onClick={closeComposer}>
            Cancel
          </button>
        </>
      }
    >
      <div className="prep-field">
        <label className="field__label" htmlFor="steward-skills">
          Skills you would bring <span className="req">*</span>
        </label>
        <input
          id="steward-skills"
          className="input"
          value={values.role}
          onChange={setField('role')}
          placeholder="e.g. Backend development, community organising"
          aria-invalid={Boolean(touched.role && errors.role)}
        />
        {touched.role && errors.role && <p className="prep-error">{errors.role}</p>}
      </div>

      <div className="prep-field">
        <label className="field__label" htmlFor="steward-why">
          Why you want to continue the work <span className="req">*</span>
        </label>
        <textarea
          id="steward-why"
          className="textarea"
          style={{ minHeight: 104 }}
          value={values.intention}
          onChange={setField('intention')}
          placeholder="What you would keep, and what you would change."
          aria-invalid={Boolean(touched.intention && errors.intention)}
        />
        {touched.intention && errors.intention && (
          <p className="prep-error">{errors.intention}</p>
        )}
      </div>

      <div className="prep-field">
        <label className="field__label" htmlFor="steward-milestone">
          First proposed milestone <span className="req">*</span>
        </label>
        <input
          id="steward-milestone"
          className="input"
          value={values.firstTask}
          onChange={setField('firstTask')}
          placeholder="e.g. Ship a working shared-plot prototype"
          aria-invalid={Boolean(touched.firstTask && errors.firstTask)}
        />
        {touched.firstTask && errors.firstTask && (
          <p className="prep-error">{errors.firstTask}</p>
        )}
      </div>

      <div className="prep-preview">
        <div className="prep-preview__head">
          <span className="mono">Live proposal card</span>
          <span className="prep-preview__state" data-valid={valid}>
            {valid ? 'Ready to drag' : 'Incomplete'}
          </span>
        </div>
        <IntentCard
          project={project}
          kind="stewardship"
          values={values}
          valid={valid}
          dragId={`stewardship-${project.id}`}
        />
        <div className="prep-preview__zone">
          <ActionZone zoneId={ZONE.ADD_PLAN} variant="inline" />
        </div>
      </div>
    </PrepPanel>
  )
}
