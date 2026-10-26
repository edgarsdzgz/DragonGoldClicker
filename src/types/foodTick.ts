import type { GameState } from './state'
import type { SoldierCounts } from './soldiers'
import type { ForagerCounts } from './foragers'
import {
  FOOD_CHECK_INTERVAL,
  GRANARY_CAP,
  PROFESSIONAL_STARVATION_CHANCE,
  getFoodConsumption,
} from './food'
import type { StarvationResult } from './food'
import { getResearchBonuses } from './research'
import { getAutoFoodRate } from './foragers'
import { rationDef } from './rations'
import { gatherMultiplier } from './foodEvents'

// =============================================================================
// FOOD CHECK (decided from the latest state, applied by a pure updater)
// =============================================================================

/** What one food-timer second changes. Applied as deltas so concurrent updates survive. */
export interface FoodTick {
  /** New value of foodTimer (0 right after a check fires) */
  timer: number
  consumed: number
  villagersLost: number
  soldiersLost: SoldierCounts
  foragersLost: ForagerCounts
  explorersLost: number
  fightersLost: number
  repairersLost: number
}

export interface FoodTickResult {
  tick: FoodTick
  /** Warning level after this check, or null when no check fired this second */
  warning: 0 | 3 | 1 | null
  /** Who starved, or null when nobody did */
  report: StarvationResult | null
}

/** Food one check would eat from the current stores (after research reductions) */
export function foodPerCheck(s: GameState): number {
  return Math.min(s.food, mealCost(s))
}

/** What one meal costs: the army (fighters at their ration), after research, rounded up */
export function mealCost(s: GameState): number {
  // Rations scale what the army eats, fighters and soldiers alike (none: they eat nothing)
  const upkeep = rationDef(s.ration).upkeep
  const fighters = s.fighters * upkeep
  const soldiers = {
    conscripts: s.soldiers.conscripts * upkeep,
    footmen: s.soldiers.footmen * upkeep,
    knights: s.soldiers.knights * upkeep,
  }
  const base = getFoodConsumption(s.villagers, soldiers, s.foragers, s.explorers, fighters, s.repairers)
  const rb = getResearchBonuses(s.completedResearch)
  return Math.max(0, Math.ceil(base * (1 - rb.foodConsumptionReduction)))
}

export interface MealBalance {
  /** Eaten at each meal */
  eaten: number
  /** Brought in by foragers between two meals */
  gathered: number
  /** gathered - eaten: below zero, the stores shrink */
  net: number
}

export type StoresOutlook =
  | { kind: 'full' }
  | { kind: 'growing'; perMeal: number }
  | { kind: 'steady' }
  | { kind: 'shrinking'; minutes: number }
  | { kind: 'emptyNextMeal' }

/** Where the stores are heading: a horizon the player can plan around (layer 3) */
export function storesOutlook(s: GameState): StoresOutlook {
  const { eaten, gathered, net } = mealBalance(s)
  // Foragers keep bringing food in until the bell, so count that against the meal
  if (eaten > 0 && s.food + gathered < eaten) return { kind: 'emptyNextMeal' }
  if (net < -0.05) {
    const meals = s.food / -net
    return { kind: 'shrinking', minutes: Math.max(1, Math.round((meals * FOOD_CHECK_INTERVAL) / 60)) }
  }
  if (s.food >= GRANARY_CAP) return { kind: 'full' }
  if (net > 0.05) return { kind: 'growing', perMeal: net }
  return { kind: 'steady' }
}

/** The stores' balance per meal, from what is eaten and what foragers bring in meanwhile */
export function mealBalance(s: GameState): MealBalance {
  const eaten = mealCost(s)
  // A lean season or a bountiful harvest scales what the gatherers bring in
  const gathered = getAutoFoodRate(s.foragers) * gatherMultiplier(s) * FOOD_CHECK_INTERVAL
  return { eaten, gathered, net: gathered - eaten }
}

const rollLosses = (count: number, chance: number): number => {
  let lost = 0
  for (let i = 0; i < count; i++) if (Math.random() < chance) lost++
  return lost
}

/**
 * One second of the food timer. When the check fires: consume food, work out the
 * warning level, and (only if `starvationOn`) roll deaths when the stores are empty.
 * The only impure input is Math.random for those deaths.
 */
