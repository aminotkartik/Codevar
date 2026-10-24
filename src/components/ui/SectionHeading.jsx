export function SectionHeading({ eyebrow, title, sub, id }) {
  return (
    <div className="section-heading">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      {title && (
        <h2 className="section-heading__title" id={id}>
          {title}
        </h2>
      )}
      {sub && <p className="section-heading__sub">{sub}</p>}
    </div>
  )
}
