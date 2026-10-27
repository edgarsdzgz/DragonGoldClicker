// =============================================================================
// THE EXPLORER'S OUTPOST (chapter 7, Beyond the Walls; numbers approved 2026-10-26)
// =============================================================================
// Explorers are trained from villagers and sent on expeditions that bring people home. The rules
// (costs, blocks, sending and claiming) are pure updaters in types/outpost.ts.

export interface PostLevelDef {
  level: number
  cost: number
  explorerCap: number
}

export const POST_LEVELS: PostLevelDef[] = [
  { level: 1, cost: 120, explorerCap: 1 },
  { level: 2, cost: 250, explorerCap: 2 },
  { level: 3, cost: 500, explorerCap: 3 },
]

export const MAX_POST_LEVEL = POST_LEVELS.length

/** Renown to train the first explorer from a villager; each one after costs more (^1.15) */
export const EXPLORER_BASE_COST = 10

/** Food the stores pay to send an expedition (no renown) */
export const EXPEDITION_FOOD_COST = 40

/** Expedition duration in seconds, before Cartography */
export const EXPEDITION_DURATION = 300

/** Consecutive misses before a guaranteed find */
export const EXPEDITION_PITY_THRESHOLD = 3

export interface ActiveExpedition {
  id: number
  startedAt: number
  duration: number
}

/**
 * How many people an expedition found, for a roll in [0, 1).
 * Weighted: 0 (35%), 1 (35%), 2 (20%), 3 (10%)
 * If pity is true, 0 is removed: 1 (55%), 2 (30%), 3 (15%)
 * findBonus (Keen Scouts) shifts weight from 0 toward higher results.
 */
export function rollExpeditionReward(pity: boolean, findBonus = 0, r: number = Math.random()): number {
  if (pity) {
    if (r < 0.55) return 1
    if (r < 0.85) return 2
    return 3
  }
  // findBonus reduces the 0 chance, redistributes to 1+
  const zeroChance = Math.max(0.05, 0.35 - findBonus)
  const shifted = 0.35 - zeroChance
  if (r < zeroChance) return 0
  if (r < zeroChance + 0.35 + shifted * 0.5) return 1
  if (r < zeroChance + 0.35 + shifted * 0.5 + 0.20 + shifted * 0.35) return 2
  return 3
}

export function getPostUpgradeCost(currentLevel: number): number | null {
  const nextDef = POST_LEVELS.find((l) => l.level === currentLevel + 1)
  return nextDef?.cost ?? null
}

export function getExplorerCap(postLevel: number): number {
  const def = POST_LEVELS.find((l) => l.level === postLevel)
  return def?.explorerCap ?? 0
}