export function resolveFoodTick(prev: GameState, starvationOn: boolean): FoodTickResult {
  const noLoss = {
    villagersLost: 0,
    soldiersLost: { conscripts: 0, footmen: 0, knights: 0 },
    foragersLost: { gatherers: 0, trappers: 0, rangers: 0 },
    explorersLost: 0,
    fightersLost: 0,
    repairersLost: 0,
  }

  const timer = prev.foodTimer + 1
  if (timer < FOOD_CHECK_INTERVAL) {
    return { tick: { timer, consumed: 0, ...noLoss }, warning: null, report: null }
  }

  const consumption = mealCost(prev)
  const consumed = Math.min(prev.food, consumption)
  const newFood = prev.food - consumed

  // Warning level uses the events remaining AFTER this consumption
  const eventsLeft = consumption > 0 ? Math.floor(newFood / consumption) : Infinity
  const warning: 0 | 3 | 1 = eventsLeft <= 1 ? 1 : eventsLeft <= 3 ? 3 : 0

  // Only a meal that went unpaid can starve anyone (with nobody eating from the stores, empty
  // stores harm no one)
  if (newFood !== 0 || !starvationOn || consumed >= consumption) {
    return { tick: { timer: 0, consumed, ...noLoss }, warning, report: null }
  }

  // Layer 3: only the army eats from the stores, so only the army can starve. Villagers and
  // foragers feed themselves.
  const villagersLost = 0
  const soldiersLost = {
    conscripts: rollLosses(prev.soldiers.conscripts, PROFESSIONAL_STARVATION_CHANCE),
    footmen: rollLosses(prev.soldiers.footmen, PROFESSIONAL_STARVATION_CHANCE),
    knights: rollLosses(prev.soldiers.knights, PROFESSIONAL_STARVATION_CHANCE),
  }
  const foragersLost = { gatherers: 0, trappers: 0, rangers: 0 }
  const explorersLost = rollLosses(prev.explorers, PROFESSIONAL_STARVATION_CHANCE)
  const fightersLost = rollLosses(prev.fighters, PROFESSIONAL_STARVATION_CHANCE)
  const repairersLost = rollLosses(prev.repairers, PROFESSIONAL_STARVATION_CHANCE)

  const totalProfLost = soldiersLost.conscripts + soldiersLost.footmen + soldiersLost.knights +
    foragersLost.gatherers + foragersLost.trappers + foragersLost.rangers +
    explorersLost + fightersLost + repairersLost

  return {
    tick: { timer: 0, consumed, villagersLost, soldiersLost, foragersLost, explorersLost, fightersLost, repairersLost },
    warning,
    report: villagersLost > 0 || totalProfLost > 0
      ? { villagersLost, soldiersLost, foragersLost, explorersLost, fightersLost, repairersLost }
      : null,
  }
}

/** Pure: apply a resolved food tick to any state */
export function applyFoodTick(cur: GameState, t: FoodTick): GameState {
  const sub = (have: number, lost: number) => Math.max(0, have - lost)
  return {
    ...cur,
    foodTimer: t.timer,
    food: sub(cur.food, t.consumed),
    villagers: sub(cur.villagers, t.villagersLost),
    villagersLost: cur.villagersLost + t.villagersLost,
    soldiers: {
      conscripts: sub(cur.soldiers.conscripts, t.soldiersLost.conscripts),
      footmen: sub(cur.soldiers.footmen, t.soldiersLost.footmen),
      knights: sub(cur.soldiers.knights, t.soldiersLost.knights),
    },
    foragers: {
      gatherers: sub(cur.foragers.gatherers, t.foragersLost.gatherers),
      trappers: sub(cur.foragers.trappers, t.foragersLost.trappers),
      rangers: sub(cur.foragers.rangers, t.foragersLost.rangers),
    },
    explorers: sub(cur.explorers, t.explorersLost),
    fighters: sub(cur.fighters, t.fightersLost),
    repairers: sub(cur.repairers, t.repairersLost),
  }
}

/**
 * One food-timer second as a pure function of `prev`. The pop-up payloads (warning,
 * starvation report) are part of the returned state, so the decision and its result
 * commit together even when other updates were queued in the same frame.
 */
export function stepFood(prev: GameState, starvationOn: boolean): GameState {
  const { tick, warning, report } = resolveFoodTick(prev, starvationOn)
  const next = applyFoodTick(prev, tick)
  if (warning === null) return next
  return {
    ...next,
    lastFoodWarning: warning,
    // Only pop up when the warning escalates, not on every check
    pendingFoodWarning: warning > 0 && warning !== prev.lastFoodWarning ? warning : next.pendingFoodWarning,
    pendingStarvationReport: report ?? next.pendingStarvationReport,
  }
}
