import type { GameState } from './state'
import type { SoldierTier } from './soldiers'
import { SOLDIER_TIERS, getTotalSoldiers, getSoldierCap, getSoldierCost, getSoldierCount, soldierKey } from './soldiers'
import { FIGHTER_HIT_DAMAGE, FIGHTER_SWING_MS } from './fighters'
import { fighterDamageMultiplier } from './fedState'
import { getResearchBonuses } from './research'
import { MONSTERS } from './monsterRoster'
import { currentMonster } from './monsters'
import type { MonsterDef } from './monsterRoster'
import { spawnWeights } from './spawnPool'
import { WALL_STRIKE_SEC } from './wall'
import { roundInsp } from './utils'

// =============================================================================
// THE ARMY (chapter 5): fighters and the soldiers trained from them, one volley at the Gate
// =============================================================================
// Rally makes a villager a fighter; the Garrison trains a fighter into a conscript and promotes
// conscripts to footmen and footmen to knights. Everyone strikes together every FIGHTER_SWING_MS,
// and renown comes only from kills. The army is the player's power while away from the Gate:
// strong enough, it kills each monster before it strikes the wall.

/** Everyone who fights at the Gate */
export function armySize(s: Pick<GameState, 'fighters' | 'soldiers'>): number {
  return s.fighters + getTotalSoldiers(s.soldiers)
}

/** The volley's damage before rations and hunger: fighters plus every soldier by rank */
export function armyVolleyDamage(s: Pick<GameState, 'fighters' | 'soldiers'>): number {
  return SOLDIER_TIERS.reduce(
    (sum, t) => sum + getSoldierCount(s.soldiers, t.id) * t.damage,
    s.fighters * FIGHTER_HIT_DAMAGE,
  )
}

/** The volley as it lands: scaled by the army's ration and how fed it is (0 when they stand down) */
export function armyVolleyNow(s: GameState): number {
  return armyVolleyDamage(s) * fighterDamageMultiplier(s)
}

/** The army's damage per second as it stands (rations and hunger included) */
export function armyDps(s: GameState): number {
  return (armyVolleyNow(s) * 1000) / FIGHTER_SWING_MS
}

/**
 * Renown per second the army earns by itself, paid at the bounty per HP of the monster it faces
 * (the rate offline progress uses: no kills are counted while away)
 */
export function armyRenownPerSec(s: GameState): number {
  const facing = currentMonster(s)
  return armyDps(s) * (facing.bounty / facing.hp)
}

// =============================================================================
// THE READOUT: can the army hold the Gate while the player is away?
// =============================================================================

/** The toughest monster the horde can send right now (by HP) */
export function toughestInPool(s: Pick<GameState, 'hordeKills'>): MonsterDef {
  const weights = spawnWeights(Math.floor(s.hordeKills))
  return MONSTERS.filter((_, i) => weights[i] > 0).reduce((a, b) => (b.hp > a.hp ? b : a), MONSTERS[0])
}

/** Volleys the army needs to kill this monster from full HP; Infinity if it cannot */
export function armyKillVolleys(s: GameState, monster: MonsterDef): number {
  const volley = armyVolleyNow(s)
  return volley <= 0 ? Infinity : Math.ceil(monster.hp / volley - 1e-9)
}

/**
 * Seconds, on average, for the army alone to kill this monster from full HP; Infinity if it
 * cannot. The volley clock runs on its own, not from the monster's arrival, so the first volley
 * lands half a swing in on average (3s), and each one after a full swing later.
 */
export function armyKillSeconds(s: GameState, monster: MonsterDef): number {
  const volleys = armyKillVolleys(s, monster)
  if (!Number.isFinite(volleys)) return Infinity
  const swing = FIGHTER_SWING_MS / 1000
  return swing / 2 + (volleys - 1) * swing
}

/** Whether the army kills this monster before its first strike on the wall */
export function armyHoldsAgainst(s: GameState, monster: MonsterDef): boolean {
  return armyKillSeconds(s, monster) < WALL_STRIKE_SEC
}

// =============================================================================
// TRAINING AND PROMOTION (the Garrison)
// =============================================================================

/** What the next of this rank costs: trained from a fighter (conscript) or promoted (the rest) */
export function rankCost(s: Pick<GameState, 'soldiersTrained' | 'completedResearch'>, tier: SoldierTier): number {
  const def = SOLDIER_TIERS.find((t) => t.id === tier)!
  const base = getSoldierCost(def, getSoldierCount(s.soldiersTrained, tier))
  return roundInsp(base * (1 - getResearchBonuses(s.completedResearch).soldierCostDiscount))
}

/** The rank a soldier of this rank is made from: a fighter for a conscript, else the rank below */
export function rankBelow(tier: SoldierTier): SoldierTier | 'fighter' {
  const i = SOLDIER_TIERS.findIndex((t) => t.id === tier)
  return i <= 0 ? 'fighter' : SOLDIER_TIERS[i - 1].id
}

export type RankBlock = 'locked' | 'noGarrison' | 'full' | 'nobody' | 'renown' | null

/** Why the next of this rank cannot be made now, or null if it can */
export function rankBlock(s: GameState, tier: SoldierTier): RankBlock {
  const def = SOLDIER_TIERS.find((t) => t.id === tier)!
  if (s.barracksLevel <= 0) return 'noGarrison'
  if (s.barracksLevel < def.unlocksAtBarracksLevel) return 'locked'
  const from = rankBelow(tier)
  // Training a conscript adds a soldier; a promotion keeps the count
  if (from === 'fighter' && getTotalSoldiers(s.soldiers) >= getSoldierCap(s.barracksLevel)) return 'full'
  const available = from === 'fighter' ? s.fighters : getSoldierCount(s.soldiers, from)
  if (available <= 0) return 'nobody'
  if (s.inspiration < rankCost(s, tier)) return 'renown'
  return null
}

/** Train a fighter into a conscript, or promote one from the rank below. Unchanged if blocked. */
export function makeRank(s: GameState, tier: SoldierTier): GameState {
  if (rankBlock(s, tier) !== null) return s
  const cost = rankCost(s, tier)
  const from = rankBelow(tier)
  const key = soldierKey(tier)
  const soldiers = { ...s.soldiers, [key]: s.soldiers[key] + 1 }
  if (from !== 'fighter') soldiers[soldierKey(from)] -= 1
  return {
    ...s,
    inspiration: roundInsp(s.inspiration - cost),
    totalInspirationSpent: roundInsp(s.totalInspirationSpent + cost),
    fighters: from === 'fighter' ? s.fighters - 1 : s.fighters,
    soldiers,
    soldiersTrained: { ...s.soldiersTrained, [key]: s.soldiersTrained[key] + 1 },
    soldiersPromoted: from === 'fighter' ? s.soldiersPromoted : s.soldiersPromoted + 1,
  }
}
