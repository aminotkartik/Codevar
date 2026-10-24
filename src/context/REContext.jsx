import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { SEED_PROJECTS } from '../data/projects'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STORAGE_KEYS } from '../utils/storage'
import { makeId } from '../utils/projectIdentifiers'

/** Shared with every revival plan so the workbench feels consistent. */
export const DEFAULT_CHECKLIST = [
  { id: 'review', label: "Review the project's existing work.", done: false },
  { id: 'first', label: 'Identify the first achievable task.', done: false },
  { id: 'plan', label: 'Write a continuation plan.', done: false },
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

export function REProvider({ children }) {
  const [savedRaw, setSaved] = useLocalStorage(STORAGE_KEYS.saved, [])
  const [plansRaw, setPlans] = useLocalStorage(STORAGE_KEYS.plans, [])
  const [localProjectsRaw, setLocalProjects] = useLocalStorage(STORAGE_KEYS.projects, [])
  const [prefsRaw, setPrefs] = useLocalStorage(STORAGE_KEYS.preferences, {
    onboarded: false,
    categories: [],
    intention: '',
  })
  const [toasts, setToasts] = useState([])

  // ---- defensive normalisation ------------------------------------------
  const saved = useMemo(() => asStringArray(savedRaw), [savedRaw])
  const localProjects = useMemo(
    () =>
      (Array.isArray(localProjectsRaw) ? localProjectsRaw : []).filter(
        (p) => p && typeof p.id === 'string' && typeof p.slug === 'string',
      ),
    [localProjectsRaw],
  )
  const plans = useMemo(
    () =>
      (Array.isArray(plansRaw) ? plansRaw : []).filter(
        (p) => p && typeof p.id === 'string' && typeof p.projectId === 'string',
      ),
    [plansRaw],
  )
  const prefs = useMemo(
    () => ({
      onboarded: Boolean(prefsRaw?.onboarded),
      categories: asStringArray(prefsRaw?.categories),
      intention: typeof prefsRaw?.intention === 'string' ? prefsRaw.intention : '',
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

  // ---- toasts -----------------------------------------------------------
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const pushToast = useCallback(
    (text, tone = 'info') => {
      const id = makeId('toast')
      setToasts((prev) => [...prev.slice(-2), { id, text, tone }])
      return id
    },
    [],
  )

  // ---- bookmarks --------------------------------------------------------
  const isSaved = useCallback((id) => saved.includes(id), [saved])

  const toggleSaved = useCallback(
    (id) => {
      setSaved((prev) => {
        const list = asStringArray(prev)
        return list.includes(id) ? list.filter((x) => x !== id) : [id, ...list]
      })
    },
    [setSaved],
  )

  // ---- revival plans ---------------------------------------------------
  const addPlan = useCallback(
    (input) => {
      const plan = {
        id: makeId('plan'),
        projectId: input.projectId,
        projectSlug: input.projectSlug || '',
        projectTitle: input.projectTitle || 'Untitled project',
        type: input.type || 'contribution',
        collaboration: input.collaboration || '',
        role: input.role || '',
        intention: input.intention || '',
        note: input.note || '',
        createdAt: new Date().toISOString(),
        status: 'drafted',
        checklist: DEFAULT_CHECKLIST.map((item) => ({ ...item, done: false })),
      }
      setPlans((prev) => [plan, ...asPlansArray(prev)])
      return plan
    },
    [setPlans],
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

  const toggleChecklistItem = useCallback(
    (planId, itemId) => {
      setPlans((prev) =>
        asPlansArray(prev).map((p) => {
          if (p.id !== planId) return p
          return {
            ...p,
            checklist: (p.checklist || DEFAULT_CHECKLIST).map((item) =>
              item.id === itemId ? { ...item, done: !item.done } : item,
            ),
          }
        }),
      )
    },
    [setPlans],
  )

  // ---- submitted projects ----------------------------------------------
  const addProject = useCallback(
    (payload) => {
      const project = { ...payload, id: payload.id, slug: payload.slug }
      setLocalProjects((prev) => [project, ...asProjectsArray(prev)])
      return project
    },
    [setLocalProjects],
  )

  // ---- preferences ------------------------------------------------------
  const completeOnboarding = useCallback(
    (categories, intention) => {
      setPrefs({
        onboarded: true,
        categories: asStringArray(categories),
        intention: intention || '',
      })
    },
    [setPrefs],
  )

  const resetOnboarding = useCallback(() => {
    setPrefs({ onboarded: false, categories: [], intention: '' })
  }, [setPrefs])

  // ---- demo reset -------------------------------------------------------
  const resetDemo = useCallback(() => {
    setSaved([])
    setPlans([])
    setLocalProjects([])
    setPrefs({ onboarded: false, categories: [], intention: '' })
  }, [setSaved, setPlans, setLocalProjects, setPrefs])

  const value = useMemo(
    () => ({
      projects,
      projectsBySlug,
      projectsById,
      saved,
      plans,
      localProjects,
      prefs,
      isSaved,
      toggleSaved,
      addPlan,
      updatePlan,
      removePlan,
      toggleChecklistItem,
      addProject,
      completeOnboarding,
      resetOnboarding,
      resetDemo,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      projects,
      projectsBySlug,
      projectsById,
      saved,
      plans,
      localProjects,
      prefs,
      isSaved,
      toggleSaved,
      addPlan,
      updatePlan,
      removePlan,
      toggleChecklistItem,
      addProject,
      completeOnboarding,
      resetOnboarding,
      resetDemo,
      toasts,
      pushToast,
      dismissToast,
    ],
  )

  return <REContext.Provider value={value}>{children}</REContext.Provider>
}

function asPlansArray(value) {
  return Array.isArray(value) ? value : []
}

function asProjectsArray(value) {
  return Array.isArray(value) ? value : []
}

export function useRE() {
  const ctx = useContext(REContext)
  if (!ctx) throw new Error('useRE must be used inside <REProvider>')
  return ctx
}
