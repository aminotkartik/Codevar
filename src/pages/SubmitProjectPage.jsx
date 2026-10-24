import { useMemo, useState } from 'react'
import { useRouter, Link } from '../app/router'
import { useRE } from '../context/REContext'
import { FormField, CharCounter } from '../components/forms/FormField'
import { ProjectDossier } from '../components/forms/ProjectDossier'
import { ArrowUpRight, ArrowLeft, Check } from '../components/ui/Icons'
import {
  CATEGORIES,
  STAGE_ORDER,
  HELP_NEEDED,
  COLLABORATION_OPTIONS,
} from '../data/categories'
import {
  validateStep1,
  validateStep2,
  validateStep3,
} from '../utils/projectValidation'
import { nextArchiveId, slugify, uniqueSlug } from '../utils/projectIdentifiers'
import { STEPS } from '../utils/projectValidation'
import { formatDate } from '../utils/format'

const STAGE_COMPLETION = {
  'Idea / Research': 12,
  'Early Prototype': 30,
  'Working Prototype': 55,
  'Partially Complete': 70,
  'Ready for Handoff': 85,
}

const EMPTY = {
  // step 1
  title: '',
  description: '',
  category: '',
  stage: '',
  techStack: '',
  inspiration: '',
  // step 2
  built: '',
  paused: '',
  missing: '',
  nextStep: '',
  materials: '',
  resourceUrl: '',
  // step 3
  helpNeeded: [],
  skills: '',
  collaboration: '',
  openToStewardship: 'no',
  stewardshipReason: '',
  creatorName: '',
}

