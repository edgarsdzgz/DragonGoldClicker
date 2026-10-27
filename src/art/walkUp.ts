import { SPRITES } from './manifest'
import type { SpriteId } from './manifest'
import { BLINK_STEPS, BLINK_STEP_MS, DEATH_HOLD_MS } from './warfront'

// =============================================================================
// THE GROWING WALK-UP: the next monster comes down the road from the camps, growing from the map's
// own scale to its full size in whole screen pixels per art pixel, so it is sharp at every size
// =============================================================================

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

/** How long one step of the walk takes: one frame of the monster's walk bob */
export function walkStepMs(walk: SpriteId): number {
  const fps = SPRITES[walk].fps
  return fps > 0 ? 1000 / fps : 250
}

/** Where a monster is on its walk-up: its step (and size), and how far along the road (0 to 1) */
export interface WalkUpPose {
  step: number
  along: number
  done: boolean
}

/**
 * The walk-up `ms` after it starts. Each frame of the bob is a step: the monster moves only then,
 * and grows one size. Every step is the same stride in its own pixels, so it covers less road
 * while small and far away, more as it nears. It arrives on its last size.
 */
export function walkUpAt(ms: number, scales: number[], stepMs: number): WalkUpPose {
  const last = scales.length - 1
  if (last <= 0) return { step: 0, along: 1, done: true }
  const step = Math.min(last, Math.max(0, Math.floor(ms / stepMs)))
  const sum = (n: number) => scales.slice(0, n).reduce((a, s) => a + s, 0)
  return { step, along: sum(step) / sum(last), done: step === last }
}

/** How long the whole walk-up takes */
export function walkUpMs(scales: number[], stepMs: number): number {
  return Math.max(0, scales.length - 1) * stepMs
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
