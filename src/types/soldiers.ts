import type { Ionicons } from '@expo/vector-icons'
import { roundCost } from './utils'

// =============================================================================
// SOLDIER TIERS
// =============================================================================

export type SoldierTier = 'conscript' | 'footman' | 'knight'

export interface SoldierTierDef {
  id: SoldierTier
  name: string
  baseRate: number
  baseCost: number
  unlocksAtBarracksLevel: number
}

export const SOLDIER_TIERS: SoldierTierDef[] = [
  { id: 'conscript', name: 'Conscript', baseRate: 0.0125, baseCost: 0.25, unlocksAtBarracksLevel: 1 },
  { id: 'footman', name: 'Footman', baseRate: 0.0375, baseCost: 0.75, unlocksAtBarracksLevel: 3 },
  { id: 'knight', name: 'Knight', baseRate: 0.1, baseCost: 2.0, unlocksAtBarracksLevel: 5 },
]

export interface SoldierCounts {
  conscripts: number
  footmen: number
  knights: number
}

// =============================================================================
// BARRACKS LEVELS
// =============================================================================

export interface BarracksLevelDef {
  level: number
  cost: number
  soldierCap: number
}

export const BARRACKS_LEVELS: BarracksLevelDef[] = [
  { level: 1, cost: 1.25, soldierCap: 4 },
  { level: 2, cost: 7.5, soldierCap: 8 },
  { level: 3, cost: 20, soldierCap: 12 },
  { level: 4, cost: 40, soldierCap: 16 },
  { level: 5, cost: 75, soldierCap: 20 },
]

export const MAX_BARRACKS_LEVEL = BARRACKS_LEVELS.length

// =============================================================================
// ARMORY GEAR (soldier equipment -- capped at total soldiers)
// =============================================================================

export const ARMORY_COST = 5
export const SWORD_COST = 0.75
export const SHIELD_COST = 1.0
export const SWORD_BONUS = 0.005
export const SHIELD_BONUS = 0.0025

// =============================================================================
// AVATAR WEAPONS (flat purchases, increase click power)
// =============================================================================

export interface AvatarWeaponDef {
  id: string
  name: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
  cost: number
  clickPowerBonus: number
}

// TODO layer 3: weapons become tap-damage upgrades; the "per click" income claim is no longer true
export const AVATAR_WEAPONS: AvatarWeaponDef[] = [
  { id: 'war_hammer', name: 'War Hammer', description: '+0.05 per click', icon: 'hammer', cost: 25, clickPowerBonus: 0.05 },
]

// =============================================================================
// SOLDIER HELPERS
// =============================================================================

export function getTotalSoldiers(soldiers: SoldierCounts): number {
  return soldiers.conscripts + soldiers.footmen + soldiers.knights
}

export function getSoldierCap(barracksLevel: number): number {
  const def = BARRACKS_LEVELS.find((l) => l.level === barracksLevel)
  return def?.soldierCap ?? 0
}

export function getBarracksUpgradeCost(currentLevel: number): number | null {
  const nextDef = BARRACKS_LEVELS.find((l) => l.level === currentLevel + 1)
  return nextDef?.cost ?? null
}

/**
 * Polynomial cost curve: floor(baseCost * (currentCount + 1)^1.15)
 */
export function getSoldierCost(tier: SoldierTierDef, currentCountOfTier: number): number {
  return roundCost(tier.baseCost * Math.pow(currentCountOfTier + 1, 1.15))
}

// Helper to get correct count from SoldierCounts for a given tier
export function getSoldierCount(soldiers: SoldierCounts, tier: SoldierTier): number {
  switch (tier) {
    case 'conscript': return soldiers.conscripts
    case 'footman': return soldiers.footmen
    case 'knight': return soldiers.knights
  }
}

/**
 * Gold/s from all soldiers + armory gear bonuses.
 */
export function getEffectiveAutoRate(soldiers: SoldierCounts, swords: number, shields: number): number {
  let rate = 0
  for (const tier of SOLDIER_TIERS) {
    const count = getSoldierCount(soldiers, tier.id)
    rate += count * tier.baseRate
  }
  rate += swords * SWORD_BONUS
  rate += shields * SHIELD_BONUS
  return rate
}

// =============================================================================
// SOLDIER PROMOTION
// =============================================================================

/** Discount factor by number of tier steps: 1 step = 60%, 2 steps = 80% */
const PROMOTION_DISCOUNT: Record<number, number> = { 1: 0.6, 2: 0.8 }

export function getTierIndex(tier: SoldierTier): number {
  return SOLDIER_TIERS.findIndex((t) => t.id === tier)
}

/**
 * Cost to promote a soldier from one tier to a higher tier.
 * Based on the target tier's new-recruit cost (at current count) * discount.
 * More steps = smaller discount (higher cost).
 */
export function getPromotionCost(
  fromTier: SoldierTier,
  toTier: SoldierTier,
  soldiersTrained: SoldierCounts,
): number | null {
  const fromIdx = getTierIndex(fromTier)
  const toIdx = getTierIndex(toTier)
  if (fromIdx < 0 || toIdx < 0 || toIdx <= fromIdx) return null

  const steps = toIdx - fromIdx
  const discount = PROMOTION_DISCOUNT[steps] ?? 0.9
  const targetDef = SOLDIER_TIERS[toIdx]
  const trainedCount = getSoldierCount(soldiersTrained, toTier)
  const freshCost = getSoldierCost(targetDef, trainedCount)

  return roundCost(freshCost * discount)
}

/**
 * Returns promotable target tiers for a given source tier,
 * filtered by barracks level.
 */
export function getPromotionTargets(
  fromTier: SoldierTier,
  barracksLevel: number,
): SoldierTierDef[] {
  const fromIdx = getTierIndex(fromTier)
  return SOLDIER_TIERS.filter((t, i) =>
    i > fromIdx && barracksLevel >= t.unlocksAtBarracksLevel
  )
}
