import type { GameState } from './state'
import { formatAmount } from './state'
import {
  FOOD_CHECK_INTERVAL,
  GRANARY_CAP,
  getFoodConsumption,
} from './food'
import { getResearchBonuses } from './research'
import { getAutoFoodRate } from './foragers'
import { rationDef } from './rations'
import { gatherMultiplier } from './foodEvents'

// =============================================================================
// FOOD CHECK (decided from the latest state, applied by a pure updater)
// =============================================================================
// An unpaid meal starves no one: the army stands down instead (layer 3, fed states). Starvation
// deaths were retired with `lean_times` (chapter 7, 2026-10-26).

/** What one food-timer second changes. Applied as deltas so concurrent updates survive. */
export interface FoodTick {
  /** New value of foodTimer (0 right after a check fires) */
  timer: number
  consumed: number
}

export interface FoodTickResult {
  tick: FoodTick
  /** Warning level after this check, or null when no check fired this second */
  warning: 0 | 3 | 1 | null
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

/** One second of the food timer. When the check fires: the meal is eaten and the warning set. */
export function resolveFoodTick(prev: GameState): FoodTickResult {
  const timer = prev.foodTimer + 1
  if (timer < FOOD_CHECK_INTERVAL) return { tick: { timer, consumed: 0 }, warning: null }

  const consumption = mealCost(prev)
  const consumed = Math.min(prev.food, consumption)
  const newFood = prev.food - consumed

  // Warning level uses the events remaining AFTER this consumption
  const eventsLeft = consumption > 0 ? Math.floor(newFood / consumption) : Infinity
  const warning: 0 | 3 | 1 = eventsLeft <= 1 ? 1 : eventsLeft <= 3 ? 3 : 0
  return { tick: { timer: 0, consumed }, warning }
}

/** Pure: apply a resolved food tick to any state */
export function applyFoodTick(cur: GameState, t: FoodTick): GameState {
  return { ...cur, foodTimer: t.timer, food: Math.max(0, cur.food - t.consumed) }
}

/**
 * One food-timer second as a pure function of `prev`. The warning pop-up is part of the returned
 * state, so the decision and its result commit together even when other updates were queued.
 */
export function stepFood(prev: GameState): GameState {
  const { tick, warning } = resolveFoodTick(prev)
  const next = applyFoodTick(prev, tick)
  if (warning === null) return next
  return {
    ...next,
    lastFoodWarning: warning,
    // Only pop up when the warning escalates, not on every check
    pendingFoodWarning: warning > 0 && warning !== prev.lastFoodWarning ? warning : next.pendingFoodWarning,
  }
}

/** Stores shrinking but lasting at least this long are a heads-up (amber), not an alarm (red) */
export const STORES_ALARM_MINUTES = 10

export type OutlookTone = 'good' | 'warn' | 'bad'

/** What the stores are heading for, in words, and how worried to be */
export function outlookText(o: StoresOutlook): { text: string; tone: OutlookTone } {
  switch (o.kind) {
    case 'full': return { text: 'Granary full', tone: 'good' }
    case 'growing': return { text: `Stores grow by ${formatAmount(o.perMeal)} each meal`, tone: 'good' }
    case 'steady': return { text: 'Stores hold steady', tone: 'good' }
    case 'shrinking': return { text: `Stores last about ${o.minutes} min`, tone: o.minutes >= STORES_ALARM_MINUTES ? 'warn' : 'bad' }
    case 'emptyNextMeal': return { text: 'Stores run out at the next meal', tone: 'bad' }
  }
}
