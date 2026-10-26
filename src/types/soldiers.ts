import { roundCost } from './utils'

// =============================================================================
// SOLDIER TIERS
// =============================================================================

export type SoldierTier = 'conscript' | 'footman' | 'knight'

export interface SoldierTierDef {
  id: SoldierTier
  name: string
  plural: string
  /** Damage each one adds to the army's volley at the Gate (a fighter adds FIGHTER_HIT_DAMAGE) */
  damage: number
  /** Renown to train (a conscript, from a fighter) or promote (from the rank below) the first one */
  baseCost: number
  unlocksAtBarracksLevel: number
}

/**
 * Chapter 5 (owner ruling, 2026-10-26): soldiers are trained fighters. The Garrison trains a
 * fighter into a conscript and promotes conscripts to footmen and footmen to knights. They fight
 * at the Gate in the same volley and earn renown only from kills. Provisional numbers.
 */
export const SOLDIER_TIERS: SoldierTierDef[] = [
  { id: 'conscript', name: 'Conscript', plural: 'conscripts', damage: 0.5, baseCost: 10, unlocksAtBarracksLevel: 1 },
  { id: 'footman', name: 'Footman', plural: 'footmen', damage: 1, baseCost: 30, unlocksAtBarracksLevel: 3 },
  { id: 'knight', name: 'Knight', plural: 'knights', damage: 2, baseCost: 80, unlocksAtBarracksLevel: 5 },
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

/** The Garrison: each level holds more soldiers (untrained fighters need no room) */
export const BARRACKS_LEVELS: BarracksLevelDef[] = [
  { level: 1, cost: 40, soldierCap: 4 },
  { level: 2, cost: 100, soldierCap: 8 },
  { level: 3, cost: 200, soldierCap: 12 },
  { level: 4, cost: 400, soldierCap: 16 },
  { level: 5, cost: 800, soldierCap: 20 },
]

export const MAX_BARRACKS_LEVEL = BARRACKS_LEVELS.length

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

export function getTierIndex(tier: SoldierTier): number {
  return SOLDIER_TIERS.findIndex((t) => t.id === tier)
}

/** The key for a rank in SoldierCounts */
export function soldierKey(tier: SoldierTier): keyof SoldierCounts {
  return tier === 'conscript' ? 'conscripts' : tier === 'footman' ? 'footmen' : 'knights'
}
