import type { GameState } from './state'
import { roundInsp } from './utils'
import { getResearchBonuses } from './research'
import { asharaTapBonus } from './allies'

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

/** The last named level: Ancient. Past it, Kael reforges (chapter 8) */
export const MAX_CLAW_LEVEL = CLAWS[CLAWS.length - 1].level

// =============================================================================
// DRAGONSTEEL (chapter 8, approved 2026-10-26): endless reforges past Ancient
// =============================================================================
// Each reforge adds a quarter of Ancient's damage, so one keeps pace with five horde levels (5% a
// level); the price grows 40% each time, so the claws fall slowly behind unless the player invests.
// clawLevel keeps counting: 9 is Ancient +1.

/** Damage each reforge adds */
export const REFORGE_DAMAGE = 5
/** Renown for the first reforge; each one after costs REFORGE_COST_GROWTH times the last */
export const REFORGE_BASE_COST = 1000
export const REFORGE_COST_GROWTH = 1.4

/** Kael reforges past Ancient once his Dragonsteel scene has been seen */
export function canReforge(s: Pick<GameState, 'beatsSeen'>): boolean {
  return s.beatsSeen.includes('dragonsteel')
}

/** The claws at this level: the named track, then "Ancient Claws +n" */
export function clawDef(level: number): ClawDef {
  const l = Math.max(0, Math.floor(level))
  if (l <= MAX_CLAW_LEVEL) return CLAWS[l]
  const ancient = CLAWS[MAX_CLAW_LEVEL]
  const n = l - MAX_CLAW_LEVEL
  return {
    level: l,
    name: `${ancient.name} +${n}`,
    damage: ancient.damage + REFORGE_DAMAGE * n,
    cost: Math.round(REFORGE_BASE_COST * Math.pow(REFORGE_COST_GROWTH, n - 1)),
  }
}

/** The next level up; past Ancient only when Kael reforges (`reforge`), else null */
export function nextClaw(level: number, reforge = false): ClawDef | null {
  return level >= MAX_CLAW_LEVEL && !reforge ? null : clawDef(level + 1)
}

/** Whether the next level is a reforge past Ancient (Kael's, after Dragonsteel) rather than a sharpening */
export function reforgesNext(level: number, reforge: boolean): boolean {
  const next = nextClaw(level, reforge)
  return next !== null && next.level > MAX_CLAW_LEVEL
}

/** Whether the next level can be bought now (never while renown is in debt) */
export function canSharpen(s: Pick<GameState, 'clawLevel' | 'inspiration' | 'beatsSeen'>): boolean {
  const next = nextClaw(s.clawLevel, canReforge(s))
  return next !== null && s.inspiration >= next.cost
}

/** Buy the next level: pays its cost and sets the tap damage. Unchanged if it cannot be bought. */
export function sharpenClaws(s: GameState): GameState {
  const next = nextClaw(s.clawLevel, canReforge(s))
  if (!next || s.inspiration < next.cost) return s
  return {
    ...s,
    clawLevel: next.level,
    tapDamage: next.damage,
    inspiration: roundInsp(s.inspiration - next.cost),
    totalInspirationSpent: roundInsp(s.totalInspirationSpent + next.cost),
  }
}

/** A double strike (Weak Points) deals this many times a tap's damage */
export const DOUBLE_STRIKE = 2

/** One tap's damage with the Librarium's studies (Dragon Anatomy, Wyrm's Fury) and Ashara's strength */
export function tapDamageNow(s: Pick<GameState, 'tapDamage' | 'completedResearch' | 'beatsSeen'>): number {
  return Math.round(s.tapDamage * (1 + getResearchBonuses(s.completedResearch).tapDamageBonus + asharaTapBonus(s)) * 100) / 100
}

/** Whether a tap strikes for double, for a roll in [0, 1) (Weak Points; never before it) */
export function rollsDouble(s: Pick<GameState, 'completedResearch'>, roll: number): boolean {
  return roll < getResearchBonuses(s.completedResearch).doubleStrikeChance
}

/** What one tap deals: its damage now, doubled on a double strike */
export function tapHit(s: Pick<GameState, 'tapDamage' | 'completedResearch' | 'beatsSeen'>, double: boolean): number {
  return tapDamageNow(s) * (double ? DOUBLE_STRIKE : 1)
}

export type ClawTier = 'plain' | 'gold' | 'ember'

/** How the slash looks at this level: it grows, and turns gold, then ember, at the top levels */
export function clawLook(level: number): { scale: number; tier: ClawTier } {
  const scale = 1 + 0.05 * Math.max(0, Math.min(MAX_CLAW_LEVEL, level))
  const tier: ClawTier = level >= 6 ? 'ember' : level >= 4 ? 'gold' : 'plain'
  return { scale, tier }
}
