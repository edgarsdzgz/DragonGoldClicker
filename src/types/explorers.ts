// =============================================================================
// EXPLORER'S POST
// =============================================================================

export interface PostLevelDef {
  level: number
  cost: number
  explorerCap: number
}

export const POST_LEVELS: PostLevelDef[] = [
  { level: 1, cost: 10, explorerCap: 1 },
  { level: 2, cost: 30, explorerCap: 2 },
  { level: 3, cost: 60, explorerCap: 3 },
]

export const MAX_POST_LEVEL = POST_LEVELS.length

export const EXPLORER_COST = 1.5

/** Inspiration cost to send an explorer on an expedition */
/** Renown cost of an expedition (identifier predates the rename to renown) */
export const EXPEDITION_INSPIRATION_COST = 2.5

/** Food cost to send an explorer on an expedition */
export const EXPEDITION_FOOD_COST = 30

/** Expedition duration in seconds */
export const EXPEDITION_DURATION = 120

/** Consecutive misses before a guaranteed find */
export const EXPEDITION_PITY_THRESHOLD = 3

export interface ActiveExpedition {
  id: number
  startedAt: number
  duration: number
}

/**
 * Determine how many villagers an expedition found.
 * Weighted: 0 (35%), 1 (35%), 2 (20%), 3 (10%)
 * If pity is true, 0 is removed: 1 (55%), 2 (30%), 3 (15%)
 * findBonus shifts weight from 0 toward higher results.
 */
export function rollExpeditionReward(pity: boolean, findBonus = 0): number {
  const r = Math.random()
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
