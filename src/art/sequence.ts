// =============================================================================
// TIMED FRAME SEQUENCES: splash animations played frame by frame from a sheet
// =============================================================================

/** The timing file that comes with a sheet or strip (written by the art tools) */
export interface SheetTiming {
  frame_width: number
  frame_height: number
  frames: number
  /** Frames to a row in the sheet; absent for a single strip */
  columns?: number
  /** How long each frame holds, in ms */
  ms: readonly number[]
  background: string
}

/** Where a frame sits in its sheet, in art pixels */
export function frameCell(timing: SheetTiming, frame: number): { x: number; y: number } {
  const columns = timing.columns ?? timing.frames
  const f = Math.min(Math.max(0, Math.floor(frame)), timing.frames - 1)
  return { x: (f % columns) * timing.frame_width, y: Math.floor(f / columns) * timing.frame_height }
}

/** How long a sequence runs from frame `from` to the end of its last frame's hold */
export function sequenceMs(timing: SheetTiming, from = 0, lastHoldMs?: number): number {
  const ms = timing.ms.slice(Math.max(0, from))
  if (ms.length && lastHoldMs !== undefined) ms[ms.length - 1] = lastHoldMs
  return ms.reduce((sum, m) => sum + m, 0)
}

/**
 * Display points per art pixel for art that must fit inside a box: the largest whole number of
 * screen pixels per art pixel that still fits, never less than one.
 */
export function fitWhole(boxPts: number, artPx: number, pixelRatio: number): number {
  return Math.max(1, Math.floor((boxPts / artPx) * pixelRatio)) / pixelRatio
}

/** After a tap skips to the last frame, how long it holds before moving on */
export const SKIP_HOLD_MS = 500

/** A splash waits this long at most for its sheet to decode before it plays anyway */
export const SHEET_WAIT_MS = 4000

/**
 * A splash's tap rule: the first tap jumps to the last frame and moves on after SKIP_HOLD_MS;
 * a second tap leaves at once.
 */
export type SplashPhase = 'playing' | 'skipped' | 'done'

export function tapSplash(phase: SplashPhase): SplashPhase {
  return phase === 'playing' ? 'skipped' : 'done'
}
