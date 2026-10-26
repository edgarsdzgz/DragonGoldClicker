import type { GameState } from './state'
import type { ForagerCounts } from './foragers'
import type { SoldierCounts } from './soldiers'
import { MONSTERS } from './monsterRoster'
import { pickNextMonster } from './spawnPool'
import { hordeLevel, pushedBackHorde } from './horde'
import { roundInsp } from './utils'

// =============================================================================
// THE BREACH (core-tap layer 6, phase B): the wall falls, and Draconia pays to survive it
// =============================================================================
// Owner ruling (2026-10-26): the player never dies or starts over. The people fight in the
// streets and many die; the elders call on the ancient magic of Draconia, which costs the stores
// and the player's renown (it can go negative), and throws the horde back so starting again is
// easy.

/** Share of fighters, each rank of soldiers, repairers and idle villagers who die (at least 1 fighter, if any) */
export const BREACH_PEOPLE_LOSS = 0.3
/** Share of foragers who die: they are out in the valley and run back to help */
export const BREACH_FORAGER_LOSS = 0.15
/** Share of the stores lost */
export const BREACH_FOOD_LOSS = 0.4
/** Renown paid per horde level, after the renown held is halved */
export const BREACH_BLOOD_PRICE = 5
/** The wall's HP once the people have patched it */
export const BREACH_WALL_PATCH = 50
/** Seconds of play the ward holds: no monster strikes the wall */
export const BREACH_WARD_SEC = 90

export interface BreachReport {
  /** Which Breach this was (1 = the first; it plays the full scene) */
  count: number
  fightersLost: number
  /** Soldiers lost by rank (chapter 5); absent in reports saved before it */
  soldiersLost?: SoldierCounts
  repairersLost: number
  villagersLost: number
  foragersLost: ForagerCounts
  foodLost: number
  renownBefore: number
  renownAfter: number
  hordeLevelBefore: number
  hordeLevelAfter: number
}

const share = (n: number, frac: number) => Math.floor(Math.max(0, n) * frac)

const minusSoldiers = (a: SoldierCounts, b: SoldierCounts): SoldierCounts => ({
  conscripts: Math.max(0, a.conscripts - b.conscripts),
  footmen: Math.max(0, a.footmen - b.footmen),
  knights: Math.max(0, a.knights - b.knights),
})

/**
 * The wall has fallen. Applies every loss, the push-back, the patched wall and the ward, and
 * leaves the report for the player (`pendingBreach`). `rand` picks the monster that comes next.
 */
