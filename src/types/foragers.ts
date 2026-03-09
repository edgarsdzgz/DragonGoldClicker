// =============================================================================
// FORAGER TIERS
// =============================================================================

export type ForagerTier = 'gatherer' | 'trapper' | 'ranger'

export interface ForagerTierDef {
  id: ForagerTier
  name: string
  /** Food produced per second */
  baseRate: number
  baseCost: number
  unlocksAtLodgeLevel: number
}

export const FORAGER_TIERS: ForagerTierDef[] = [
  { id: 'gatherer', name: 'Gatherer', baseRate: 0.2, baseCost: 5, unlocksAtLodgeLevel: 1 },
  { id: 'trapper', name: 'Trapper', baseRate: 0.6, baseCost: 15, unlocksAtLodgeLevel: 3 },
  { id: 'ranger', name: 'Ranger', baseRate: 1.5, baseCost: 40, unlocksAtLodgeLevel: 5 },
]

export interface ForagerCounts {
  gatherers: number
  trappers: number
  rangers: number
}

// =============================================================================
// FORAGER'S LODGE LEVELS
// =============================================================================

export interface LodgeLevelDef {
  level: number
  cost: number
  foragerCap: number
}

export const LODGE_LEVELS: LodgeLevelDef[] = [
  { level: 1, cost: 40, foragerCap: 4 },
  { level: 2, cost: 120, foragerCap: 8 },
  { level: 3, cost: 350, foragerCap: 12 },
  { level: 4, cost: 700, foragerCap: 16 },
  { level: 5, cost: 1200, foragerCap: 20 },
]

export const MAX_LODGE_LEVEL = LODGE_LEVELS.length

// =============================================================================
// FORAGER HELPERS
// =============================================================================

export function getTotalForagers(foragers: ForagerCounts): number {
  return foragers.gatherers + foragers.trappers + foragers.rangers
}

export function getForagerCap(lodgeLevel: number): number {
  const def = LODGE_LEVELS.find((l) => l.level === lodgeLevel)
  return def?.foragerCap ?? 0
}

export function getLodgeUpgradeCost(currentLevel: number): number | null {
  const nextDef = LODGE_LEVELS.find((l) => l.level === currentLevel + 1)
  return nextDef?.cost ?? null
}

export function getForagerCost(tier: ForagerTierDef, currentCountOfTier: number): number {
  return Math.floor(tier.baseCost * Math.pow(currentCountOfTier + 1, 1.15))
}

export function getForagerCount(foragers: ForagerCounts, tier: ForagerTier): number {
  switch (tier) {
    case 'gatherer': return foragers.gatherers
    case 'trapper': return foragers.trappers
    case 'ranger': return foragers.rangers
  }
}

/**
 * Food/s from all foragers.
 */
export function getAutoFoodRate(foragers: ForagerCounts): number {
  let rate = 0
  for (const tier of FORAGER_TIERS) {
    const count = getForagerCount(foragers, tier.id)
    rate += count * tier.baseRate
  }
  return rate
}

// =============================================================================
// FORAGING
// =============================================================================

/**
 * Food gained per forage click: ceil(foragePower * (1 + forageBonus)).
 * With foragePower=1 and forageBonus=0.10 -> ceil(1.10) = 2
 * With foragePower=100 and forageBonus=0.10 -> ceil(110) = 110
 */
export function getForageYield(foragePower: number, forageBonus: number): number {
  return Math.ceil(foragePower * (1 + forageBonus))
}
