import type { SoldierCounts } from './soldiers'
import type { ForagerCounts } from './foragers'
import { FIGHTER_FOOD_COST, REPAIRER_FOOD_COST } from './fighters'

// =============================================================================
// FOOD & POPULATION
// =============================================================================

/** Food each newcomer eats from the stores on arrival: refugees and wanderers alike */
export const NEWCOMER_FOOD_EACH = 10

export const STARTING_FOOD = 200
export const STARTING_VILLAGERS = 25

/** Conscripts trained before food system activates */
export const FOOD_ACTIVATE_CONSCRIPTS = 4

/** Buildings purchased before food system activates */
export const FOOD_ACTIVATE_BUILDINGS = 2

/**
 * Seconds between meals. Owner ruling (2026-10-26, core-tap layer 3): the meal bell rings every
 * 2 minutes (was 30s), so food pressure is felt without a constant drain.
 */
export const FOOD_CHECK_INTERVAL = 120

/**
 * Food each unit eats from the stores per meal. Owner ruling (layer 3): only the army eats from
 * the stores; villagers and foragers feed themselves (foragers' output is already net).
 * Fighters and repairers are in fighters.ts.
 */
export const FOOD_CONSUMPTION: Record<string, number> = {
  villager: 0,
  gatherer: 0,
  trapper: 0,
  ranger: 0,
  conscript: 4,
  footman: 6,
  knight: 10,
  explorer: 2,
}

/** The granary holds at most this much food (buildings raise it later) */
export const GRANARY_CAP = 500

/** How much of `amount` fits in the granary: food above the cap is lost (never negative) */
export function granaryRoom(food: number, amount: number): number {
  return Math.max(0, Math.min(amount, GRANARY_CAP - food))
}

/** Chance (0-1) each idle villager dies per food check when food is 0 */
export const STARVATION_DEATH_CHANCE = 0.1

/** Chance (0-1) each professional (soldier/forager/explorer) dies per food check when food is 0 */
export const PROFESSIONAL_STARVATION_CHANCE = 0.03

/**
 * Total food consumed per food check for current population.
 */
export function getFoodConsumption(
  villagers: number,
  soldiers: SoldierCounts,
  foragers: ForagerCounts = { gatherers: 0, trappers: 0, rangers: 0 },
  explorers: number = 0,
  fighters: number = 0,
  repairers: number = 0,
): number {
  return (
    villagers * FOOD_CONSUMPTION.villager +
    foragers.gatherers * FOOD_CONSUMPTION.gatherer +
    foragers.trappers * FOOD_CONSUMPTION.trapper +
    foragers.rangers * FOOD_CONSUMPTION.ranger +
    soldiers.conscripts * FOOD_CONSUMPTION.conscript +
    soldiers.footmen * FOOD_CONSUMPTION.footman +
    soldiers.knights * FOOD_CONSUMPTION.knight +
    explorers * FOOD_CONSUMPTION.explorer +
    fighters * FIGHTER_FOOD_COST +
    repairers * REPAIRER_FOOD_COST
  )
}

/**
 * How many food events remain before food runs out, rounded down.
 * Returns Infinity if no food is consumed.
 */
export function getFoodEventsRemaining(
  food: number,
  villagers: number,
  soldiers: SoldierCounts,
  foragers: ForagerCounts,
  explorers: number,
  fighters: number = 0,
  repairers: number = 0,
): number {
  const consumption = getFoodConsumption(villagers, soldiers, foragers, explorers, fighters, repairers)
  if (consumption <= 0) return Infinity
  return Math.floor(food / consumption)
}

/** Starvation result describing who died in a food check */
export interface StarvationResult {
  villagersLost: number
  soldiersLost: SoldierCounts
  foragersLost: ForagerCounts
  explorersLost: number
  fightersLost: number
  repairersLost: number
}
