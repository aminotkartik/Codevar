import { coverFor } from '../../data/covers'
import { ProjectGlyph } from '../ui/ProjectGlyph'

const RATIOS = new Set(['16x9', '4x3', '3x2', '1x1', '21x9'])

/**
 * ProjectCover — the shared frame for a project's archival photograph.
 * Falls back to the deterministic glyph when a project has no cover, inside
 * the same frame, so the archive never shows a broken or missing image.
 */
export function ProjectCover({ project, ratio = '16x9', alt, eager = false, className }) {
  const safeRatio = RATIOS.has(ratio) ? ratio : '16x9'
  const src = coverFor(project.slug)

  return (
    <div className={`cover cover--${safeRatio}${className ? ` ${className}` : ''}`}>
      {src ? (
        <img
          src={src}
          alt={alt || ''}
          width={1600}
          height={900}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable="false"
        />
      ) : (
        <ProjectGlyph project={project} bare />
      )}
    </div>
  )
}
