/**
 * Validation for the three-step submission form.
 * Each step returns a map of field name -> error message.
 */

export const TITLE_MIN = 4
export const TITLE_MAX = 70
export const DESCRIPTION_MIN = 30
export const DESCRIPTION_MAX = 240

const isBlank = (v) => !v || !String(v).trim()

function countChars(v) {
  return String(v || '').length
}

function validateUrl(value) {
  if (isBlank(value)) return null
  let url
  try {
    url = new URL(value.trim())
  } catch {
    return 'Enter a full web address, starting with https://'
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return 'Use an http:// or https:// address'
  }
  return null
}

export function validateStep1(values) {
  const errors = {}

  const title = String(values.title || '').trim()
  if (isBlank(title)) errors.title = 'Give the project a title.'
  else if (title.length < TITLE_MIN) errors.title = `It needs at least ${TITLE_MIN} characters.`
  else if (title.length > TITLE_MAX) errors.title = `Keep it under ${TITLE_MAX} characters.`

  const description = String(values.description || '').trim()
  if (isBlank(description)) errors.description = 'A short description helps people decide.'
  else if (countChars(description) < DESCRIPTION_MIN)
    errors.description = `A little more detail — at least ${DESCRIPTION_MIN} characters.`
  else if (countChars(description) > DESCRIPTION_MAX)
    errors.description = `Keep it under ${DESCRIPTION_MAX} characters.`

  if (isBlank(values.category)) errors.category = 'Pick a category.'
  if (isBlank(values.stage)) errors.stage = 'Pick the current stage.'

  return errors
}

export function validateStep2(values) {
  const errors = {}

  const required = [
    ['built', 'What has already been built?'],
    ['paused', 'Why did the project pause?'],
    ['missing', 'What is still missing?'],
    ['nextStep', 'What is the smallest useful next step?'],
  ]

  required.forEach(([field, label]) => {
    const value = String(values[field] || '').trim()
    if (isBlank(value)) errors[field] = `${label} is required.`
    else if (countChars(value) < 10) errors[field] = 'A sentence or two is enough to be useful.'
    else if (countChars(value) > 1400) errors[field] = 'That is longer than a handoff note should be.'
  })

  const urlError = validateUrl(values.resourceUrl)
  if (urlError) errors.resourceUrl = urlError

  return errors
}

export function validateStep3(values) {
  const errors = {}

  if (!Array.isArray(values.helpNeeded) || values.helpNeeded.length === 0)
    errors.helpNeeded = 'Choose at least one kind of help.'

  if (!values.collaboration || isBlank(values.collaboration))
    errors.collaboration = 'Choose how you would like to be joined.'

  if (values.openToStewardship === 'yes' && isBlank(values.stewardshipReason))
    errors.stewardshipReason = 'Tell them briefly why you would hand it on.'

  return errors
}

export function stepIsValid(step, errors) {
  return Object.keys(errors).length === 0
}

export const STEPS = [
  { id: 0, label: 'The idea' },
  { id: 1, label: 'The handoff' },
  { id: 2, label: 'The invitation' },
]
