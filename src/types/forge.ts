import type { GameState } from './state'
import type { SoldierCounts, SoldierTier } from './soldiers'
import { SOLDIER_TIERS, getTotalSoldiers, getSoldierCount, soldierKey } from './soldiers'
import { roundCost, roundInsp } from './utils'

// =============================================================================
// KAEL'S FORGE (chapter 5 phase B, approved 2026-10-26)
// =============================================================================
// Gear is for soldiers only, one sword and one shield each, and it goes to the best ranks first.
// A sword makes a soldier's hit stronger (the army's job: holding the Gate while the player is
// away). A shield keeps a soldier alive when the wall falls (insurance nothing else gives). The
// player's own power at the Gate is the claws, not the Forge.

/** Renown to build the Forge */
export const ARMORY_COST = 75
/** Renown for the first sword and the first shield; each one after costs more (the ^1.15 curve) */
export const SWORD_BASE_COST = 15
export const SHIELD_BASE_COST = 20
/** An armed soldier's hit is this much stronger (+50%) */
export const SWORD_DAMAGE_BONUS = 0.5

export type Gear = 'sword' | 'shield'

const owned = (s: Pick<GameState, 'armoryGear'>, gear: Gear) =>
  gear === 'sword' ? s.armoryGear.swords : s.armoryGear.shields

/** What the next sword or shield costs, by how many the soldiers hold now */
export function gearCost(s: Pick<GameState, 'armoryGear'>, gear: Gear): number {
  const base = gear === 'sword' ? SWORD_BASE_COST : SHIELD_BASE_COST
  return roundCost(base * Math.pow(owned(s, gear) + 1, 1.15))
}

/**
 * How many of each rank hold this much gear, handed out from the knights down. Gear beyond the
 * soldiers there are (after a reassignment) waits in the racks.
 */
export function gearByRank(soldiers: SoldierCounts, pieces: number): SoldierCounts {
  const out: SoldierCounts = { conscripts: 0, footmen: 0, knights: 0 }
  let left = pieces
  for (const t of [...SOLDIER_TIERS].reverse()) {
    const n = Math.min(left, getSoldierCount(soldiers, t.id))
    out[soldierKey(t.id)] = n
    left -= n
  }
  return out
}

/** The rank the next sword or shield goes to; null when every soldier has one */
export function nextGearRank(s: Pick<GameState, 'soldiers' | 'armoryGear'>, gear: Gear): SoldierTier | null {
  const held = gearByRank(s.soldiers, owned(s, gear))
  const t = [...SOLDIER_TIERS].reverse().find((r) => held[soldierKey(r.id)] < getSoldierCount(s.soldiers, r.id))
  return t?.id ?? null
}

export type GearBlock = 'noForge' | 'nobody' | 'full' | 'renown' | null

/** Why the next sword or shield cannot be forged now, or null if it can */
export function gearBlock(s: GameState, gear: Gear): GearBlock {
  if (!s.armoryBuilt) return 'noForge'
  const soldiers = getTotalSoldiers(s.soldiers)
  if (soldiers === 0) return 'nobody'
  if (owned(s, gear) >= soldiers) return 'full'
  if (s.inspiration < gearCost(s, gear)) return 'renown'
  return null
}

/** Forge a sword or a shield for the next soldier in line. Unchanged if blocked. */
export function forgeGear(s: GameState, gear: Gear): GameState {
  if (gearBlock(s, gear) !== null) return s
  const cost = gearCost(s, gear)
  return {
    ...s,
    inspiration: roundInsp(s.inspiration - cost),
    totalInspirationSpent: roundInsp(s.totalInspirationSpent + cost),
    armoryGear: gear === 'sword'
      ? { ...s.armoryGear, swords: s.armoryGear.swords + 1 }
      : { ...s.armoryGear, shields: s.armoryGear.shields + 1 },
  }
}

/** Damage the swords add to the army's volley (before rations and hunger) */
export function swordVolleyBonus(s: Pick<GameState, 'soldiers' | 'armoryGear'>): number {
  const armed = gearByRank(s.soldiers, s.armoryGear.swords)
  return SOLDIER_TIERS.reduce((sum, t) => sum + armed[soldierKey(t.id)] * t.damage * SWORD_DAMAGE_BONUS, 0)
}

/**
 * Swords carried by the soldiers who fall in a Breach (only the unshielded fall). Within a rank
 * the fallen are those with no sword first; a sword is lost only once those run out.
 */
export function swordsLostWith(s: Pick<GameState, 'soldiers' | 'armoryGear'>, fallen: SoldierCounts): number {
  const armed = gearByRank(s.soldiers, s.armoryGear.swords)
  return SOLDIER_TIERS.reduce((sum, t) => {
    const k = soldierKey(t.id)
    return sum + Math.max(0, fallen[k] - (s.soldiers[k] - armed[k]))
  }, 0)
}
