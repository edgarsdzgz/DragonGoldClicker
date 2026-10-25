import { roundCost } from './utils'

// =============================================================================
// FIGHTERS & REPAIRERS (Warfront units)
// =============================================================================

/** Base inspiration cost to rally a fighter */
export const FIGHTER_BASE_COST = 1.0

/** Cost scaling exponent: floor(baseCost * (n+1)^FIGHTER_COST_EXPONENT) */
export const FIGHTER_COST_EXPONENT = 1.4

/** Inspiration per second per fighter */
export const FIGHTER_INSP_RATE = 0.05

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

/**
 * Total auto inspiration rate from fighters.
 */
export function getFighterAutoRate(fighters: number): number {
  return fighters * FIGHTER_INSP_RATE
}
