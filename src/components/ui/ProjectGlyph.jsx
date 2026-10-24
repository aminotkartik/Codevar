/**
 * ProjectGlyph — a deterministic, category-aware geometric thumbnail.
 * Derived from the project id, so the same project always looks the same.
 * No external images, no fabricated screenshots.
 */

const INK = '#20231F'
const ACCENT = '#A93F28'
const LINE = '#D8D6CC'
const SOFT = '#EAE7DE'

function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function Arcs({ seed }) {
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M ${20 + i * 12} 110 A ${70 + i * 12} ${70 + i * 12} 0 0 1 ${
            180 - i * 12
          } 110`}
          fill="none"
          stroke={i === 3 ? ACCENT : LINE}
          strokeWidth={i === 3 ? 3 : 1.4}
          strokeLinecap="round"
          opacity={i === 3 ? 1 : 0.7}
        />
      ))}
      <circle cx={100} cy={110} r="4" fill={ACCENT} />
      <path d="M 100 106 100 60" stroke={INK} strokeWidth="1.4" strokeDasharray="3 4" />
    </g>
  )
}

function GridDots({ seed }) {
  const filled = (seed >> 3) % 6
  return (
    <g>
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 8 }, (_, c) => {
          const on = r === Math.floor(filled / 2) && c === (filled % 8)
          const accent = r === (seed % 4) && c === ((seed >> 5) % 8)
          return (
            <circle
              key={`${r}-${c}`}
              cx={26 + c * 20}
              cy={22 + r * 22}
              r={on ? 5 : accent ? 4 : 2.4}
              fill={accent ? ACCENT : on ? INK : LINE}
            />
          )
        }),
      )}
    </g>
  )
}

function Bars({ seed }) {
  const heights = [46, 68, 34, 82, 58, 74, 40]
  return (
    <g>
      {heights.map((h, i) => (
        <rect
          key={i}
          x={22 + i * 24}
          y={104 - h}
          width="13"
          height={h}
          rx="2"
          fill={i === (seed % heights.length) ? ACCENT : i === 3 ? INK : SOFT}
          stroke={i === (seed % heights.length) ? ACCENT : LINE}
          strokeWidth="1"
        />
      ))}
      <path d="M 12 108 H 188" stroke={LINE} strokeWidth="1.4" />
    </g>
  )
}

function Rings({ seed }) {
  const cx = 62 + (seed % 40)
  const cy = 52 + ((seed >> 4) % 16)
  return (
    <g>
      <circle cx={cx} cy={cy} r="42" fill="none" stroke={LINE} strokeWidth="1.4" />
      <circle cx={cx} cy={cy} r="30" fill="none" stroke={LINE} strokeWidth="1.4" />
      <circle cx={cx} cy={cy} r="18" fill={SOFT} stroke={LINE} strokeWidth="1.4" />
      <circle cx={cx} cy={cy} r="6" fill={ACCENT} />
      <circle cx={cx + 52} cy={cy - 18} r="4" fill={INK} />
      <circle cx={cx - 46} cy={cy + 26} r="3" fill={ACCENT} opacity="0.6" />
    </g>
  )
}

function Rays({ seed }) {
  return (
    <g>
      {Array.from({ length: 11 }, (_, i) => {
        const angle = (i * Math.PI) / 10
        const len = 40 + ((seed >> (i % 6)) % 3) * 22
        const x = 100 + Math.cos(angle) * len
        const y = 108 - Math.sin(angle) * len
        const accent = i === 3 || i === 7
        return (
          <line
            key={i}
            x1="100"
            y1="108"
            x2={x}
            y2={y}
            stroke={accent ? ACCENT : LINE}
            strokeWidth={accent ? 2.6 : 1.2}
            strokeLinecap="round"
          />
        )
      })}
      <circle cx="100" cy="108" r="7" fill={INK} />
      <circle cx="100" cy="108" r="3" fill={ACCENT} />
    </g>
  )
}

function Blocks({ seed }) {
  return (
    <g>
      <rect x="28" y="30" width="62" height="62" fill={SOFT} stroke={LINE} strokeWidth="1.4" />
      <rect x="52" y="54" width="62" height="62" fill="none" stroke={LINE} strokeWidth="1.4" />
      <rect x="108" y="22" width="42" height="24" fill={INK} opacity="0.85" />
      <rect
        x="108"
        y="54"
        width="42"
        height="32"
        fill="none"
        stroke={ACCENT}
        strokeWidth="2.4"
      />
      <line x1="28" y1="102" x2="150" y2="102" stroke={LINE} strokeWidth="1.4" />
    </g>
  )
}

const PATTERNS = [Arcs, GridDots, Bars, Rings, Rays, Blocks]

/**
 * `bare` renders just the artwork so it can sit inside ProjectCover's frame
 * when a project has no photograph.
 */
export function ProjectGlyph({ project, className, bare = false }) {
  const seed = hash(project.id || project.slug || project.title)
  const Pattern = PATTERNS[seed % PATTERNS.length]

  const artwork = (
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="200" height="120" fill={SOFT} />
      <Pattern seed={seed} />
    </svg>
  )

  if (bare) return artwork

  return (
    <div className={`glyph${className ? ` ${className}` : ''}`}>{artwork}</div>
  )
}
