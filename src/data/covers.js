/**
 * covers.js — the archive's art-directed cover photographs.
 *
 * Every image is generated for this build and treated as a project's own
 * archive photograph rather than a stock illustration. Projects without a
 * cover fall back to their deterministic geometric glyph, rendered inside
 * the identical frame so the two treatments read as one system.
 */

import openOrchard from '../assets/covers/open-orchard.jpg'
import patchworkAtlas from '../assets/covers/patchwork-atlas.jpg'
import loopline from '../assets/covers/loopline.jpg'
import softSignal from '../assets/covers/soft-signal.jpg'
import civicLens from '../assets/covers/civic-lens.jpg'
import reframe from '../assets/covers/reframe.jpg'
import spareParts from '../assets/covers/spare-parts.jpg'
import smallHours from '../assets/covers/small-hours.jpg'
import pantryRelay from '../assets/covers/pantry-relay.jpg'
import typeTrail from '../assets/covers/type-trail.jpg'

export const COVERS = {
  'open-orchard': openOrchard,
  'patchwork-atlas': patchworkAtlas,
  'loopline': loopline,
  'soft-signal': softSignal,
  'civic-lens': civicLens,
  'reframe': reframe,
  'spare-parts': spareParts,
  'small-hours': smallHours,
  'pantry-relay': pantryRelay,
  'type-trail': typeTrail,
}

/** The photograph for a project slug, or null when it has none. */
export function coverFor(slug) {
  if (!slug) return null
  return COVERS[slug] || null
}
