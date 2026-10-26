import type { SoldierTier } from './soldiers'
import { SOLDIER_TIERS, getSoldierCount, getTotalSoldiers, soldierKey } from './soldiers'
import type { ForagerTier } from './foragers'
import { FORAGER_TIERS, getForagerCount, getTotalForagers, getForagerCap, foragerKey } from './foragers'
import type { GameState } from './state'

// =============================================================================
// THE KEEP: MOVING PEOPLE BETWEEN JOBS (chapter 5 phase C, approved 2026-10-26)
// =============================================================================
// Free, and it refunds nothing; the price curves do not step back. Fighters, repairers, gatherers
// and explorers move between the basic jobs or stand idle. A soldier stands down to a fighter (their
// gear stays in the Forge's racks) and a trapper or ranger goes back to gathering. Nobody moves out
// of idle here: rallying, directing and training still cost what they cost.

export type RoleId =
  | { type: 'fighter' }
  | { type: 'repairer' }
  | { type: 'soldier'; tier: SoldierTier }
  | { type: 'forager'; tier: ForagerTier }
  | { type: 'explorer' }
  | { type: 'idle' }

const FIGHTER: RoleId = { type: 'fighter' }
const GATHERER: RoleId = { type: 'forager', tier: 'gatherer' }

/** The jobs anyone can move between */
export const BASIC_ROLES: RoleId[] = [FIGHTER, { type: 'repairer' }, GATHERER, { type: 'idle' }]

export function sameRole(a: RoleId, b: RoleId): boolean {
  if (a.type !== b.type) return false
  if (a.type === 'soldier' && b.type === 'soldier') return a.tier === b.tier
  if (a.type === 'forager' && b.type === 'forager') return a.tier === b.tier
  return true
}

/** How many in this role can be moved now (explorers away on an expedition cannot) */
export function roleCount(s: GameState, r: RoleId): number {
  switch (r.type) {
    case 'fighter': return s.fighters
    case 'repairer': return s.repairers
    case 'soldier': return getSoldierCount(s.soldiers, r.tier)
    case 'forager': return getForagerCount(s.foragers, r.tier)
    case 'explorer': return Math.max(0, s.explorers - s.activeExpeditions.length)
    case 'idle': return s.villagers
  }
}

export function roleName(r: RoleId): string {
  switch (r.type) {
    case 'fighter': return 'Fighter'
    case 'repairer': return 'Repairer'
    case 'soldier': return SOLDIER_TIERS.find((t) => t.id === r.tier)!.name
    case 'forager': return FORAGER_TIERS.find((t) => t.id === r.tier)!.name
    case 'explorer': return 'Explorer'
    case 'idle': return 'Idle villager'
  }
}

/** Everyone at work (not idle) */
export function peopleAtWork(s: GameState): number {
  return s.fighters + s.repairers + getTotalSoldiers(s.soldiers) + getTotalForagers(s.foragers) + s.explorers
}

/** Where someone in this role may go */
export function moveTargets(from: RoleId): RoleId[] {
  if (from.type === 'idle') return []
  if (from.type === 'soldier') return [FIGHTER]
  if (from.type === 'forager' && from.tier !== 'gatherer') return [GATHERER]
  return BASIC_ROLES.filter((r) => !sameRole(r, from))
}

export type MoveBlock = 'nobody' | 'notAllowed' | 'full' | null

/** Why one person cannot move from one job to the other now, or null if they can */
export function moveBlock(s: GameState, from: RoleId, to: RoleId): MoveBlock {
  if (!moveTargets(from).some((r) => sameRole(r, to))) return 'notAllowed'
  if (roleCount(s, from) <= 0) return 'nobody'
  // A promoted forager going back to gathering keeps their place; anyone else needs room
  if (to.type === 'forager' && from.type !== 'forager' && getTotalForagers(s.foragers) >= getForagerCap(s.lodgeLevel)) return 'full'
  return null
}

function withCount(s: GameState, r: RoleId, delta: number): GameState {
  switch (r.type) {
    case 'fighter': return { ...s, fighters: s.fighters + delta }
    case 'repairer': return { ...s, repairers: s.repairers + delta }
    case 'soldier': {
      const k = soldierKey(r.tier)
      return { ...s, soldiers: { ...s.soldiers, [k]: s.soldiers[k] + delta } }
    }
    case 'forager': {
      const k = foragerKey(r.tier)
      return { ...s, foragers: { ...s.foragers, [k]: s.foragers[k] + delta } }
    }
    case 'explorer': return { ...s, explorers: s.explorers + delta }
    case 'idle': return { ...s, villagers: s.villagers + delta }
  }
}

/** Move one person. Free, no refund, no counter steps back. Unchanged if blocked. */
export function movePerson(s: GameState, from: RoleId, to: RoleId): GameState {
  if (moveBlock(s, from, to) !== null) return s
  return withCount(withCount(s, from, -1), to, 1)
}

/** A row in the Keep's move dialog */
export interface ReassignOption {
  target: RoleId
  label: string
  /** Always 0: moving is free (kept for the dialog's price badge) */
  netCost: number
  locked: boolean
  lockReason: string
  atCap: boolean
}

/** The dialog's choices for someone in this role */
export function getReassignOptions(from: RoleId, s: GameState): ReassignOption[] {
  return moveTargets(from).map((target) => ({
    target,
    label: target.type === 'idle' ? 'Stand idle' : roleName(target),
    netCost: 0,
    locked: false,
    lockReason: '',
    atCap: moveBlock(s, from, target) === 'full',
  }))
}
