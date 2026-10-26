import { roundCost } from './utils'

// =============================================================================
// FORAGER TIERS
// =============================================================================

export type ForagerTier = 'gatherer' | 'trapper' | 'ranger'

export interface ForagerTierDef {
  id: ForagerTier
  name: string
  plural: string
  /** Food produced per second */
  baseRate: number
  /** Renown to train (a gatherer, from a villager) or promote (from the rank below) the first one */
  baseCost: number
  unlocksAtLodgeLevel: number
}

/** Gatherers trainable from the Forage tab without a Lodge */
export const BASE_GATHERER_CAP = 10

/**
 * Chapter 5 phase C (owner ruling, 2026-10-26): foragers follow the army's path. A villager is
 * trained into a gatherer (the Forage tab); the Ranger's Lodge promotes gatherers to trappers and
 * trappers to rangers. Food per meal: 8, 20 and 40 (one trapper feeds five fighters).
 */
export const FORAGER_TIERS: ForagerTierDef[] = [
  { id: 'gatherer', name: 'Gatherer', plural: 'gatherers', baseRate: 8 / 120, baseCost: 0.25, unlocksAtLodgeLevel: 0 },
  { id: 'trapper', name: 'Trapper', plural: 'trappers', baseRate: 20 / 120, baseCost: 15, unlocksAtLodgeLevel: 1 },
  { id: 'ranger', name: 'Ranger', plural: 'rangers', baseRate: 40 / 120, baseCost: 40, unlocksAtLodgeLevel: 3 },
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

/** The Lodge raises the forager cap above the 10 allowed without it, never lowers it */
export const LODGE_LEVELS: LodgeLevelDef[] = [
  { level: 1, cost: 30, foragerCap: 14 },
  { level: 2, cost: 75, foragerCap: 18 },
  { level: 3, cost: 150, foragerCap: 22 },
  { level: 4, cost: 300, foragerCap: 26 },
  { level: 5, cost: 600, foragerCap: 30 },
]

export const MAX_LODGE_LEVEL = LODGE_LEVELS.length

// =============================================================================
// FORAGER HELPERS
// =============================================================================

export function getTotalForagers(foragers: ForagerCounts): number {
  return foragers.gatherers + foragers.trappers + foragers.rangers
}

export function getForagerCap(lodgeLevel: number): number {
  if (lodgeLevel <= 0) return BASE_GATHERER_CAP
  const def = LODGE_LEVELS.find((l) => l.level === lodgeLevel)
  return def?.foragerCap ?? BASE_GATHERER_CAP
}

export function getLodgeUpgradeCost(currentLevel: number): number | null {
  const nextDef = LODGE_LEVELS.find((l) => l.level === currentLevel + 1)
  return nextDef?.cost ?? null
}

export function getForagerCost(tier: ForagerTierDef, currentCountOfTier: number): number {
  return roundCost(tier.baseCost * Math.pow(currentCountOfTier + 1, 1.15))
}

/** The key for a forager rank in ForagerCounts */
export function foragerKey(tier: ForagerTier): keyof ForagerCounts {
  return tier === 'gatherer' ? 'gatherers' : tier === 'trapper' ? 'trappers' : 'rangers'
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