export function resolveBreach(s: GameState, rand: number = Math.random()): GameState {
  const fightersLost = s.fighters > 0 ? Math.max(1, share(s.fighters, BREACH_PEOPLE_LOSS)) : 0
  const soldiersLost: SoldierCounts = {
    conscripts: share(s.soldiers.conscripts, BREACH_PEOPLE_LOSS),
    footmen: share(s.soldiers.footmen, BREACH_PEOPLE_LOSS),
    knights: share(s.soldiers.knights, BREACH_PEOPLE_LOSS),
  }
  const repairersLost = share(s.repairers, BREACH_PEOPLE_LOSS)
  const villagersLost = share(s.villagers, BREACH_PEOPLE_LOSS)
  const foragersLost: ForagerCounts = {
    gatherers: share(s.foragers.gatherers, BREACH_FORAGER_LOSS),
    trappers: share(s.foragers.trappers, BREACH_FORAGER_LOSS),
    rangers: share(s.foragers.rangers, BREACH_FORAGER_LOSS),
  }
  const foodLost = share(s.food, BREACH_FOOD_LOSS)

  const levelBefore = hordeLevel(s.hordeKills)
  // Half of what is held, then the blood price; a debt is not halved, only deepened
  const held = s.inspiration > 0 ? s.inspiration / 2 : s.inspiration
  const renownAfter = roundInsp(held - BREACH_BLOOD_PRICE * levelBefore)
  const hordeKills = pushedBackHorde(s.hordeKills)
  const monsterIndex = pickNextMonster({ hordeKills, killsByMonster: s.killsByMonster }, rand)
  const count = s.breaches + 1

  const report: BreachReport = {
    count,
    fightersLost,
    soldiersLost,
    repairersLost,
    villagersLost,
    foragersLost,
    foodLost,
    renownBefore: s.inspiration,
    renownAfter,
    hordeLevelBefore: levelBefore,
    hordeLevelAfter: hordeLevel(hordeKills),
  }

  const minus = (a: ForagerCounts, b: ForagerCounts): ForagerCounts => ({
    gatherers: Math.max(0, a.gatherers - b.gatherers),
    trappers: Math.max(0, a.trappers - b.trappers),
    rangers: Math.max(0, a.rangers - b.rangers),
  })

  return {
    ...s,
    fighters: s.fighters - fightersLost,
    soldiers: minusSoldiers(s.soldiers, soldiersLost),
    soldiersTrained: minusSoldiers(s.soldiersTrained, soldiersLost),
    repairers: s.repairers - repairersLost,
    villagers: s.villagers - villagersLost,
    foragers: minus(s.foragers, foragersLost),
    // Rebuilding costs what it did: the price curves step back by the people lost
    fightersRallied: Math.max(0, s.fightersRallied - fightersLost),
    repairersDirected: Math.max(0, s.repairersDirected - repairersLost),
    foragersTrained: minus(s.foragersTrained, foragersLost),
    food: s.food - foodLost,
    inspiration: renownAfter,
    hordeKills,
    monsterIndex,
    monsterHp: MONSTERS[monsterIndex].hp,
    siegeTimer: 0,
    cityHp: BREACH_WALL_PATCH,
    repairProgress: 0,
    wardUntil: s.playSeconds + BREACH_WARD_SEC,
    breaches: count,
    pendingBreach: report,
  }
}

/** Seconds of play the ward still holds (0 when it has lapsed) */
export function wardLeft(s: Pick<GameState, 'wardUntil' | 'playSeconds'>): number {
  return Math.max(0, s.wardUntil - s.playSeconds)
}

export interface BreachLine {
  text: string
  /** A loss, or what the magic bought back */
  kind: 'loss' | 'relief'
}

const fell = (n: number, one: string, many: string): BreachLine[] =>
  n > 0 ? [{ text: `${n} ${n === 1 ? one : many} fell`, kind: 'loss' }] : []

/** The report card's lines, losses first, then what the magic bought back */
export function breachLines(r: BreachReport): BreachLine[] {
  return [
    ...fell(r.fightersLost, 'fighter', 'fighters'),
    ...fell(r.soldiersLost?.conscripts ?? 0, 'conscript', 'conscripts'),
    ...fell(r.soldiersLost?.footmen ?? 0, 'footman', 'footmen'),
    ...fell(r.soldiersLost?.knights ?? 0, 'knight', 'knights'),
    ...fell(r.repairersLost, 'repairer', 'repairers'),
    ...fell(r.villagersLost, 'villager', 'villagers'),
    ...fell(r.foragersLost.gatherers, 'gatherer', 'gatherers'),
    ...fell(r.foragersLost.trappers, 'trapper', 'trappers'),
    ...fell(r.foragersLost.rangers, 'ranger', 'rangers'),
    ...(r.foodLost > 0 ? [{ text: `${r.foodLost} food burned`, kind: 'loss' as const }] : []),
    { text: `Renown ${r.renownBefore.toFixed(2)} to ${r.renownAfter.toFixed(2)}`, kind: 'loss' },
    { text: `The horde driven back: level ${r.hordeLevelBefore} to level ${r.hordeLevelAfter}`, kind: 'relief' },
    { text: `The wall patched to ${BREACH_WALL_PATCH}; the ward holds for ${BREACH_WARD_SEC} seconds`, kind: 'relief' },
  ]
}
