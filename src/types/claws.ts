import type { GameState } from './state'
import { roundInsp } from './utils'

// =============================================================================
// THE DRAGON'S CLAWS (core-tap layer 3): the player's own power curve
// =============================================================================
// The player is the dragon (visual direction, 2026-10-26). One track, bought with renown level by
// level. Fighters do not use the claws, and a Breach never takes them. Provisional numbers: cost
// roughly doubles, damage grows about a third (the balance pass tunes them).

export interface ClawDef {
  level: number
  name: string
  /** Damage per tap at this level */
  damage: number
  /** Renown to reach this level from the one before (0 for the claws the dragon starts with) */
  cost: number
}

export const CLAWS: ClawDef[] = [
  { level: 0, name: 'Fledgling Claws', damage: 1, cost: 0 },
  { level: 1, name: 'Sharpened Claws', damage: 2, cost: 5 },
  { level: 2, name: 'Hooked Claws', damage: 3, cost: 12 },
  { level: 3, name: 'Hardened Claws', damage: 4, cost: 25 },
  { level: 4, name: 'Serrated Claws', damage: 6, cost: 50 },
  { level: 5, name: 'Obsidian Claws', damage: 8, cost: 100 },
  { level: 6, name: 'Ember Claws', damage: 11, cost: 200 },
  { level: 7, name: 'Dragonsteel Claws', damage: 15, cost: 400 },
  { level: 8, name: 'Ancient Claws', damage: 20, cost: 800 },
]

export const MAX_CLAW_LEVEL = CLAWS[CLAWS.length - 1].level

/** The claws at this level (clamped to the track) */
export function clawDef(level: number): ClawDef {
  return CLAWS[Math.max(0, Math.min(MAX_CLAW_LEVEL, Math.floor(level)))]
}

/** The next level up, or null once the claws are Ancient */
export function nextClaw(level: number): ClawDef | null {
  return level >= MAX_CLAW_LEVEL ? null : clawDef(level + 1)
}

/** Whether the next level can be bought now (never while renown is in debt) */
export function canSharpen(s: Pick<GameState, 'clawLevel' | 'inspiration'>): boolean {
  const next = nextClaw(s.clawLevel)
  return next !== null && s.inspiration >= next.cost
}

/** Buy the next level: pays its cost and sets the tap damage. Unchanged if it cannot be bought. */
export function sharpenClaws(s: GameState): GameState {
  const next = nextClaw(s.clawLevel)
  if (!next || s.inspiration < next.cost) return s
  return {
    ...s,
    clawLevel: next.level,
    tapDamage: next.damage,
    inspiration: roundInsp(s.inspiration - next.cost),
    totalInspirationSpent: roundInsp(s.totalInspirationSpent + next.cost),
  }
}

export type ClawTier = 'plain' | 'gold' | 'ember'

/** How the slash looks at this level: it grows, and turns gold, then ember, at the top levels */
export function clawLook(level: number): { scale: number; tier: ClawTier } {
  const scale = 1 + 0.05 * Math.max(0, Math.min(MAX_CLAW_LEVEL, level))
  const tier: ClawTier = level >= 6 ? 'ember' : level >= 4 ? 'gold' : 'plain'
  return { scale, tier }
}
