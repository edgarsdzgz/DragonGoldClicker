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
 * Owner ruling (2026-10-26): a fighter deals 1/8 of a held strike (1 damage every 750ms), so
 * eight fighters match the held button. Fighters earn renown only through kills.
 */
export const FIGHTER_HIT_DAMAGE = 0.25
export const FIGHTER_SWING_MS = 1500

/** How often the fighters' swings are counted; swings that land in the same tick are grouped */
export const FIGHTER_TICK_MS = 250

/** Food consumed per fighter per food check */
export const FIGHTER_FOOD_COST = 2

/** Number of fighters required to unlock the Repair action */
export const REPAIR_UNLOCK_FIGHTERS = 3

/** Base inspiration cost to direct a repairer */
export const REPAIRER_BASE_COST = 0.75

/** Cost scaling exponent for repairers */
export const REPAIRER_COST_EXPONENT = 1.4

/** Food consumed per repairer per food check (75% of fighter) */
export const REPAIRER_FOOD_COST = 1.5

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

export interface FighterSwings {
  /** Swings that land this tick (each deals FIGHTER_HIT_DAMAGE) */
  swings: number
  /** Part of a swing carried into the next tick */
  progress: number
}

/**
 * One FIGHTER_TICK_MS step of the fighters' swings. Fighters are staggered, so n fighters land
 * n swings per FIGHTER_SWING_MS spread evenly, not all at once.
 */
export function stepFighterSwings(progress: number, fighters: number): FighterSwings {
  if (fighters <= 0) return { swings: 0, progress: 0 }
  const next = progress + (fighters * FIGHTER_TICK_MS) / FIGHTER_SWING_MS
  // A small allowance so float drift (6 x 1/6) still lands the swing on time
  const swings = Math.floor(next + 1e-9)
  return { swings, progress: Math.max(0, next - swings) }
}
