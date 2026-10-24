import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { SEED_PROJECTS } from '../data/projects'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/storage'
import { makeId, nextArchiveId, slugify, uniqueSlug } from '../utils/projectIdentifiers'
import {
  ZONE,
  ITEM,
  baseZoneId,
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

function normalisePlan(raw) {
  const tasks = normaliseTasks(raw)
  return {
    ...raw,
    tasks: tasks.length > 0 ? tasks : DEFAULT_TASKS(),
    type: raw.type === 'stewardship' ? 'stewardship' : 'contribution',
    status: PLAN_STATUSES.some((s) => s.id === raw.status) ? raw.status : 'drafted',
  }
}

export function REProvider({ children }) {
  const [savedRaw, setSaved] = useLocalStorage(STORAGE_KEYS.saved, [])
  const [plansRaw, setPlans] = useLocalStorage(STORAGE_KEYS.plans, [])
  const [localProjectsRaw, setLocalProjects] = useLocalStorage(STORAGE_KEYS.projects, [])
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
      asProjectsArray(localProjectsRaw).filter(
        (p) => p && typeof p.id === 'string' && typeof p.slug === 'string',
      ),
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
    (text, tone = 'info') => {
      const id = makeId('toast')
      setToasts((prev) => [...prev.slice(-2), { id, text, tone }])
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

  const removeLocalProject = useCallback(
    (id) => {
      setLocalProjects((prev) => asProjectsArray(prev).filter((p) => p.id !== id))
      setSaved((prev) => asStringArray(prev).filter((x) => x !== id))
    },
    [setLocalProjects, setSaved],
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
    setPrefs({
      onboarded: true,
      categories: [],
      intention: '',
      tutorialDone: true,
    })
    setComposer(null)
    setPendingRemoval(null)
    setLastPublished(null)
  }, [setSaved, setPlans, setLocalProjects, setPrefs])

  const updatePlanStatus = useCallback(
    (planId, status) => updatePlan(planId, { status }),
    [updatePlan],
  )

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
          setPendingRemoval({
            token: makeId('pending'),
            kind: 'project',
            targetId: item.id,
            label: item.label,
            detail:
              'This locally created project will be removed from Explore and from My projects. Nothing else is touched.',
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
          if (removal.kind === 'saved') {
            removeSavedProject(removal.targetId)
          } else if (removal.kind === 'plan') {
            removePlan(removal.targetId)
          } else if (removal.kind === 'project') {
            removeLocalProject(removal.targetId)
          } else if (removal.kind === 'demo') {
            resetDemo()
          }
          setPendingRemoval(null)
          const message =
            removal.kind === 'demo'
              ? 'Demo data cleared. Only RE’s local storage keys were reset.'
              : `Removed “${removal.label}” from your desk. The archive project is untouched.`
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
      openComposer,
      pendingRemoval,
      plans,
      projectsById,
      pushToast,
      removeLocalProject,
      removePlan,
      removeSavedProject,
      resetDemo,
      saveProject,
      saved,
      setPlans,
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
      // non-primary helpers
      updatePlanStatus,
      updatePlan,
      removePlan,
      completeOnboarding,
      completeTutorial,
      resetOnboarding,
      resetDemo,
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
      isSaved,
      composer,
      pendingRemoval,
      lastPublished,
      openComposer,
      closeComposer,
      clearPendingRemoval,
      performDrop,
      updatePlanStatus,
      updatePlan,
      removePlan,
      completeOnboarding,
      completeTutorial,
      resetOnboarding,
      resetDemo,
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
