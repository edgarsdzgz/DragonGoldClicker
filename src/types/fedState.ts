import type { GameState } from './state'
import { isSystemOn } from './systems'
import { mealBalance } from './foodTick'
import { rationDef } from './rations'
import type { RationDef } from './rations'
import { FIGHTER_FOOD_COST } from './fighters'
import { formatAmount } from './state'

// =============================================================================
// FED STATES (core-tap layer 3.3): how full stores, or empty ones, change the fighters
// =============================================================================
// Measured in meals held in the stores. Rations (types/rations.ts) apply first, then this.

export type FedState = 'well_fed' | 'fed' | 'hungry' | 'starving'

/** Stores holding this many meals of upkeep keep the fighters well fed */
export const WELL_FED_MEALS = 10

/** The fighters' damage in each state */
export const FED_DAMAGE: Record<FedState, number> = {
  well_fed: 1.1,
  fed: 1,
  hungry: 0.5,
  starving: 0,
}

/**
 * Where the stores leave the army. Without hunger, or with nothing eating from the stores (no
 * army, or no rations), the army is simply fed.
 */
export function fedState(s: GameState): FedState {
  if (!isSystemOn(s, 'hunger')) return 'fed'
  const { eaten, gathered } = mealBalance(s)
  if (eaten <= 0) return 'fed'
  if (s.food <= 0) return 'starving'
  // Foragers keep bringing food in until the bell, so count that against the meal
  if (s.food + gathered < eaten) return 'hungry'
  if (s.food >= WELL_FED_MEALS * eaten) return 'well_fed'
  return 'fed'
}

/** The fighters' damage multiplier: their ration, then how fed they are */
export function fighterDamageMultiplier(s: GameState): number {
  const ration = rationDef(s.ration).damage
  if (ration <= 0) return 0
  return ration * FED_DAMAGE[fedState(s)]
}

export interface FighterStatus {
  text: string
  tone: 'good' | 'warn' | 'bad'
}

/** One line on how the fighters are doing, or null when there is nothing to say */
export function fighterStatus(s: GameState): FighterStatus | null {
  if (s.fighters <= 0) return null
  const ration = rationDef(s.ration)
  if (ration.damage <= 0) return { text: 'Fighters stand down (no rations): they still guard the wall', tone: 'warn' }
  const state = fedState(s)
  if (state === 'starving') return { text: 'Starving: fighters stand down', tone: 'bad' }
  const pct = Math.round(fighterDamageMultiplier(s) * 100)
  if (state === 'hungry') return { text: `Hungry: fighters at ${pct}%`, tone: 'bad' }
  if (state === 'well_fed') return { text: `Well fed: fighters at ${pct}%`, tone: 'good' }
  if (ration.id !== 'full') return { text: `${ration.label} rations: fighters at ${pct}%`, tone: ration.damage > 1 ? 'good' : 'warn' }
  return null
}

/** What a ration does, in one line */
export function rationEffectText(r: RationDef): string {
  if (r.damage <= 0) return 'Fighters stand down: they eat nothing and do not fight, but still guard the wall.'
  // Full stores add to the ration (types/fedState.ts), so say both: the badge may read 110%
  const wellFed = Math.round(r.damage * FED_DAMAGE.well_fed * 100)
  return `Each fighter eats ${formatAmount(FIGHTER_FOOD_COST * r.upkeep)} per meal and hits at ${Math.round(r.damage * 100)}% (${wellFed}% when well fed).`
}
