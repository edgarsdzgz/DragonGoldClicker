import type { SoldierTier, SoldierCounts } from './soldiers'
import {
  SOLDIER_TIERS,
  getTierIndex,
  getSoldierCount,
  getSoldierCost,
  getTotalSoldiers,
  getSoldierCap,
} from './soldiers'
import type { ForagerTier, ForagerCounts } from './foragers'
import {
  FORAGER_TIERS,
  getForagerCount,
  getForagerCost,
  getTotalForagers,
  getForagerCap,
} from './foragers'
import { EXPLORER_COST, getExplorerCap } from './explorers'
import type { GameState } from './state'

// =============================================================================
// DRACONIA HALL / ROLE REASSIGNMENT
// =============================================================================

/** Fraction of original training cost refunded when reassigning or dismissing */
export const REASSIGN_REFUND_RATE = 0.5

/** Fraction of original training cost refunded when dismissing to idle */
export const DISMISS_REFUND_RATE = 0.3

/**
 * Unified role identifier used by the reassignment system.
 * Soldiers and foragers have tiered variants; explorer is flat.
 */
export type RoleId =
  | { type: 'soldier'; tier: SoldierTier }
  | { type: 'forager'; tier: ForagerTier }
  | { type: 'explorer' }
  | { type: 'idle' }

/** Tier index for cross-role equivalence (T1=0, T2=1, T3=2) */
export function getRoleTierIndex(role: RoleId): number {
  if (role.type === 'soldier') return getTierIndex(role.tier)
  if (role.type === 'forager') {
    const idx = FORAGER_TIERS.findIndex((t) => t.id === role.tier)
    return idx >= 0 ? idx : 0
  }
  return 0 // explorer and idle are tier-0 equivalent
}

/**
 * Estimate what it cost to train a unit into its current role.
 * Uses the lifetime-trained counter to approximate the most recent recruit's cost.
 */
export function getTrainingCost(role: RoleId, state: GameState): number {
  if (role.type === 'soldier') {
    const tierDef = SOLDIER_TIERS.find((t) => t.id === role.tier)
    if (!tierDef) return 0
    // Use (lifetimeTrained - 1) to approximate cost of last trained unit, min 0
    const lifetimeCount = Math.max(0, getSoldierCount(state.soldiersTrained, role.tier) - 1)
    return getSoldierCost(tierDef, lifetimeCount)
  }
  if (role.type === 'forager') {
    const tierDef = FORAGER_TIERS.find((t) => t.id === role.tier)
    if (!tierDef) return 0
    const lifetimeCount = Math.max(0, getForagerCount(state.foragersTrained, role.tier) - 1)
    return getForagerCost(tierDef, lifetimeCount)
  }
  if (role.type === 'explorer') return EXPLORER_COST
  return 0
}

/**
 * Cost to train INTO a target role (fresh recruit price at current lifetime count).
 */
export function getRecruitCost(role: RoleId, state: GameState): number {
  if (role.type === 'soldier') {
    const tierDef = SOLDIER_TIERS.find((t) => t.id === role.tier)
    if (!tierDef) return 0
    return getSoldierCost(tierDef, getSoldierCount(state.soldiersTrained, role.tier))
  }
  if (role.type === 'forager') {
    const tierDef = FORAGER_TIERS.find((t) => t.id === role.tier)
    if (!tierDef) return 0
    return getForagerCost(tierDef, getForagerCount(state.foragersTrained, role.tier))
  }
  if (role.type === 'explorer') return EXPLORER_COST
  return 0
}

export interface ReassignOption {
  target: RoleId
  label: string
  netCost: number // positive = player pays, negative = player gets refund
  locked: boolean
  lockReason: string
  atCap: boolean
}

/**
 * Calculate all valid reassignment targets for a unit in a given role.
 * Includes cross-role swaps at equivalent tier, dismiss to idle, etc.
 */
export function getReassignOptions(from: RoleId, state: GameState): ReassignOption[] {
  if (from.type === 'idle') return []

  const refundAmount = Math.floor(getTrainingCost(from, state) * REASSIGN_REFUND_RATE)
  const dismissRefund = Math.floor(getTrainingCost(from, state) * DISMISS_REFUND_RATE)
  const options: ReassignOption[] = []

  // Soldier targets
  for (const tier of SOLDIER_TIERS) {
    const target: RoleId = { type: 'soldier', tier: tier.id }
    // Skip if same role
    if (from.type === 'soldier' && from.tier === tier.id) continue
    // Block promotions within same type -- must use Barracks promote flow
    if (from.type === 'soldier') {
      const fromIdx = getTierIndex(from.tier)
      const toIdx = getTierIndex(tier.id)
      if (toIdx > fromIdx) continue
    }
    const locked = state.barracksLevel < tier.unlocksAtBarracksLevel
    const total = getTotalSoldiers(state.soldiers)
    // When swapping FROM a soldier, they vacate their slot, so effective count is total - 1
    const effectiveTotal = from.type === 'soldier' ? total - 1 : total
    const cap = getSoldierCap(state.barracksLevel)
    const atCap = effectiveTotal >= cap
    const recruitCost = getRecruitCost(target, state)
    const netCost = recruitCost - refundAmount

    options.push({
      target,
      label: tier.name,
      netCost,
      locked,
      lockReason: `Barracks Lv${tier.unlocksAtBarracksLevel}`,
      atCap,
    })
  }

  // Forager targets
  for (const tier of FORAGER_TIERS) {
    const target: RoleId = { type: 'forager', tier: tier.id }
    if (from.type === 'forager' && from.tier === tier.id) continue
    // Block promotions within same type -- must use Lodge promote flow
    if (from.type === 'forager') {
      const fromIdx = FORAGER_TIERS.findIndex((t) => t.id === from.tier)
      const toIdx = FORAGER_TIERS.findIndex((t) => t.id === tier.id)
      if (toIdx > fromIdx) continue
    }
    const locked = state.lodgeLevel < tier.unlocksAtLodgeLevel
    const total = getTotalForagers(state.foragers)
    const effectiveTotal = from.type === 'forager' ? total - 1 : total
    const cap = getForagerCap(state.lodgeLevel)
    const atCap = effectiveTotal >= cap
    const recruitCost = getRecruitCost(target, state)
    const netCost = recruitCost - refundAmount

    options.push({
      target,
      label: tier.name,
      netCost,
      locked,
      lockReason: `Lodge Lv${tier.unlocksAtLodgeLevel}`,
      atCap,
    })
  }

  // Explorer target
  if (from.type !== 'explorer') {
    const locked = state.postLevel <= 0
    const cap = getExplorerCap(state.postLevel)
    const atCap = state.explorers >= cap
    const recruitCost = EXPLORER_COST
    const netCost = recruitCost - refundAmount

    options.push({
      target: { type: 'explorer' },
      label: 'Explorer',
      netCost,
      locked,
      lockReason: 'Post Lv1',
      atCap,
    })
  }

  // Dismiss to idle (always available, gives small refund)
  options.push({
    target: { type: 'idle' },
    label: 'Dismiss to Idle',
    netCost: -dismissRefund,
    locked: false,
    lockReason: '',
    atCap: false,
  })

  return options
}
