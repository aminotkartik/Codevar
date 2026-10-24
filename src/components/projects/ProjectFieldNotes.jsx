/**
 * Field notes — the archival journal of a project. Fixed, deterministic,
 * clearly presented as demo record rather than live activity.
 */
export function ProjectFieldNotes({ notes }) {
  if (!notes || notes.length === 0) {
    return (
      <p className="story-block__note">
        No field notes were left with this entry. The project record still describes what
        exists and what comes next.
      </p>
    )
  }

  return (
    <ul className="notes-list">
      {notes.map((note) => (
        <li className="note-item" key={note.date + note.text}>
          <span className="note-item__date">{note.date}</span>
          <span className="note-item__text">{note.text}</span>
        </li>
      ))}
    </ul>
  )
}
