import type { GameState } from './state'
import type { ScriptedEventId } from './story'
import { STORY_BEATS } from './story'
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

/**
 * Events with an immediate state change, made when the scene closes. Returns null when the
 * event could not happen yet (so it is not recorded and can be retried).
 * Events with no immediate effect are NOT here: `firstExpedition` is recorded when the first
 * expedition is claimed, `offlineFraming` when the framed offline report is collected.
 */
const EFFECTS: Partial<Record<ScriptedEventId, (s: GameState) => GameState | null>> = {
  breachHit: (s) => applyCityDamage(s, BREACH_DAMAGE),
  firstMeal: (s) => ({ ...s, foodTimer: FOOD_CHECK_INTERVAL - FIRST_MEAL_DELAY_SEC }),
  loneWanderer: (s) =>
    s.pendingWanderer
      ? null
      : { ...s, pendingWanderer: makeLoneWanderer(getTotalSoldiers(s.soldiers), getTotalForagers(s.foragers)) },
}

/** Whether a scripted event does something the moment its scene closes */
export const hasImmediateEffect = (id: ScriptedEventId): boolean => id in EFFECTS

/** Run a scripted event once and record it. Does nothing (and records nothing) for events without an immediate effect or that cannot happen yet. */
export function runScripted(s: GameState, id: ScriptedEventId): GameState {
  if (hasRun(s, id)) return s
  const next = EFFECTS[id]?.(s)
  return next ? markScripted(next, id) : s
}

/**
 * On load: run any immediate-effect event whose beat was seen but never recorded (the app was
 * killed while its scene was open). State change only; no shake, haptics or navigation.
 */
export function catchUpScripted(s: GameState): GameState {
  return STORY_BEATS.reduce((acc, beat) => {
    const id = beat.scripted
    return id && acc.beatsSeen.includes(beat.id) && hasImmediateEffect(id) ? runScripted(acc, id) : acc
  }, s)
}

/** The first expedition ever claimed always rescues at least 1 villager */
export function firstExpeditionReward(s: GameState, rolled: number): { found: number; state: GameState } {
  if (hasRun(s, 'firstExpedition')) return { found: rolled, state: s }
  return { found: Math.max(1, rolled), state: markScripted(s, 'firstExpedition') }
}
