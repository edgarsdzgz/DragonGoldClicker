// =============================================================================
// SIEGE MECHANICS: the wall's HP and its repair (strikes: types/wall.ts)
// =============================================================================

/** Starting and maximum city HP */
export const STARTING_CITY_HP = 100
export const MAX_CITY_HP = 100

/** HP restored per repairer per second */
export const REPAIR_RATE_PER_REPAIRER = 0.5

/**
 * HP repaired per second by all repairers.
 */
export function getRepairRate(repairers: number): number {
  return repairers * REPAIR_RATE_PER_REPAIRER
}
