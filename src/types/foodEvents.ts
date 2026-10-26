import type { GameState } from './state'
import { isSystemOn } from './systems'
import { FOOD_CHECK_INTERVAL } from './food'
import { MONSTERS } from './monsterRoster'
import { pickNextMonster } from './spawnPool'

// =============================================================================
// FOOD EVENTS (core-tap layer 3, phase C): pressure in waves, calm in between
// =============================================================================
// Owner ruling (2026-10-26): four events. Once the stores have been filled by hand, one comes every
// 10-15 minutes of play. Timed ones are announced a meal ahead so the player can prepare.
// - Lean Season: gatherers bring in half for 3 meals.
// - Bountiful Harvest: gatherers bring in double for 3 meals (the relief).
// - Raid on the Stores: a raider comes to the gate. Kill it within 30s, or it steals 20% of the stores.
// - Refugees at the Gate: take 3-5 in (more villagers, fed on arrival from the stores) or turn them away.
// Timers run on play time (game seconds), so events pause while the app is closed.

export type FoodEventId = 'lean_season' | 'bountiful_harvest' | 'raid' | 'refugees'

export interface FoodEventState {
  id: FoodEventId
  /** Warned (coming, a meal from now), active, or waiting on the player's choice (refugees) */
  phase: 'warned' | 'active' | 'choice'
  /** Play second at which this phase ends (unused while waiting on a choice) */
  until: number
  /** Refugees only: how many are at the gate */
  refugees?: number
}

export const EVENT_GAP_MIN = 600
export const EVENT_GAP_MAX = 900
/** Timed events are announced one meal ahead */
export const EVENT_WARNING_SEC = FOOD_CHECK_INTERVAL
/** Lean Season and Bountiful Harvest last three meals */
export const SEASON_SEC = 3 * FOOD_CHECK_INTERVAL
export const LEAN_MULTIPLIER = 0.5
export const HARVEST_MULTIPLIER = 2
/** The raider must die within this many seconds of reaching the gate */
export const RAID_SEC = 30
/** Share of the stores a raider escapes with */
export const RAID_STEAL = 0.2
export const REFUGEES_MIN = 3
export const REFUGEES_MAX = 5
/** Food each refugee eats on arrival (they come in starving) */
export const REFUGEE_FOOD_EACH = 10

export const RAIDER_INDEX = MONSTERS.findIndex((m) => m.id === 'raider')

export const FOOD_EVENT_LABEL: Record<FoodEventId, string> = {
  lean_season: 'Lean Season',
  bountiful_harvest: 'Bountiful Harvest',
  raid: 'Raid on the Stores',
  refugees: 'Refugees at the Gate',
}

/** Events begin once the food chapter is over: hunger on and the stores filled by hand */
export function foodEventsOn(s: GameState): boolean {
  return isSystemOn(s, 'hunger') && s.questsDone.includes('fill_the_stores')
}

/** How much the gatherers bring in, scaled by a season under way */
export function gatherMultiplier(s: Pick<GameState, 'foodEvent'>): number {
  const e = s.foodEvent
  if (!e || e.phase !== 'active') return 1
  if (e.id === 'lean_season') return LEAN_MULTIPLIER
  if (e.id === 'bountiful_harvest') return HARVEST_MULTIPLIER
  return 1
}

/** A message for the player (the UI shows each new one once, as a toast) */
function note(s: GameState, text: string): GameState {
  return { ...s, foodEventNote: { seq: (s.foodEventNote?.seq ?? 0) + 1, text } }
}

function gap(rand: () => number): number {
  return Math.round(EVENT_GAP_MIN + rand() * (EVENT_GAP_MAX - EVENT_GAP_MIN))
}

/** The event that comes next: never the same one twice in a row, and no raid on empty stores */
export function pickFoodEvent(s: GameState, rand: () => number): FoodEventId {
  const all: FoodEventId[] = ['lean_season', 'bountiful_harvest', 'raid', 'refugees']
  const pool = all.filter((id) => id !== s.lastFoodEventId && !(id === 'raid' && s.food <= 0))
  return pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))]
}

