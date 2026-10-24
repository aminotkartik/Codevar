import { ITEM } from './zones'

/** Every draggable exposes this shape so zones can validate it. */

export function archiveLabel(project) {
  return String(project?.id || '').replace('-', '—')
}

export function projectItem(project, origin = 'archive') {
  const type =
    origin === 'saved'
      ? ITEM.SAVED_PROJECT
      : origin === 'local'
        ? ITEM.LOCAL_PROJECT
        : ITEM.PROJECT

  return {
    type,
    id: project.id,
    label: project.title,
    meta: `${archiveLabel(project)} · ${project.stage}`,
    origin,
    slug: project.slug,
    stewardable: Boolean(
      project.openToStewardship ||
        (Array.isArray(project.collaborationTypes) &&
          project.collaborationTypes.includes('stewardship')),
    ),
  }
}

export function planItem(plan) {
  return {
    type: ITEM.PLAN,
    id: plan.id,
    planId: plan.id,
    label: plan.projectTitle,
    meta: `${plan.type === 'stewardship' ? 'Stewardship proposal' : 'Contribution intent'} · ${plan.status}`,
  }
}

export function taskItem(plan, task) {
  return {
    type: ITEM.TASK,
    planId: plan.id,
    taskId: task.id,
    done: Boolean(task.done),
    label: task.label,
    meta: `${plan.projectTitle} · ${task.done ? 'Complete' : 'Open'}`,
  }
}

export function intentItem({ project, kind, values, valid }) {
  return {
    type: kind === 'stewardship' ? ITEM.STEWARDSHIP : ITEM.CONTRIBUTION,
    projectId: project.id,
    projectSlug: project.slug,
    projectTitle: project.title,
    id: `intent-${project.id}-${kind}`,
    label: project.title,
    meta: kind === 'stewardship' ? 'Stewardship proposal' : 'Contribution intent',
    values,
    valid,
  }
}

export function planDraftItem(plan, values, valid) {
  return {
    type: ITEM.PLAN_DRAFT,
    id: `plan-draft-${plan.id}`,
    planId: plan.id,
    label: plan.projectTitle,
    meta: 'Edited plan — drop to update',
    values,
    valid,
  }
}

export function draftItem({ draftId, payload, valid, label, meta }) {
  return {
    type: ITEM.DRAFT,
    id: `draft-${draftId}`,
    draftId,
    payload,
    valid,
    label,
    meta,
  }
}

export function pendingItem(removal) {
  return {
    type: ITEM.PENDING,
    id: `pending-${removal.token}`,
    removalToken: removal.token,
    label: removal.label,
    meta: 'Awaiting confirmation',
  }
}

export function demoDataItem() {
  return {
    type: ITEM.DEMO_DATA,
    id: 're-demo-records',
    label: 'RE demo records',
    meta: 'Browser storage only',
  }
}
