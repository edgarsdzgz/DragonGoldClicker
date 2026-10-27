// =============================================================================
// THE LAUNCH LOADER: named steps, run in order, each reporting how far along it is. The title
// screen's bar shows the weighted total and the step it is on. New steps (an update check, new
// content) join the list without touching the screen.
// =============================================================================

export interface LoadStep {
  id: string
  /** What the title says while this step runs ("Opening your save") */
  label: string
  /** Its share of the bar, against the other steps' weights */
  weight: number
  /** The work; `report` takes this step's own progress (0 to 1) and an optional detail ("42 of 175") */
  run: (report: (fraction: number, detail?: string) => void) => Promise<void>
}

export type LoadStatus = 'loading' | 'ready' | 'failed'

export interface LoadProgress {
  status: LoadStatus
  /** The step running, or the one that failed; null once ready */
  stepId: string | null
  label: string
  detail?: string
  /** The whole load, 0 to 1 */
  fraction: number
}

/** The bar's fill: the finished steps' weights, plus the running step's share of its own */
export function overallFraction(weights: readonly number[], index: number, stepFraction: number): number {
  const total = weights.reduce((a, w) => a + Math.max(0, w), 0)
  if (total <= 0) return index >= weights.length ? 1 : 0
  const done = weights.slice(0, index).reduce((a, w) => a + Math.max(0, w), 0)
  const current = index < weights.length ? Math.max(0, weights[index]) * Math.min(1, Math.max(0, stepFraction)) : 0
  return Math.min(1, (done + current) / total)
}

export const READY_LABEL = 'Ready'

/**
 * Run the steps in order, reporting progress after each change. Resolves 'ready' when all are
 * done, or 'failed' at the first step that throws (the progress then names that step).
 */
export async function runSteps(steps: readonly LoadStep[], onProgress: (p: LoadProgress) => void): Promise<LoadStatus> {
  const weights = steps.map((s) => s.weight)
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const report = (fraction: number, detail?: string) =>
      onProgress({ status: 'loading', stepId: step.id, label: step.label, detail, fraction: overallFraction(weights, i, fraction) })
    report(0)
    try {
      await step.run(report)
    } catch {
      onProgress({ status: 'failed', stepId: step.id, label: step.label, fraction: overallFraction(weights, i, 0) })
      return 'failed'
    }
  }
  onProgress({ status: 'ready', stepId: null, label: READY_LABEL, fraction: 1 })
  return 'ready'
}
