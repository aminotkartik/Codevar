import { archiveLabel, intentItem, planDraftItem } from '../../dnd/items'
import { COLLABORATION_LABELS } from '../../data/categories'
import { DraggableDataCard } from './DraggableDataCard'

/**
 * IntentCard — the live contribution intent or stewardship proposal.
 * It cannot be picked up until the required fields make it valid.
 */
export function IntentCard({ project, kind, values, valid, dragId }) {
  const item = intentItem({ project, kind, values, valid })
  const isStewardship = kind === 'stewardship'

  return (
    <DraggableDataCard
      dragId={dragId}
      item={item}
      disabled={!valid}
      disabledNote="Complete the required fields to make this card draggable"
      className="intent-card"
      gripLabel={`Drag the prepared ${isStewardship ? 'stewardship proposal' : 'contribution intent'} into Add plan to desk`}
    >
      <div className="intent-card__body">
        <div className="intent-card__top">
          <span className="intent-card__kind">
            {isStewardship ? 'Stewardship proposal' : 'Contribution intent'}
          </span>
          <span className="intent-card__archive">{archiveLabel(project)}</span>
        </div>

        <h3 className="intent-card__title">{project.title}</h3>

        <dl className="intent-card__rows">
          <div>
            <dt>Skill or role</dt>
            <dd>{values.role?.trim() || <span className="intent-card__empty">Not yet given</span>}</dd>
          </div>
          <div>
            <dt>{isStewardship ? 'Why continue it' : 'How you could help'}</dt>
            <dd>
              {values.intention?.trim() || <span className="intent-card__empty">Not yet written</span>}
            </dd>
          </div>
          <div>
            <dt>{isStewardship ? 'First milestone' : 'First proposed step'}</dt>
            <dd>
              {values.firstTask?.trim() || <span className="intent-card__empty">Not yet proposed</span>}
            </dd>
          </div>
          {!isStewardship && values.collaboration && (
            <div>
              <dt>Joining as</dt>
              <dd>{COLLABORATION_LABELS[values.collaboration] || values.collaboration}</dd>
            </div>
          )}
        </dl>

        <p className="intent-card__note">
          {valid
            ? 'Ready. Drag this card into Add plan to desk to commit it locally.'
            : 'This card is not draggable until the required fields are filled in.'}
        </p>
      </div>
    </DraggableDataCard>
  )
}

/**
 * PlanDraftCard — an edited revival plan waiting to be committed.
 * Keeps the original plan identity; the drop is the save.
 */
export function PlanDraftCard({ plan, values, valid, dragId }) {
  const item = planDraftItem(plan, values, valid)

  return (
    <DraggableDataCard
      dragId={dragId}
      item={item}
      disabled={!valid}
      disabledNote="Add the fields above to make this card draggable"
      className="intent-card"
      gripLabel="Drag the edited plan card into Update plan"
    >
      <div className="intent-card__body">
        <div className="intent-card__top">
          <span className="intent-card__kind">Edited plan · {plan.id.slice(-6)}</span>
          <span className="intent-card__archive">Keeps plan ID</span>
        </div>

        <h3 className="intent-card__title">{plan.projectTitle}</h3>

        <dl className="intent-card__rows">
          <div>
            <dt>Skill or role</dt>
            <dd>{values.role?.trim() || <span className="intent-card__empty">Not yet given</span>}</dd>
          </div>
          <div>
            <dt>How you could help</dt>
            <dd>
              {values.intention?.trim() || <span className="intent-card__empty">Not yet written</span>}
            </dd>
          </div>
          <div>
            <dt>First proposed step</dt>
            <dd>
              {values.firstTask?.trim() || <span className="intent-card__empty">Not yet proposed</span>}
            </dd>
          </div>
        </dl>

        <p className="intent-card__note">
          {valid
            ? 'Drag this card into Update plan to write the changes locally.'
            : 'Nothing is saved until this card is valid and dropped.'}
        </p>
      </div>
    </DraggableDataCard>
  )
}
