// =============================================================================
// SIEGE MECHANICS
// =============================================================================

/** Starting and maximum city HP */
export const STARTING_CITY_HP = 100
export const MAX_CITY_HP = 100

/** Seconds between siege damage ticks */
export const SIEGE_TICK_INTERVAL = 10

/** Damage multiplier: damage = max(0, threat - defense) * SIEGE_DAMAGE_FACTOR */
export const SIEGE_DAMAGE_FACTOR = 0.5

/** HP restored per repairer per second */
export const REPAIR_RATE_PER_REPAIRER = 0.5

// =============================================================================
// THREAT LEVEL MILESTONES
// =============================================================================

interface ThreatMilestone {
  /** Total inspiration earned threshold */
  threshold: number
  /** Threat level at this milestone */
  threat: number
}

const THREAT_MILESTONES: ThreatMilestone[] = [
  { threshold: 0, threat: 1 },
  { threshold: 10, threat: 3 },
  { threshold: 37.5, threat: 6 },
  { threshold: 75, threat: 10 },
  { threshold: 150, threat: 15 },
  { threshold: 250, threat: 22 },
]

/**
 * Current threat level based on total inspiration earned.
 * Returns the highest milestone reached.
 *
 * NOTE: Scaling disabled until balance/playtesting data is gathered.
 * When ready, remove the early return to enable milestone progression.
 */
export function getThreatLevel(_totalInspirationEarned: number): number {
  // Fixed at base threat until balancing is done
  return THREAT_MILESTONES[0].threat

  // let threat = 0
  // for (const m of THREAT_MILESTONES) {
  //   if (_totalInspirationEarned >= m.threshold) {
  //     threat = m.threat
  //   }
  // }
  // return threat
}

/**
 * Defense level = click power + number of fighters.
 * Tower bonuses will be added in Phase 6.
 */
export function getDefenseLevel(clickPower: number, fighters: number): number {
  return clickPower + fighters
}

/**
 * Siege damage per tick: max(0, threat - defense) * SIEGE_DAMAGE_FACTOR.
 * Returns 0 if defense >= threat.
 */
export function getSiegeDamage(threat: number, defense: number): number {
  return parseFloat((Math.max(0, threat - defense) * SIEGE_DAMAGE_FACTOR).toFixed(2))
}

/**
 * HP repaired per second by all repairers.
 */
export function getRepairRate(repairers: number): number {
  return repairers * REPAIR_RATE_PER_REPAIRER
}
