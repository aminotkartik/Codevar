/**
 * Icons.jsx — a single inline SVG set, drawn at a consistent stroke weight.
 * 1.6px stroke, 24×24 viewBox, `currentColor` fill so they inherit text colour.
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

export function ArrowUpRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  )
}

export function ArrowRight(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function Bookmark(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4h12v16l-6-4-6 4z" />
    </svg>
  )
}

export function BookmarkFilled(props) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M6 4h12v16l-6-4-6 4z" />
    </svg>
  )
}

export function Search(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5-4.5" />
    </svg>
  )
}

export function Close(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function Check(props) {
  return (
    <svg {...base} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  )
}

export function Filter(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 6h18" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  )
}

export function Layers(props) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  )
}

export function Branch(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="6" cy="18" r="2.4" />
      <circle cx="17" cy="8" r="2.4" />
      <path d="M6 8.4v7.2" />
      <path d="M17 10.4c0 4-3 5.6-6 5.6" />
    </svg>
  )
}

export function Clock(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function Plus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function Info(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <path d="M12 7.8h.01" />
    </svg>
  )
}

export function Menu(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function ExternalLink(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1H9.5" />
    </svg>
  )
}

export function Edit(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20h4l10-10-4-4L4 16z" />
      <path d="m13.5 6.5 4 4" />
    </svg>
  )
}

export function ArchiveBox(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M9 4h6v4H9z" />
      <path d="M10 12h4" />
    </svg>
  )
}

export function Handoff(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12h8" />
      <path d="m10 8.5 3.5 3.5L18 6" />
      <path d="M21 20v-7" />
    </svg>
  )
}

export function Users(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 20c0-3.2 2.5-5.4 5.5-5.4s5.5 2.2 5.5 5.4" />
      <path d="M16 5.7a3.2 3.2 0 0 1 0 5.6" />
      <path d="M17.5 14.7c2.4.6 4 2.5 4 5.3" />
    </svg>
  )
}

export function Target(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function Spark(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 13.7 9 19 11l-5.3 2-1.7 5.5L10.3 13 5 11l5.3-2z" />
    </svg>
  )
}

export function Trash(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 7h14" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M6.5 7 7.5 20a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export function ChevronDown(props) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function ArrowLeft(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 12H5" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  )
}

export function FileNote(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  )
}

export function Pen(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20 4.5 15 15 4.5 19.5 9 9 20z" />
      <path d="m13 6.5 4.5 4.5" />
    </svg>
  )
}

export function Grid(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
    </svg>
  )
}

export function Sort(props) {
  return (
    <svg {...base} {...props}>
      <path d="M7 4v16" />
      <path d="m4 17 3 3 3-3" />
      <path d="M14 7h6M14 12h4M14 17h2" />
    </svg>
  )
}

export function Spade(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.8s4.4 4.6 4.4 8.2a4.4 4.4 0 1 1-8.8 0C7.6 7.4 12 2.8 12 2.8z" />
      <path d="M12 11v10" />
    </svg>
  )
}
