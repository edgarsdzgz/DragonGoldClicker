/**
 * Taps closer together than this are a backlog, not a thumb: after a stall (a slow frame, a GPU
 * hang) Android hands every queued touch over at once. No thumb taps 25 times a second.
 */
export const MIN_TAP_GAP_MS = 40

/**
 * Whether a tap at `now` should act, given when the last accepted one acted (null: none yet).
 *
 * Why: each tap is an urgent update, and the update its effects schedule counts as "nested" in
 * React 19 until a render leaves nothing pending. Fifty queued taps run back to back with no such
 * render between them, and React then throws "Maximum update depth exceeded" at the next update,
 * closing the app (the playtest of 2026-10-29). Dropping the backlog keeps that chain short.
 */
export function acceptTap(now: number, lastAccepted: number | null, minGapMs = MIN_TAP_GAP_MS): boolean {
  return lastAccepted === null || now - lastAccepted >= minGapMs || now < lastAccepted
}
