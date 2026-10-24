import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { SEED_PROJECTS } from '../data/projects'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/storage'
import { makeId, nextArchiveId, slugify, uniqueSlug } from '../utils/projectIdentifiers'
import {
  REMOVAL_TTL_HOURS,
  describeRemoval,
  makeRemovalReceipt,
  pruneRemovals,
  validateRestore,
} from '../utils/removals'
import {
  ZONE,
  ITEM,
  STATUS_ZONE_IDS,
  baseZoneId,
  getZone,
  rejectionMessage,
  zoneAccepts,
} from '../dnd/zones'

/**
 * REContext — one source of truth for the archive, the personal desk, the
 * drag-and-drop action dispatcher, and the local demo settings.
 *
 * Primary actions are never committed by a button. They arrive here through
 * `performDrop(item, zoneId)` after a card has been dropped into a zone.
 */

export const DEFAULT_TASKS = (firstTask = '') => [
  { id: makeId('task'), label: "Review the project's existing work.", done: false },
  {
    id: makeId('task'),
    label: firstTask.trim() || 'Identify the first achievable task.',
    done: false,
  },
  { id: makeId('task'), label: 'Write a continuation plan.', done: false },
]

export const PLAN_STATUSES = [
  { id: 'drafted', label: 'Drafted' },
  { id: 'planning', label: 'Planning' },
  { id: 'working', label: 'Working locally' },
  { id: 'archived', label: 'Archived' },
]

const REContext = createContext(null)

function asStringArray(value) {
  if (!Array.isArray(value)) return []
  return value.filter((v) => typeof v === 'string')
}

function asPlansArray(value) {
  return Array.isArray(value) ? value : []
}

function asProjectsArray(value) {
  return Array.isArray(value) ? value : []
}

function normaliseTasks(raw) {
  const source = Array.isArray(raw?.tasks)
    ? raw.tasks
    : Array.isArray(raw?.checklist)
      ? raw.checklist
      : []
  return source
    .filter((task) => task && typeof task.label === 'string')
    .map((task) => ({
      id: typeof task.id === 'string' ? task.id : makeId('task'),
      label: task.label,
      done: Boolean(task.done),
    }))
}

const PROJECT_DEFAULTS = {
  description: '',
  summary: '',
  stage: 'Paused',
  category: 'dev',
  helpFocus: 'Development',
  completion: 0,
  priority: 0,
  updatedAt: '',
}

/**
 * Local projects are read straight from localStorage, which means they can be
 * older than the current schema (or edited by hand). A missing field must never
 * blank or crash a page, so every field a card or the detail page reads is
 * given a safe default here — the stored record itself is left untouched.
 */
function normaliseProject(raw) {
  const stack = asStringArray(raw.techStack)
  const num = (value, fallback) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  const text = (value, fallback) =>
    typeof value === 'string' && value.trim() ? value : fallback

  return {
    ...raw,
    title: text(raw.title, 'Untitled project'),
    slug: raw.slug,
    description: text(raw.description ?? raw.summary, PROJECT_DEFAULTS.description),
    summary: text(raw.summary ?? raw.description, PROJECT_DEFAULTS.summary),
    stage: text(raw.stage, PROJECT_DEFAULTS.stage),
    category: text(raw.category, PROJECT_DEFAULTS.category),
    helpFocus: text(raw.helpFocus, PROJECT_DEFAULTS.helpFocus),
    completion: Math.min(100, Math.max(0, num(raw.completion, PROJECT_DEFAULTS.completion))),
    priority: num(raw.priority, PROJECT_DEFAULTS.priority),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : PROJECT_DEFAULTS.updatedAt,
    techStack: stack.length > 0 ? stack : ['Not specified'],
    skillsNeeded: asStringArray(raw.skillsNeeded),
    helpNeeded: asStringArray(raw.helpNeeded),
    collaborationTypes: asStringArray(raw.collaborationTypes),
    story: Array.isArray(raw.story) ? raw.story : [],
    existingWork: Array.isArray(raw.existingWork) ? raw.existingWork : [],
    missingWork: Array.isArray(raw.missingWork) ? raw.missingWork : [],
    nextSteps: Array.isArray(raw.nextSteps) ? raw.nextSteps : [],
    materials: Array.isArray(raw.materials) ? raw.materials : [],
    fieldNotes: Array.isArray(raw.fieldNotes) ? raw.fieldNotes : [],
    handoffChecklist: Array.isArray(raw.handoffChecklist) ? raw.handoffChecklist : [],
    featured: Boolean(raw.featured),
    openToStewardship: Boolean(raw.openToStewardship),
    creator:
      raw.creator && typeof raw.creator === 'object'
        ? raw.creator
        : { name: 'Anonymous', role: 'Unknown', note: '' },
  }
}

