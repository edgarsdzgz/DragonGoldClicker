import type { GameState } from './state'
import type { ForagerTier } from './foragers'
import { FORAGER_TIERS, getForagerCap, getForagerCost, getForagerCount, getTotalForagers, foragerKey } from './foragers'
import { roundInsp } from './utils'

// =============================================================================
// THE RANGER'S LODGE (chapter 5 phase C, approved 2026-10-26)
// =============================================================================
// Foragers follow the army's path: a villager is trained into a gatherer (the Forage tab, no
// building needed), and the Lodge promotes gatherers to trappers and trappers to rangers. Only
// training adds a forager, so only training needs room under the cap.

/** What the next of this rank costs: trained from a villager (gatherer) or promoted (the rest) */
export function foragerCost(s: Pick<GameState, 'foragersTrained'>, tier: ForagerTier): number {
  const def = FORAGER_TIERS.find((t) => t.id === tier)!
  return getForagerCost(def, getForagerCount(s.foragersTrained, tier))
}

/** The rank a forager of this rank is made from: a villager for a gatherer, else the rank below */
export function foragerBelow(tier: ForagerTier): ForagerTier | 'villager' {
  const i = FORAGER_TIERS.findIndex((t) => t.id === tier)
  return i <= 0 ? 'villager' : FORAGER_TIERS[i - 1].id
}

export type ForagerBlock = 'locked' | 'full' | 'nobody' | 'renown' | null

/** Why the next of this rank cannot be made now, or null if it can */
export function foragerBlock(s: GameState, tier: ForagerTier): ForagerBlock {
  const def = FORAGER_TIERS.find((t) => t.id === tier)!
  if (s.lodgeLevel < def.unlocksAtLodgeLevel) return 'locked'
  const from = foragerBelow(tier)
  if (from === 'villager' && getTotalForagers(s.foragers) >= getForagerCap(s.lodgeLevel)) return 'full'
  const available = from === 'villager' ? s.villagers : getForagerCount(s.foragers, from)
  if (available <= 0) return 'nobody'
  if (s.inspiration < foragerCost(s, tier)) return 'renown'
  return null
}

/** Train a villager into a gatherer, or promote one from the rank below. Unchanged if blocked. */
export function makeForager(s: GameState, tier: ForagerTier): GameState {
  if (foragerBlock(s, tier) !== null) return s
  const cost = foragerCost(s, tier)
  const from = foragerBelow(tier)
  const key = foragerKey(tier)
  const foragers = { ...s.foragers, [key]: s.foragers[key] + 1 }
  if (from !== 'villager') foragers[foragerKey(from)] -= 1
  return {
    ...s,
    inspiration: roundInsp(s.inspiration - cost),
    totalInspirationSpent: roundInsp(s.totalInspirationSpent + cost),
    villagers: from === 'villager' ? s.villagers - 1 : s.villagers,
    foragers,
    foragersTrained: { ...s.foragersTrained, [key]: s.foragersTrained[key] + 1 },
  }
}
