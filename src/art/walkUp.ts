import { SPRITES } from './manifest'
import type { SpriteId } from './manifest'
import { BLINK_STEPS, BLINK_STEP_MS, DEATH_HOLD_MS } from './warfront'

// =============================================================================
// THE GROWING WALK-UP: the next monster comes down the road from the camps, growing from the map's
// own scale to its full size in whole screen pixels per art pixel, so it is sharp at every size
// =============================================================================

/** How long the walk from the camps to the monster's place takes */
export const GROW_WALK_MS = 900

/** The Unmaking's marks on a monster: none, dark cracks, glowing cracks */
export type MobTier = 'weak' | 'strong' | 'stronger'

/** A monster's sprite at a tier (`walk_anim`, `death_anim`, `hit`, `hurt`), or null when it has none */
export function tierSprite(name: string, tier: MobTier, state: string): SpriteId | null {
  const id = `mob_${name}${tier === 'weak' ? '' : `-${tier}`}_${state}`
  return Object.prototype.hasOwnProperty.call(SPRITES, id) ? (id as SpriteId) : null
}

/**
 * Every size the walk passes through, in display points per art pixel: one more screen pixel per
 * art pixel at each step, from `from` up to `to` (both snapped to whole screen pixels).
 */
export function growScales(from: number, to: number, pixelRatio: number): number[] {
  const a = Math.max(1, Math.round(from * pixelRatio))
  const b = Math.max(1, Math.round(to * pixelRatio))
  if (b <= a) return [b / pixelRatio]
  const out: number[] = []
  for (let k = a; k <= b; k++) out.push(k / pixelRatio)
  return out
}

/** Which of `steps` sizes shows `t` (0 to 1) of the way along; equal time at each */
export function growStep(t: number, steps: number): number {
  const c = Math.min(1, Math.max(0, t))
  return Math.min(steps - 1, Math.floor(c * steps))
}

/**
 * A body on the road `ms` after its kill: shown while the death plays and holds, then it blinks
 * (off, on, off...) and is gone. Without the blink (Reduce Motion) it is simply gone after the hold.
 */
export function bodyState(ms: number, deathMs: number, blink: boolean): 'shown' | 'hidden' | 'gone' {
  const held = deathMs + DEATH_HOLD_MS
  if (ms < held) return 'shown'
  if (!blink) return 'gone'
  const step = Math.floor((ms - held) / BLINK_STEP_MS)
  if (step >= BLINK_STEPS) return 'gone'
  return step % 2 === 0 ? 'hidden' : 'shown'
}