function normalisePlan(raw) {
  const tasks = normaliseTasks(raw)
  return {
    ...raw,
    tasks: tasks.length > 0 ? tasks : DEFAULT_TASKS(),
    type: raw.type === 'stewardship' ? 'stewardship' : 'contribution',
    status: PLAN_STATUSES.some((s) => s.id === raw.status) ? raw.status : 'drafted',
  }
}

const clone = (value) => JSON.parse(JSON.stringify(value))

export function REProvider({ children }) {
  const [savedRaw, setSaved] = useLocalStorage(STORAGE_KEYS.saved, [])
  const [plansRaw, setPlans] = useLocalStorage(STORAGE_KEYS.plans, [])
  const [localProjectsRaw, setLocalProjects] = useLocalStorage(STORAGE_KEYS.projects, [])
  const [removalsRaw, setRemovals] = useLocalStorage(STORAGE_KEYS.removals, [])
  const [prefsRaw, setPrefs] = useLocalStorage(STORAGE_KEYS.preferences, {
    onboarded: false,
    categories: [],
    intention: '',
    tutorialDone: false,
  })

  const [toasts, setToasts] = useState([])
  const [liveMessage, setLiveMessage] = useState(null)
  const [composer, setComposer] = useState(null) // { kind, projectId, planId }
  const [pendingRemoval, setPendingRemoval] = useState(null)
  const [lastPublished, setLastPublished] = useState(null)
  const toastSeq = useRef(0)

  // ---- defensive normalisation ------------------------------------------
  const saved = useMemo(() => [...new Set(asStringArray(savedRaw))], [savedRaw])

  const localProjects = useMemo(
    () =>
      asProjectsArray(localProjectsRaw)
        .filter((p) => p && typeof p.id === 'string' && typeof p.slug === 'string')
        .map(normaliseProject),
    [localProjectsRaw],
  )

  const plans = useMemo(
    () =>
      asPlansArray(plansRaw)
        .filter((p) => p && typeof p.id === 'string' && typeof p.projectId === 'string')
        .map(normalisePlan),
    [plansRaw],
  )

  const prefs = useMemo(
    () => ({
      onboarded: Boolean(prefsRaw?.onboarded),
      categories: asStringArray(prefsRaw?.categories),
      intention: typeof prefsRaw?.intention === 'string' ? prefsRaw.intention : '',
      tutorialDone: Boolean(prefsRaw?.tutorialDone),
    }),
    [prefsRaw],
  )

  // ---- removal receipts -------------------------------------------------
  // Expired or malformed receipts are dropped on read, so the desk can never
  // offer a restore whose snapshot is gone. A slow tick keeps the countdown
  // honest on a desk that is left open across the window.
  const [clockNow, setClockNow] = useState(() => Date.now())

  useEffect(() => {
    if (!Array.isArray(removalsRaw) || removalsRaw.length === 0) return undefined
    const interval = window.setInterval(() => setClockNow(Date.now()), 60000)
    return () => window.clearInterval(interval)
  }, [removalsRaw])

  const removals = useMemo(() => pruneRemovals(removalsRaw, clockNow), [removalsRaw, clockNow])

  useEffect(() => {
    const stored = Array.isArray(removalsRaw) ? removalsRaw : []
    if (removals.length === stored.length) return
    // Rewrite only when something actually aged out, so this cannot loop.
    setRemovals(removals)
  }, [removals, removalsRaw, setRemovals])

  // ---- data -------------------------------------------------------------
  const projects = useMemo(() => [...localProjects, ...SEED_PROJECTS], [localProjects])

  const projectsBySlug = useMemo(() => {
    const map = new Map()
    projects.forEach((p) => map.set(p.slug, p))
    return map
  }, [projects])

  const projectsById = useMemo(() => {
    const map = new Map()
    projects.forEach((p) => map.set(p.id, p))
    return map
  }, [projects])

  const localProjectIds = useMemo(
    () => new Set(localProjects.map((p) => p.id)),
    [localProjects],
  )

  // ---- feedback ---------------------------------------------------------
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const announce = useCallback((text) => {
    toastSeq.current += 1
    setLiveMessage({ id: toastSeq.current, text })
  }, [])

  const pushToast = useCallback(
    (text, tone = 'info', action = null) => {
      const id = makeId('toast')
      // `action` may only reveal the receipt card — never restore by itself.
      setToasts((prev) => [...prev.slice(-2), { id, text, tone, action }])
      announce(text)
      return id
    },
    [announce],
  )

  // ---- personal desk ----------------------------------------------------
  const isSaved = useCallback((id) => saved.includes(id), [saved])

  const saveProject = useCallback(
    (id) => {
      if (saved.includes(id)) return false
      setSaved((prev) => {
        const list = asStringArray(prev)
        return list.includes(id) ? list : [id, ...list]
      })
      return true
    },
    [saved, setSaved],
  )

  const removeSavedProject = useCallback(
    (id) => {
      setSaved((prev) => asStringArray(prev).filter((x) => x !== id))
    },
    [setSaved],
  )

  const updatePlan = useCallback(
    (id, patch) => {
      setPlans((prev) =>
        asPlansArray(prev).map((p) => (p.id === id ? { ...p, ...patch } : p)),
      )
    },
    [setPlans],
  )

  const removePlan = useCallback(
    (id) => {
      setPlans((prev) => asPlansArray(prev).filter((p) => p.id !== id))
    },
    [setPlans],
  )

  // Receipts are capped and pruned as they are written, so storage can never
  // accumulate snapshots nobody can act on.
  const recordReceipt = useCallback(
    (receipt) => {
      setRemovals((prev) => pruneRemovals([receipt, ...(Array.isArray(prev) ? prev : [])]))
    },
    [setRemovals],
  )

  const setTaskDone = useCallback(
    (planId, taskId, done) => {
      setPlans((prev) =>
        asPlansArray(prev).map((p) => {
          if (p.id !== planId) return p
          const tasks = normaliseTasks(p).map((task) =>
            task.id === taskId ? { ...task, done } : task,
          )
          return { ...p, tasks }
        }),
      )
    },
    [setPlans],
  )

  const addLocalProject = useCallback(
    (payload) => {
      const slug = uniqueSlug(slugify(payload.title), projects)
      const project = {
        ...payload,
        id: nextArchiveId(projects),
        slug,
      }
      setLocalProjects((prev) => [project, ...asProjectsArray(prev)])
      return project
    },
    [projects, setLocalProjects],
  )

  // Removing a project you published also removes the revival plans that point
  // at it: a plan for a 404 is a dead link with a sob story.
  const removeLocalProject = useCallback(
    (id) => {
      setLocalProjects((prev) => asProjectsArray(prev).filter((p) => p.id !== id))
      setSaved((prev) => asStringArray(prev).filter((x) => x !== id))
      setPlans((prev) => asPlansArray(prev).filter((p) => p.projectId !== id))
    },
    [setLocalProjects, setSaved, setPlans],
  )

  // ---- composers --------------------------------------------------------
  const openComposer = useCallback((kind, payload = {}) => {
    setComposer({ kind, ...payload })
  }, [])

  const closeComposer = useCallback(() => setComposer(null), [])

  const clearPendingRemoval = useCallback(() => {
    setPendingRemoval(null)
  }, [])

  // ---- preferences ------------------------------------------------------
  const completeOnboarding = useCallback(
    (categories, intention) => {
      setPrefs((prev) => ({
        ...prev,
        onboarded: true,
        categories: asStringArray(categories),
        intention: intention || '',
      }))
    },
    [setPrefs],
  )

  const completeTutorial = useCallback(() => {
    setPrefs((prev) => ({ ...prev, onboarded: true, tutorialDone: true }))
  }, [setPrefs])

  const resetOnboarding = useCallback(() => {
    setPrefs((prev) => ({
      ...prev,
      onboarded: false,
      categories: [],
      intention: '',
      tutorialDone: false,
    }))
  }, [setPrefs])

  const resetDemo = useCallback(() => {
    setSaved([])
    setPlans([])
    setLocalProjects([])
    setRemovals([])
    setPrefs({
      onboarded: true,
      categories: [],
      intention: '',
      tutorialDone: true,
    })
    setComposer(null)
    setPendingRemoval(null)
    setLastPublished(null)
  }, [setSaved, setPlans, setLocalProjects, setRemovals, setPrefs])

  // ======================================================================
  // THE DISPATCHER — a drop is the only way a primary action happens.
  // ======================================================================
  const performDrop = useCallback(
    (item, rawZoneId) => {
      const zoneId = baseZoneId(rawZoneId) || rawZoneId
      const reject = (message) => {
        pushToast(message, 'warning')
        return { ok: false, message }
      }

      if (!item) return reject('That card could not be read, so nothing changed.')
      if (!zoneId) return reject('That card was dropped outside an Action Zone. Nothing changed.')
      if (!zoneAccepts(zoneId, item)) {
        return reject(rejectionMessage(zoneId, item))
      }

      switch (zoneId) {
        /* ---- Zone A ------------------------------------------------- */
        case ZONE.SAVE: {
          if (saved.includes(item.id)) {
            return reject('This project is already on your Revival Desk.')
          }
          saveProject(item.id)
          const message = `Added “${item.label}” to your Revival Desk.`
          pushToast(message)
          return { ok: true, message }
        }

        /* ---- Zone B ------------------------------------------------- */
        case ZONE.HELP: {
          openComposer('help', { projectId: item.id })
          pushToast('Contribution composer opened. Prepare your intent card, then drag it into Add plan to desk.')
          return { ok: true, message: 'composer:help' }
        }

        /* ---- Zone C ------------------------------------------------- */
        case ZONE.STEWARDSHIP: {
          if (item.stewardable === false) {
            return reject('This project is not open to stewardship, so no proposal was prepared.')
          }
          openComposer('stewardship', { projectId: item.id })
          pushToast('Stewardship preparation opened. Your proposal is ready when its card is.')
          return { ok: true, message: 'composer:stewardship' }
        }

        /* ---- Zone D ------------------------------------------------- */
        case ZONE.ADD_PLAN: {
          const values = item.values || {}
          const project = projectsById.get(item.projectId)
          if (!project) return reject('That project is no longer in the archive, so no plan was added.')

          const plan = {
            id: makeId('plan'),
            projectId: project.id,
            projectSlug: project.slug,
            projectTitle: project.title,
            type: item.type === ITEM.STEWARDSHIP ? 'stewardship' : 'contribution',
            collaboration:
              values.collaboration || (item.type === ITEM.STEWARDSHIP ? 'stewardship' : ''),
            role: (values.role || '').trim(),
            intention: (values.intention || '').trim(),
            note: (values.firstTask || '').trim(),
            createdAt: new Date().toISOString(),
            status: 'drafted',
            tasks: DEFAULT_TASKS(values.firstTask),
          }
          setPlans((prev) => [plan, ...asPlansArray(prev)])
          setComposer(null)
          const message =
            plan.type === 'stewardship'
              ? 'Stewardship proposal added to your Revival Desk. It is a local plan; ownership has not changed.'
              : 'Contribution plan added to your Revival Desk.'
          pushToast(message)
          return { ok: true, message, plan }
        }

        /* ---- Zone E ------------------------------------------------- */
        case ZONE.PUBLISH: {
          const payload = item.payload
          if (!payload) return reject('That draft has no content yet, so nothing was published.')
          const project = addLocalProject(payload)
          setLastPublished({
            draftId: item.draftId,
            slug: project.slug,
            title: project.title,
            at: Date.now(),
          })
          const message = `“${project.title}” is now in the local RE demo archive.`
          pushToast(message)
          return { ok: true, message, project }
        }

        /* ---- Zone F ------------------------------------------------- */
        case ZONE.UPDATE_PLAN: {
          const plan = plans.find((p) => p.id === item.planId)
          if (!plan) return reject('That plan is no longer on your desk, so nothing was updated.')
          const values = item.values || {}
          updatePlan(plan.id, {
            collaboration: values.collaboration || plan.collaboration,
            role: (values.role || '').trim(),
            intention: (values.intention || '').trim(),
            note: (values.firstTask || '').trim(),
            updatedAt: new Date().toISOString(),
          })
          setComposer(null)
          const message = 'Plan updated locally. Its plan ID and project link are unchanged.'
          pushToast(message)
          return { ok: true, message }
        }

        /* ---- Zone J: plan status, committed by a drop ----------------- */
        case ZONE.STATUS_DRAFTED:
        case ZONE.STATUS_PLANNING:
        case ZONE.STATUS_WORKING:
        case ZONE.STATUS_ARCHIVED: {
          const zone = getZone(zoneId)
          const plan = plans.find((p) => p.id === item.planId)
          if (!plan) return reject('That plan is no longer on your desk, so its status was not changed.')
          if (plan.status === zone.statusId) {
            return reject(`“${plan.projectTitle}” is already marked as ${zone.label.toLowerCase()}.`)
          }
          updatePlan(plan.id, { status: zone.statusId, statusUpdatedAt: new Date().toISOString() })
          const message = `“${plan.projectTitle}” marked as ${zone.label.toLowerCase()}.`
          pushToast(message)
          return { ok: true, message }
        }

        /* ---- Zone G ------------------------------------------------- */
        case ZONE.REMOVE: {
          const isPlan = item.type === ITEM.PLAN
          const removal = {
            token: makeId('pending'),
            kind: isPlan ? 'plan' : 'saved',
            targetId: item.id,
            label: item.label,
            detail: isPlan
              ? 'This revival plan will be removed from your desk. The project stays in the archive.'
              : 'This project will leave your desk. It stays in the archive for everyone else.',
          }
          setPendingRemoval(removal)
          const message = isPlan
            ? 'Pending removal created. Drop the pending card into Confirm removal, or cancel.'
            : 'Pending removal created. Drop the pending card into Confirm removal, or cancel.'
          pushToast(message)
          return { ok: true, message, removal }
        }

        /* ---- Zone H ------------------------------------------------- */
        case ZONE.DISCARD: {
          if (!localProjectIds.has(item.id)) {
            return reject('Seeded archive projects cannot be discarded. Only projects you published locally can be.')
          }
          const relatedPlans = asPlansArray(plans).filter(
            (plan) => plan.projectId === item.id,
          ).length
          setPendingRemoval({
            token: makeId('pending'),
            kind: 'project',
            targetId: item.id,
            label: item.label,
            detail:
              relatedPlans > 0
                ? `This locally created project will be removed from Explore and from My projects, along with ${relatedPlans} revival plan${relatedPlans === 1 ? '' : 's'} for it. Saved copies of archive projects are not affected.`
                : 'This locally created project will be removed from Explore and from My projects. Nothing else is touched.',
          })
          pushToast('Pending discard created. Drop the pending card into Confirm removal, or cancel.')
          return { ok: true, message: 'pending:discard' }
        }

        /* ---- Zone I ------------------------------------------------- */
        case ZONE.COMPLETED: {
          setTaskDone(item.planId, item.taskId, true)
          const message = 'Task marked complete. Plan progress updated.'
          pushToast(message)
          return { ok: true, message }
        }

        case ZONE.REOPEN: {
          setTaskDone(item.planId, item.taskId, false)
          const message = 'Task reopened and returned to the active checklist.'
          pushToast(message)
          return { ok: true, message }
        }

        /* ---- Confirmation drop -------------------------------------- */
        case ZONE.CONFIRM_REMOVAL: {
          if (!pendingRemoval || item.removalToken !== pendingRemoval.token) {
            return reject('There is no matching pending removal, so nothing was deleted.')
          }
          const removal = pendingRemoval
          const now = Date.now()

          // Snapshot first, delete second. A receipt is the only record of what
          // was here, so it is built from live state and written before the
          // removal, never reconstructed afterwards.
          if (removal.kind === 'saved') {
            const project = projectsById.get(removal.targetId)
            const receipt = makeRemovalReceipt({
              id: makeId('removal'),
              kind: 'saved',
              label: project?.title || removal.label,
              snapshot: {
                projectId: removal.targetId,
                projectTitle: project?.title || removal.label,
              },
              now,
            })
            removeSavedProject(removal.targetId)
            setPendingRemoval(null)
            recordReceipt(receipt)
            const message = `Removed “${receipt.label}” from your desk. The archive entry is untouched. Restorable for ${REMOVAL_TTL_HOURS} hours from Recently removed.`
            pushToast(message, 'info', { label: 'Show restore card', to: '/desk?tab=removed' })
            return { ok: true, message, receipt }
          }

          if (removal.kind === 'plan') {
            const plan = plans.find((entry) => entry.id === removal.targetId)
            if (!plan) {
              setPendingRemoval(null)
              return reject('That plan is no longer on your desk, so nothing was removed.')
            }
            const receipt = makeRemovalReceipt({
              id: makeId('removal'),
              kind: 'plan',
              label: plan.projectTitle,
              snapshot: { plan: clone(plan) },
              now,
            })
            removePlan(plan.id)
            setPendingRemoval(null)
            recordReceipt(receipt)
            const message = `Removed ${describeRemoval(receipt)} from your desk. The project stays in the archive. Restorable for ${REMOVAL_TTL_HOURS} hours from Recently removed.`
            pushToast(message, 'info', { label: 'Show restore card', to: '/desk?tab=removed' })
            return { ok: true, message, receipt }
          }

          if (removal.kind === 'project') {
            const project = localProjects.find((entry) => entry.id === removal.targetId)
            if (!project) {
              setPendingRemoval(null)
              return reject('That project is no longer in this browser, so nothing was removed.')
            }
            const relatedPlans = plans.filter((plan) => plan.projectId === project.id)
            const receipt = makeRemovalReceipt({
              id: makeId('removal'),
              kind: 'project',
              label: project.title,
              snapshot: {
                project: clone(project),
                plans: relatedPlans.map(clone),
                wasSaved: saved.includes(project.id),
              },
              now,
            })
            removeLocalProject(project.id)
            setPendingRemoval(null)
            recordReceipt(receipt)
            const planCount = relatedPlans.length
            const message = `Discarded “${receipt.label}”${
              planCount > 0 ? ` and ${planCount} revival plan${planCount === 1 ? '' : 's'}` : ''
            }. Restorable for ${REMOVAL_TTL_HOURS} hours from Recently removed.`
            pushToast(message, 'info', { label: 'Show restore card', to: '/desk?tab=removed' })
            return { ok: true, message, receipt }
          }

          // Demo reset wipes every key including the receipts: it is the one
          // destructive action that is deliberately not reversible.
          resetDemo()
          setPendingRemoval(null)
          const message =
            'Demo data cleared. Only RE’s local storage keys were reset, including removal receipts.'
          pushToast(message)
          return { ok: true, message }
        }

        /* ---- Restore: recovery is a drop, never a button -------------- */
        case ZONE.RESTORE: {
          const receipt = removals.find((entry) => entry.id === item.removalId)
          if (!receipt) {
            return reject('That receipt is no longer available, so nothing was restored.')
          }
          const now = Date.now()
          const verdict = validateRestore(receipt, {
            now,
            saved,
            plans,
            projectsById,
            projectsBySlug,
          })
          if (!verdict.ok) return reject(verdict.reason)

          let message = ''
          if (receipt.kind === 'saved') {
            const { projectId } = receipt.snapshot
            setSaved((prev) => [projectId, ...asStringArray(prev).filter((id) => id !== projectId)])
            message = `Restored “${receipt.label}” to your saved list.`
          } else if (receipt.kind === 'plan') {
            const plan = receipt.snapshot.plan
            setPlans((prev) => [
              plan,
              ...asPlansArray(prev).filter((entry) => entry.id !== plan.id),
            ])
            message = `Restored the revival plan for “${receipt.label}” with its original ID and status.`
          } else {
            const project = receipt.snapshot.project
            const returning = Array.isArray(receipt.snapshot.plans) ? receipt.snapshot.plans : []
            setLocalProjects((prev) => [
              project,
              ...asProjectsArray(prev).filter(
                (entry) => entry.id !== project.id && entry.slug !== project.slug,
              ),
            ])
            if (returning.length > 0) {
              setPlans((prev) => {
                const existing = asPlansArray(prev)
                const ids = new Set(existing.map((entry) => entry.id))
                const fresh = returning.filter((entry) => !ids.has(entry.id))
                return [...fresh, ...existing]
              })
            }
            if (receipt.snapshot.wasSaved) {
              setSaved((prev) => [
                project.id,
                ...asStringArray(prev).filter((id) => id !== project.id),
              ])
            }
            message = `Restored “${receipt.label}”${
              returning.length > 0
                ? ` and ${returning.length} revival plan${returning.length === 1 ? '' : 's'}`
                : ''
            } with their original IDs.`
          }

          // Consuming the receipt is what makes restore idempotent: a second
          // drop of the same card finds nothing and changes nothing.
          setRemovals((prev) =>
            (Array.isArray(prev) ? prev : []).filter((entry) => entry.id !== receipt.id),
          )
          pushToast(message)
          return { ok: true, message }
        }

        /* ---- Demo reset, stage one ---------------------------------- */
        case ZONE.RESET: {
          setPendingRemoval({
            token: makeId('pending'),
            kind: 'demo',
            targetId: 'demo',
            label: 'All RE demo data',
            detail:
              'Clears saved projects, plans, tasks and locally published projects from this browser only. Seed projects remain.',
          })
          pushToast('Pending reset created. Drop the pending card into Confirm removal, or cancel.')
          return { ok: true, message: 'pending:reset' }
        }

        default:
          return reject('That drop is not connected to an action, so nothing changed.')
      }
    },
    [
      addLocalProject,
      localProjectIds,
      localProjects,
      openComposer,
      pendingRemoval,
      plans,
      projectsById,
      projectsBySlug,
      pushToast,
      recordReceipt,
      removals,
      removeLocalProject,
      removePlan,
      removeSavedProject,
      resetDemo,
      saveProject,
      saved,
      setPlans,
      setRemovals,
      setTaskDone,
      updatePlan,
    ],
  )

  const value = useMemo(
    () => ({
      // data
      projects,
      projectsBySlug,
      projectsById,
      localProjectIds,
      saved,
      plans,
      localProjects,
      prefs,
      removals,
      // derived
      isSaved,
      // canvas state
      composer,
      pendingRemoval,
      lastPublished,
      openComposer,
      closeComposer,
      clearPendingRemoval,
      // dispatch
      performDrop,
      // Preferences only — every primary mutation stays inside performDrop.
      completeOnboarding,
      completeTutorial,
      resetOnboarding,
      // feedback
      toasts,
      pushToast,
      dismissToast,
      liveMessage,
      announce,
    }),
    [
      projects,
      projectsBySlug,
      projectsById,
      localProjectIds,
      saved,
      plans,
      localProjects,
      prefs,
      removals,
      isSaved,
      composer,
      pendingRemoval,
      lastPublished,
      openComposer,
      closeComposer,
      clearPendingRemoval,
      performDrop,
      completeOnboarding,
      completeTutorial,
      resetOnboarding,
      toasts,
      pushToast,
      dismissToast,
      liveMessage,
      announce,
    ],
  )

  return <REContext.Provider value={value}>{children}</REContext.Provider>
}

export function useRE() {
  const ctx = useContext(REContext)
  if (!ctx) throw new Error('useRE must be used inside <REProvider>')
  return ctx
}
