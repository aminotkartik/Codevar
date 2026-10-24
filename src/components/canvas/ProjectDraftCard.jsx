import { draftItem } from '../../dnd/items'
import { nextArchiveId } from '../../utils/projectIdentifiers'
import { categoryLabel } from '../../data/categories'
import { StageBadge } from '../ui/StageBadge'
import { DraggableDataCard } from './DraggableDataCard'
import { Check, HandoffArrow } from '../ui/Icons'

function techList(value) {
  if (Array.isArray(value)) return value
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * ProjectDraftCard — the submission, assembled as a real RE archive card.
 * While it is incomplete it is visibly a draft and cannot be picked up.
 */
export function ProjectDraftCard({
  draftId,
  payload,
  values,
  valid,
  missing = [],
  onFix,
  existingProjects = [],
}) {
  const item = draftItem({
    draftId,
    payload,
    valid,
    label: values.title?.trim() || 'Untitled project draft',
    meta: values.stage ? `${values.stage} · local draft` : 'Incomplete local draft',
  })

  const helpFocus = values.helpNeeded?.[0] || ''
  const nextId = nextArchiveId(existingProjects).replace('-', '—')

  return (
    <div className="draft-card-wrap">
      <DraggableDataCard
        dragId={`draft-card-${draftId}`}
        item={item}
        disabled={!valid}
        disabledNote="Incomplete draft — not draggable yet"
        className="draft-data-card"
        gripLabel="Drag the project draft into Publish to archive"
      >
        <div className="draft-data-card__body">
          <div className="draft-data-card__top">
            <span className="draft-data-card__archive">{nextId}</span>
            <span className="draft-data-card__spacer" />
            <span className="draft-data-card__badge" data-valid={valid}>
              {valid ? 'Ready to publish' : 'Unpublished project draft'}
            </span>
          </div>

          <h3 className="draft-data-card__title">
            {values.title?.trim() || 'Untitled project'}
          </h3>

          <div className="draft-data-card__meta">
            {values.category ? (
              <span className="tag tag--accent">{categoryLabel(values.category)}</span>
            ) : (
              <span className="tag">Category not chosen</span>
            )}
            {values.stage ? <StageBadge stage={values.stage} /> : <span className="tag">Stage not chosen</span>}
          </div>

          <p className="draft-data-card__desc">
            {values.description?.trim() || 'No description yet. Step 1 asks for one.'}
          </p>

          <div className="draft-data-card__tags">
            {techList(values.techStack)
              .slice(0, 3)
              .map((tech) => (
                <span className="tag" key={tech}>
                  {tech}
                </span>
              ))}
          </div>

          <div className="draft-data-card__need">
            <span className="draft-data-card__need-label">Needs</span>
            <span>{helpFocus || 'Help requirements not chosen yet'}</span>
          </div>

          <div className="draft-data-card__next">
            <span className="draft-data-card__next-label">Next step</span>
            <span>{values.nextStep?.trim() || 'Not written yet'}</span>
          </div>

          <p className="draft-data-card__status">
            {valid ? (
              <>
                <Check width={13} height={13} />
                Drag this card into Publish to archive
              </>
            ) : (
              <>
                <HandoffArrow width={13} height={13} />
                {missing.length} required {missing.length === 1 ? 'field needs' : 'fields need'} attention
              </>
            )}
          </p>

          {!valid && missing.length > 0 && (
            <ul className="draft-data-card__missing">
              {missing.slice(0, 5).map((entry) => (
                <li key={entry.field}>
                  <button type="button" className="link-arrow" onClick={() => onFix?.(entry)}>
                    {entry.label}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="draft-data-card__disclaimer">
            Publishing adds this to the local RE demo archive in this browser. Nothing is
            sent anywhere else.
          </p>
        </div>
      </DraggableDataCard>
    </div>
  )
}
