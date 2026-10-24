import { HelpComposer } from './HelpComposer'
import { StewardshipComposer } from './StewardshipComposer'
import { PlanEditor } from './PlanEditor'
import { RemovalPanel } from './RemovalPanel'

/** All of the canvas's portaled surfaces, mounted once at the app root. */
export function CanvasPanels() {
  return (
    <>
      <HelpComposer />
      <StewardshipComposer />
      <PlanEditor />
      <RemovalPanel />
    </>
  )
}
