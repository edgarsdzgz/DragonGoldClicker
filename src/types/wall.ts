import type { GameState } from './state'
import { currentMonster } from './monsters'
import { applyCityDamage } from './cityHp'
import { isSystemOn } from './systems'
import { resolveBreach, wardLeft } from './breach'
import { wallBlowShare } from './allies'

export { HORDE_LEVEL_KILLS, HORDE_STRENGTH_PER_LEVEL, hordeLevel, hordeStrength } from './horde'

// =============================================================================
// THE WALL (core-tap layer 6): the monster at the gate strikes it while it lives
// =============================================================================

/** Seconds between a monster's strikes. Its first comes this long after it arrives. */
export const WALL_STRIKE_SEC = 5

/** Wall damage of one strike by the monster at the gate (less behind Sera's shield wall) */
export function wallStrikeDamage(s: GameState): number {
  return currentMonster(s).wallStrike * wallBlowShare(s)
}

/**
 * One second at the gate (once the siege is on): the monster's clock runs, and every
 * WALL_STRIKE_SEC it strikes the wall. A kill restarts the clock (types/monsters.ts), so a monster
 * killed fast never strikes. Nothing strikes while the app is closed, or while the ward from a
 * Breach holds. A strike that brings the wall to 0 is a Breach (types/breach.ts).
 */
export function stepWall(s: GameState, rand: number = Math.random()): GameState {
  if (!isSystemOn(s, 'siege') || s.cityHp <= 0) return s
  if (wardLeft(s) > 0) return s.siegeTimer === 0 ? s : { ...s, siegeTimer: 0 }
  const timer = s.siegeTimer + 1
  if (timer < WALL_STRIKE_SEC) return { ...s, siegeTimer: timer }
  const struck = { ...applyCityDamage(s, wallStrikeDamage(s)), siegeTimer: 0 }
  return struck.cityHp <= 0 ? resolveBreach(struck, rand) : struck
}

// =============================================================================
// WARNINGS: the wall never falls without them
// =============================================================================

export type WallWarning = 'cracking' | 'failing' | 'last'

/** Highest first: the HP at or below which each warning fires */
export const WALL_WARNINGS: { id: WallWarning; atOrBelow: number; text: string }[] = [
  { id: 'last', atOrBelow: 10, text: 'Captain Rodain: "It won\'t hold, Steward!"' },
  { id: 'failing', atOrBelow: 25, text: 'The wall is failing!' },
  { id: 'cracking', atOrBelow: 50, text: 'The wall is cracking.' },
]

/**
 * The most severe warning the wall has just fallen into, or null. Only a fall across a line
 * fires: holding below it, or climbing back up, does not (so repairs re-arm each warning).
 */
export function wallWarningCrossed(prevHp: number, hp: number): (typeof WALL_WARNINGS)[number] | null {
  if (hp >= prevHp) return null
  return WALL_WARNINGS.find((w) => hp <= w.atOrBelow && prevHp > w.atOrBelow) ?? null
}

/** How the wall bar looks: green while sound, amber at half, red at a quarter (and it pulses) */
export function wallTone(hp: number): 'sound' | 'cracking' | 'failing' {
  if (hp <= 25) return 'failing'
  if (hp <= 50) return 'cracking'
  return 'sound'
}
