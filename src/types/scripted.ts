import type { GameState } from './state'
import type { ScriptedEventId } from './story'
import { applyCityDamage } from './cityHp'
import { FOOD_CHECK_INTERVAL } from './food'
import { makeLoneWanderer } from './wanderers'
import { getTotalSoldiers } from './soldiers'
import { getTotalForagers } from './foragers'

// =============================================================================
// SCRIPTED FIRST OCCURRENCES (pure; each runs once, when its beat's scene is closed)
// =============================================================================

/** The one fixed hit of the breach */
export const BREACH_DAMAGE = 15

/** Game seconds between the empty_stores scene closing and the first food check */
export const FIRST_MEAL_DELAY_SEC = 10

export const hasRun = (s: GameState, id: ScriptedEventId): boolean => (s.scriptedDone ?? []).includes(id)

export function markScripted(s: GameState, id: ScriptedEventId): GameState {
  return hasRun(s, id) ? s : { ...s, scriptedDone: [...(s.scriptedDone ?? []), id] }
}

/** Events whose effect is a state change made right when the scene closes */
const EFFECTS: Partial<Record<ScriptedEventId, (s: GameState) => GameState>> = {
  breachHit: (s) => applyCityDamage(s, BREACH_DAMAGE),
  firstMeal: (s) => ({ ...s, foodTimer: FOOD_CHECK_INTERVAL - FIRST_MEAL_DELAY_SEC }),
  loneWanderer: (s) =>
    s.pendingWanderer
      ? s
      : { ...s, pendingWanderer: makeLoneWanderer(getTotalSoldiers(s.soldiers), getTotalForagers(s.foragers)) },
}

/** Run a scripted event once. A second call, or an event with no state effect, only records it. */
export function runScripted(s: GameState, id: ScriptedEventId): GameState {
  if (hasRun(s, id)) return s
  return markScripted(EFFECTS[id]?.(s) ?? s, id)
}

/** The first expedition ever claimed always rescues at least 1 villager */
export function firstExpeditionReward(s: GameState, rolled: number): { found: number; state: GameState } {
  if (hasRun(s, 'firstExpedition')) return { found: rolled, state: s }
  return { found: Math.max(1, rolled), state: markScripted(s, 'firstExpedition') }
}
