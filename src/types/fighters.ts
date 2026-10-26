import { roundCost } from './utils'

// =============================================================================
// FIGHTERS & REPAIRERS (Warfront units)
// =============================================================================

/** Base inspiration cost to rally a fighter */
export const FIGHTER_BASE_COST = 1.0

/** Cost scaling exponent: floor(baseCost * (n+1)^FIGHTER_COST_EXPONENT) */
export const FIGHTER_COST_EXPONENT = 1.4

/**
 * Each fighter swings at the monster on the field: FIGHTER_HIT_DAMAGE every FIGHTER_SWING_MS.
 * Owner rulings (2026-10-26): fighter hits stay small next to a tap (1 damage), and fighters
 * attack much slower than first built (every 1.5s): one swing every 6s, so a fighter deals 1/32
 * of a held strike (1 damage every 750ms). Fighters earn renown only through kills.
 */
export const FIGHTER_HIT_DAMAGE = 0.25
export const FIGHTER_SWING_MS = 6000

/** How often the fighters' swings are counted; swings that land in the same tick are grouped */
export const FIGHTER_TICK_MS = 250

/** Food consumed per fighter per food check */
export const FIGHTER_FOOD_COST = 4

/** Number of fighters required to unlock the Repair action */
export const REPAIR_UNLOCK_FIGHTERS = 3

/** Base inspiration cost to direct a repairer */
export const REPAIRER_BASE_COST = 0.75

/** Cost scaling exponent for repairers */
export const REPAIRER_COST_EXPONENT = 1.4

/** Food consumed per repairer per food check (75% of fighter) */
export const REPAIRER_FOOD_COST = 3

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Inspiration cost to rally the next fighter.
 * @param totalRallied lifetime fighters rallied (for cost curve)
 */
export function getFighterCost(totalRallied: number): number {
  return roundCost(FIGHTER_BASE_COST * Math.pow(totalRallied + 1, FIGHTER_COST_EXPONENT))
}

/**
 * Inspiration cost to direct the next repairer.
 * @param totalDirected lifetime repairers directed (for cost curve)
 */
export function getRepairerCost(totalDirected: number): number {
  return roundCost(REPAIRER_BASE_COST * Math.pow(totalDirected + 1, REPAIRER_COST_EXPONENT))
}

/** Damage per second dealt by all fighters together */
export function getFighterDps(fighters: number): number {
  return (fighters * FIGHTER_HIT_DAMAGE * 1000) / FIGHTER_SWING_MS
}

export interface FighterVolley {
  /** Swings that land this tick, all at once (each deals FIGHTER_HIT_DAMAGE); 0 between volleys */
  swings: number
  /** How far the next volley has come, as a share of FIGHTER_SWING_MS */
  progress: number
}

/**
 * One FIGHTER_TICK_MS step of the fighters' attack. Owner ruling (2026-10-26): fighters deal all
 * their damage in one hit, so every FIGHTER_SWING_MS all of them strike together as one volley
 * (n fighters: one hit of n x FIGHTER_HIT_DAMAGE), not one by one.
 */
export function stepFighterVolley(progress: number, fighters: number): FighterVolley {
  if (fighters <= 0) return { swings: 0, progress: 0 }
  const next = progress + FIGHTER_TICK_MS / FIGHTER_SWING_MS
  // A small allowance so float drift (24 x 1/24) still lands the volley on time
  if (next + 1e-9 < 1) return { swings: 0, progress: next }
  return { swings: fighters, progress: 0 }
}
