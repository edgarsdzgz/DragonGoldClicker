// =============================================================================
// MILESTONE VILLAGER RECRUITMENT
// =============================================================================

export interface MilestoneDef {
  /** Total inspiration earned threshold to trigger */
  threshold: number
  /** Number of villagers offered */
  villagers: number
}

/**
 * Villager recruitment milestones, ordered by threshold.
 * Each fires once when totalInspirationEarned crosses the threshold.
 */
export const MILESTONES: MilestoneDef[] = [
  { threshold: 500, villagers: 3 },
  { threshold: 1000, villagers: 3 },
  { threshold: 2500, villagers: 2 },
  { threshold: 3500, villagers: 7 },
]

/**
 * Returns the first milestone that has been reached but not yet offered.
 * Returns null if no new milestone is pending.
 */
export function getNextMilestone(
  totalInspirationEarned: number,
  milestonesOffered: number[],
): MilestoneDef | null {
  for (const m of MILESTONES) {
    if (totalInspirationEarned >= m.threshold && !milestonesOffered.includes(m.threshold)) {
      return m
    }
  }
  return null
}