/** Begin an event now (the scheduler, or the Dev panel) */
export function startFoodEvent(s: GameState, id: FoodEventId, rand: () => number): GameState {
  const now = s.playSeconds
  if (id === 'refugees') {
    const refugees = REFUGEES_MIN + Math.floor(rand() * (REFUGEES_MAX - REFUGEES_MIN + 1))
    return note({ ...s, foodEvent: { id, phase: 'choice', until: 0, refugees } }, `${refugees} refugees have reached the gate.`)
  }
  const warned = { ...s, foodEvent: { id, phase: 'warned' as const, until: now + EVENT_WARNING_SEC } }
  if (id === 'lean_season') return note(warned, 'A lean season is coming: in 2 minutes, gatherers will bring in half for 6 minutes. Stock up.')
  if (id === 'bountiful_harvest') return note(warned, 'The valley is ripening: in 2 minutes, gatherers will bring in double for 6 minutes.')
  return note(warned, 'Scouts spot raiders circling the stores. They will reach the gate in 2 minutes.')
}

/** The event is over: clear it and schedule the next */
function endFoodEvent(s: GameState, rand: () => number): GameState {
  if (!s.foodEvent) return s
  return { ...s, foodEvent: null, lastFoodEventId: s.foodEvent.id, nextFoodEventAt: s.playSeconds + gap(rand) }
}

/**
 * One second of play for the food events. Pure apart from `rand` (Math.random in the game).
 * Call it after playSeconds has moved on.
 */
export function stepFoodEvents(s: GameState, rand: () => number): GameState {
  if (!foodEventsOn(s)) return s
  const now = s.playSeconds
  const e = s.foodEvent

  if (!e) {
    if (s.nextFoodEventAt <= 0) return { ...s, nextFoodEventAt: now + gap(rand) }
    if (now < s.nextFoodEventAt) return s
    return startFoodEvent(s, pickFoodEvent(s, rand), rand)
  }

  // The raider died before its time ran out (the field moved on to another monster)
  if (e.id === 'raid' && e.phase === 'active' && s.monsterIndex !== RAIDER_INDEX) {
    return note(endFoodEvent(s, rand), 'Raid repelled! The stores are safe.')
  }

  if (e.phase === 'choice' || now < e.until) return s

  if (e.phase === 'warned') {
    const active = { ...s, foodEvent: { ...e, phase: 'active' as const, until: now + (e.id === 'raid' ? RAID_SEC : SEASON_SEC) } }
    if (e.id === 'raid') {
      // The raider pushes in front of whatever was at the gate
      const raider = MONSTERS[RAIDER_INDEX]
      return note({ ...active, monsterIndex: RAIDER_INDEX, monsterHp: raider.hp }, 'A raider is at the gate! Kill it within 30 seconds.')
    }
    return note(active, e.id === 'lean_season' ? 'The lean season begins.' : 'The harvest is in.')
  }

  // An active event has run its course
  if (e.id === 'raid') {
    const stolen = Math.floor(s.food * RAID_STEAL)
    const escaped = {
      ...s,
      food: s.food - stolen,
      monsterIndex: pickNextMonster(s, rand()),
    }
    const next = { ...escaped, monsterHp: MONSTERS[escaped.monsterIndex].hp }
    return note(endFoodEvent(next, rand), stolen > 0 ? `The raider escaped with ${stolen} food.` : 'The raider escaped, but found nothing to take.')
  }
  return note(endFoodEvent(s, rand), e.id === 'lean_season' ? 'The lean season is over.' : 'The harvest is gathered in.')
}

/** The player's answer to the refugees: take them in (fed from the stores on arrival) or turn them away */
export function answerRefugees(s: GameState, takeIn: boolean, rand: () => number): GameState {
  const e = s.foodEvent
  if (!e || e.id !== 'refugees' || e.phase !== 'choice') return s
  const count = e.refugees ?? 0
  if (!takeIn) return note(endFoodEvent(s, rand), 'The refugees move on down the road.')
  const cost = count * REFUGEE_FOOD_EACH
  if (s.food < cost) return s
  return note(
    endFoodEvent({ ...s, villagers: s.villagers + count, food: s.food - cost }, rand),
    `${count} refugees join Draconia.`,
  )
}

/** One short line for the badge, or null when no event is under way */
export function foodEventStatus(s: GameState): { text: string; tone: 'good' | 'warn' | 'bad' } | null {
  const e = s.foodEvent
  if (!e) return null
  const left = Math.max(0, e.until - s.playSeconds)
  const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
  const tone = e.id === 'bountiful_harvest' ? 'good' : e.id === 'refugees' ? 'warn' : 'bad'
  if (e.phase === 'choice') return { text: `${e.refugees} refugees at the gate`, tone }
  if (e.id === 'raid') return { text: e.phase === 'warned' ? `Raiders coming in ${clock}` : `Raider at the gate: ${left}s`, tone }
  return { text: e.phase === 'warned' ? `${FOOD_EVENT_LABEL[e.id]} in ${clock}` : `${FOOD_EVENT_LABEL[e.id]}: ${clock} left`, tone }
}