export function SubmitProjectPage() {
  const { navigate } = useRouter()
  const { projects, localProjects, addProject, pushToast } = useRE()
  const [values, setValues] = useState(EMPTY)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [createdSlug, setCreatedSlug] = useState('')

  const setField = (field) => (event) => {
    const value = event.target.value
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const previewValues = useMemo(
    () => ({
      ...values,
      helpFocus: values.helpNeeded[0] || '',
    }),
    [values],
  )

  const validateCurrent = () => {
    if (step === 0) return validateStep1(values)
    if (step === 1) return validateStep2(values)
    return validateStep3(values)
  }

  const handleContinue = () => {
    const next = validateCurrent()
    setErrors(next)
    const firstKey = Object.keys(next)[0]
    if (firstKey) {
      document.getElementById(`f-${firstKey}`)?.focus({ preventScroll: false })
      return
    }
    if (step < 2) setStep(step + 1)
  }

  const handleBack = () => setStep(Math.max(0, step - 1))

  const handleSubmit = () => {
    const errors1 = validateStep1(values)
    const errors2 = validateStep2(values)
    const errors3 = validateStep3(values)
    const all = { ...errors1, ...errors2, ...errors3 }
    setErrors(all)
    if (Object.keys(all).length > 0) {
      setStep(0)
      return
    }

    const stack = values.techStack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8)

    const collab = values.collaboration
    const collaborationTypes = collab === 'coBuilder' ? ['contributors', 'coBuilder'] : ['contributors']

    const today = new Date().toISOString().slice(0, 10)

    const slug = uniqueSlug(slugify(values.title), projects)

    const project = {
      id: nextArchiveId(projects),
      slug,
      title: values.title.trim(),
      category: values.category,
      stage: values.stage,
      description: values.description.trim(),
      summary: values.description.trim(),
      story: [
        values.inspiration.trim()
          ? `${values.inspiration.trim()}`
          : `This project was submitted to RE by someone who could not finish it alone.`,
        `${values.built.trim()}`,
        `The work paused because ${values.paused.trim()}. What remains is described below.`,
      ],
      reasonPaused: values.paused.trim(),
      existingWork: [
        {
          title: 'What has already been built',
          detail: values.built.trim(),
          status: 'Partial',
          kind: 'prototype',
        },
      ],
      missingWork: [
        {
          title: 'What is still missing',
          detail: values.missing.trim(),
          skill: values.helpNeeded[0] || 'Development',
          difficulty: 'Medium',
          status: 'Not started',
        },
      ],
      nextSteps: [values.nextStep.trim()],
      techStack: stack.length ? stack : ['Not specified'],
      skillsNeeded: values.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8),
      helpNeeded: values.helpNeeded.length ? values.helpNeeded : ['Development'],
      helpFocus: values.helpNeeded[0] || 'Development',
      collaborationTypes,
      openToStewardship: values.openToStewardship === 'yes' || collab === 'stewardship',
      creator: {
        name: values.creatorName.trim() || 'Anonymous (demo submission)',
        role: 'Submitted through the RE demo',
        note: 'Added locally in this browser. This is not a real repository or a real person.',
      },
      updatedAt: today,
      completion: STAGE_COMPLETION[values.stage] ?? 30,
      handoffChecklist: [
        { label: 'Project purpose documented', met: true },
        { label: 'Current state described', met: true },
        { label: 'Next steps identified', met: Boolean(values.nextStep.trim()) },
        { label: 'Technical context available', met: stack.length > 0 },
        { label: 'Known blockers recorded', met: Boolean(values.missing.trim()) },
      ],
      fieldNotes: [
        {
          date: formatDate(today),
          text: 'Project submitted through the RE demo. Added to the local archive.',
        },
      ],
      materials: values.materials.trim()
        ? [{ label: 'Submitted notes', detail: values.materials.trim() }]
        : [],
      resourceUrl: values.resourceUrl.trim(),
      inspiration: values.inspiration.trim(),
      featured: true,
      priority: 10,
    }

    addProject(project)
    setCreatedSlug(slug)
    pushToast('Project added to your local archive.')
    setStep(3)
  }

  /* ------------------------- COMPLETION ------------------------- */
  if (step === 3) {
    return (
      <div className="container">
        <div className="complete">
          <span className="complete__check">
            <Check width={28} height={28} />
          </span>
          <h1 className="complete__title">The door is open.</h1>
          <p className="complete__text">
            “{values.title.trim()}” has been added to your local demo archive. It appears in
            Explore, it has its own page, and it shows up under My Projects on your Revival
            Desk. Nobody was notified and nothing was published anywhere — this is a
            demonstration, so it stays in this browser.
          </p>
          <div className="complete__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate(`/projects/${createdSlug}`)}
            >
              View the project page
              <ArrowUpRight width={15} height={15} />
            </button>
            <Link to="/explore" className="btn">
              See it in Explore
            </Link>
            <button type="button" className="btn" onClick={() => { setValues(EMPTY); setStep(0); setErrors({}) }}>
              Submit another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="route-in">
      <div className="container">
        <header className="page-head">
          <span className="eyebrow">Hand it on</span>
          <h1 className="page-head__title">Leave the door open.</h1>
          <p className="page-head__sub">
            Tell people what you started, what exists, and where someone else could pick up the
            work. You don&apos;t have to finish it yourself for it to be worth sharing.
          </p>
        </header>

        <div className="submit-layout">
          <form className="submit-form" onSubmit={(e) => e.preventDefault()} noValidate>
            {/* ---------------- stepper ---------------- */}
            <div className="stepper" aria-label="Submission progress">
              {STEPS.map((item, i) => (
                <div
                  key={item.label}
                  style={{ display: 'contents' }}
                >
                  <span className={`stepper__item${step === i ? ' active' : ''}`} data-state={step === i ? 'active' : i < step ? 'done' : undefined}>
                    {String(i + 1).padStart(2, '0')} / {item.label}
                  </span>
                  {i < STEPS.length - 1 && <span className="stepper__sep" aria-hidden="true" />}
                </div>
              ))}
            </div>

            {/* ---------------- step 1 ---------------- */}
            {step === 0 && (
              <div className="step-panel">
                <h2 className="section-heading__title" style={{ fontSize: 'var(--fs-h3)' }}>
                  The idea
                </h2>
                <div className="step-panel__grid" style={{ marginTop: 'var(--sp-5)' }}>
                  <FormField
                    label="Project title"
                    required
                    id="f-title"
                    error={errors.title}
                    counter={CharCounter(values.title.length, 4, 70)}
                    hint="4–70 characters. Something a stranger would remember."
                  >
                    <input
                      id="f-title"
                      className="input"
                      value={values.title}
                      onChange={setField('title')}
                      placeholder="e.g. Orchard Ledger"
                      maxLength={90}
                    />
                  </FormField>

                  <FormField
                    label="Category"
                    required
                    id="f-category"
                    error={errors.category}
                    hint="Where it belongs in the archive."
                  >
                    <select
                      id="f-category"
                      className="select"
                      value={values.category}
                      onChange={setField('category')}
                    >
                      <option value="">Choose a category…</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label="Short description"
                    required
                    id="f-description"
                    error={errors.description}
                    counter={CharCounter(values.description.length, 30, 240)}
                    hint="30–240 characters. What is it, and what state is it in?"
                  >
                    <textarea
                      id="f-description"
                      className="textarea"
                      style={{ minHeight: 96 }}
                      value={values.description}
                      onChange={setField('description')}
                      placeholder="A working prototype of a neighbourhood garden planner, paused before the shared planning features were built."
                    />
                  </FormField>

                  <FormField
                    label="Current stage"
                    required
                    id="f-stage"
                    error={errors.stage}
                    hint="Be honest — an entry marked further along than it is misleads everyone."
                  >
                    <select
                      id="f-stage"
                      className="select"
                      value={values.stage}
                      onChange={setField('stage')}
                    >
                      <option value="">Choose a stage…</option>
                      {STAGE_ORDER.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label="Technologies used"
                    id="f-techStack"
                    hint="Comma separated. Optional."
                  >
                    <input
                      id="f-techStack"
                      className="input"
                      value={values.techStack}
                      onChange={setField('techStack')}
                      placeholder="React, JavaScript, CSS"
                    />
                  </FormField>

                  <FormField
                    label="What inspired this project?"
                    id="f-inspiration"
                    hint="Optional. The one thing that made you start."
                    className="span-2"
                  >
                    <textarea
                      id="f-inspiration"
                      className="textarea"
                      style={{ minHeight: 88 }}
                      value={values.inspiration}
                      onChange={setField('inspiration')}
                      placeholder="A second failed attempt at the same thing, and the feeling that the tools were part of the problem."
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* ---------------- step 2 ---------------- */}
            {step === 1 && (
              <div className="step-panel">
                <h2 className="section-heading__title" style={{ fontSize: 'var(--fs-h3)' }}>
                  The handoff
                </h2>
                <p className="step-foot__note" style={{ marginTop: 'var(--sp-3)' }}>
                  Write for the person who finds this in six months. Specific beats complete.
                </p>

                <div className="step-panel__grid" style={{ marginTop: 'var(--sp-5)' }}>
                  <FormField
                    label="What has already been built?"
                    required
                    id="f-built"
                    error={errors.built}
                    className="span-2"
                    hint="Concrete things that exist and can be seen or run."
                  >
                    <textarea
                      id="f-built"
                      className="textarea"
                      value={values.built}
                      onChange={setField('built')}
                      placeholder="A planting calendar with a fixture dataset, an interactive plot grid, and a documented set of design tokens."
                    />
                  </FormField>

                  <FormField
                    label="Why did the project pause?"
                    required
                    id="f-paused"
                    error={errors.paused}
                    className="span-2"
                    hint="Plain facts, written respectfully. Nothing more is needed."
                  >
                    <textarea
                      id="f-paused"
                      className="textarea"
                      style={{ minHeight: 100 }}
                      value={values.paused}
                      onChange={setField('paused')}
                      placeholder="The creator took a secondment abroad and could not continue. The prototype was left usable rather than half-built."
                    />
                  </FormField>

                  <FormField
                    label="What is still missing?"
                    required
                    id="f-missing"
                    error={errors.missing}
                    className="span-2"
                    hint="Name the gaps, not the aspirations."
                  >
                    <textarea
                      id="f-missing"
                      className="textarea"
                      value={values.missing}
                      onChange={setField('missing')}
                      placeholder="Shared plot editing between neighbours, a mobile layout for one-handed use, and an accessibility audit of the drag interaction."
                    />
                  </FormField>

                  <FormField
                    label="What is the smallest useful next step?"
                    required
                    id="f-nextStep"
                    error={errors.nextStep}
                    className="span-2"
                    hint="One thing a person could do this weekend."
                  >
                    <input
                      id="f-nextStep"
                      className="input"
                      value={values.nextStep}
                      onChange={setField('nextStep')}
                      placeholder="Write a short note describing the intended data interface so a new contributor does not have to guess at it."
                    />
                  </FormField>

                  <FormField
                    label="Available materials or notes"
                    id="f-materials"
                    className="span-2"
                    hint="Optional. A description is enough — no files are uploaded in this demo."
                  >
                    <textarea
                      id="f-materials"
                      className="textarea"
                      style={{ minHeight: 88 }}
                      value={values.materials}
                      onChange={setField('materials')}
                      placeholder="Fixture dataset, component notes, and three climate frost tables."
                    />
                  </FormField>

                  <FormField
                    label="Resource link"
                    id="f-resourceUrl"
                    error={errors.resourceUrl}
                    hint="Optional. An http:// or https:// address. Nothing is fetched."
                    className="span-2"
                  >
                    <input
                      id="f-resourceUrl"
                      className="input"
                      value={values.resourceUrl}
                      onChange={setField('resourceUrl')}
                      placeholder="https://example.com/notes"
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* ---------------- step 3 ---------------- */}
            {step === 2 && (
              <div className="step-panel">
                <h2 className="section-heading__title" style={{ fontSize: 'var(--fs-h3)' }}>
                  The invitation
                </h2>
                <p className="step-foot__note" style={{ marginTop: 'var(--sp-3)' }}>
                  Say what kind of help you need so the right person can find you.
                </p>

                <div className="step-panel__grid" style={{ marginTop: 'var(--sp-5)' }}>
                  <FormField
                    label="What kind of help do you need?"
                    required
                    error={errors.helpNeeded}
                    hint="Pick as many as apply."
                    className="span-2"
                  >
                    <div className="chip-row">
                      {HELP_NEEDED.map((help) => {
                        const active = values.helpNeeded.includes(help)
                        return (
                          <button
                            type="button"
                            key={help}
                            className="chip"
                            aria-pressed={active}
                            onClick={() => {
                              setValues((prev) => ({
                                ...prev,
                                helpNeeded: active
                                  ? prev.helpNeeded.filter((h) => h !== help)
                                  : [...prev.helpNeeded, help],
                              }))
                              setErrors((prev) => ({ ...prev, helpNeeded: undefined }))
                            }}
                          >
                            {help}
                          </button>
                        )
                      })}
                    </div>
                  </FormField>

                  <FormField
                    label="Skills you need"
                    id="f-skills"
                    error={errors.skills}
                    hint="Comma separated."
                  >
                    <input
                      id="f-skills"
                      className="input"
                      value={values.skills}
                      onChange={setField('skills')}
                      placeholder="Frontend development, accessibility review"
                    />
                  </FormField>

                  <FormField
                    label="How would you like to be joined?"
                    required
                    error={errors.collaboration}
                    className="span-2"
                  >
                    <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                      {COLLABORATION_OPTIONS.map((option) => (
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
                  </FormField>

                  <FormField
                    label="Open to stewardship?"
                    className="span-2"
                    hint="Someone proposing to lead the next chapter, with your agreement."
                  >
                    <div className="chip-row">
                      {['no', 'yes'].map((value) => (
                        <button
                          type="button"
                          key={value}
                          className="chip"
                          aria-pressed={values.openToStewardship === value}
                          onClick={() => setField('openToStewardship')({ target: { value } })}
                        >
                          {value === 'yes' ? 'Yes, open to it' : 'Not right now'}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  {values.openToStewardship === 'yes' && (
                    <FormField
                      label="Why would you hand it on?"
                      id="f-stewardshipReason"
                      error={errors.stewardshipReason}
                      hint="One line is plenty."
                      className="span-2"
                    >
                      <input
                        id="f-stewardshipReason"
                        className="input"
                        value={values.stewardshipReason}
                        onChange={setField('stewardshipReason')}
                        placeholder="I can't give it the next year, and it deserves one."
                      />
                    </FormField>
                  )}

                  <FormField
                    label="Display name for the demo"
                    id="f-creatorName"
                    hint="Optional. Fictional only — never a real email or contact."
                    className="span-2"
                  >
                    <input
                      id="f-creatorName"
                      className="input"
                      value={values.creatorName}
                      onChange={setField('creatorName')}
                      placeholder="e.g. A. Demo Maker"
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* ---------------- footer ---------------- */}
            <div className="step-foot">
              <span className="step-foot__note">
                Step {step + 1} of 3. Your browser stores the result — nothing is sent.
              </span>
              <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                {step > 0 && (
                  <button type="button" className="btn" onClick={handleBack}>
                    <ArrowLeft width={15} height={15} />
                    Back
                  </button>
                )}
                {step < 2 ? (
                  <button type="button" className="btn btn--primary" onClick={handleContinue}>
                    Continue
                    <ArrowUpRight width={15} height={15} />
                  </button>
                ) : (
                  <button type="button" className="btn btn--primary" onClick={handleSubmit}>
                    Add to the archive
                    <Check width={15} height={15} />
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* ---------------- live preview ---------------- */}
          <aside className="submit-preview" aria-label="Live preview">
            <div className="section-rule">
              <span className="mono">Live preview</span>
            </div>
            <ProjectDossier values={previewValues} />
            <p className="preview-sticky-note" style={{ marginTop: 'var(--sp-3)' }}>
              This panel updates as you type. On smaller screens it sits below the form.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
