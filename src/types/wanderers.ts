import type { GameState } from './state'
import { isSystemOn } from './systems'
import { getTotalForagers } from './foragers'
import { NEWCOMER_FOOD_EACH } from './food'

// =============================================================================
// WANDERERS (chapter 4, Strangers at the Gate; reworked 2026-10-26)
// =============================================================================
// People are the scarcest thing in Draconia: every fighter, repairer and gatherer comes out of
// the villagers, and a Breach kills a third of them. Wanderers are how the city grows between
// food events. Owner rulings (2026-10-26): newcomers are fed on arrival (the same rule as
// Refugees at the Gate), one comes every 4-7 minutes of play (twice as often while the city is
// short of idle villagers), and a rare veteran arrives as a fighter.

/** Play seconds between wanderers: the shortest and longest gap */
export const WANDERER_GAP_MIN_SEC = 240
export const WANDERER_GAP_MAX_SEC = 420

/** Below this many idle villagers the city is short-handed, and wanderers come twice as often */
export const SHORT_HANDED_VILLAGERS = 5

export type WandererType = 'lone_wanderer' | 'traveling_couple' | 'small_family' | 'veteran'

export interface WandererEncounter {
  encounterType: WandererType
  /** How many people arrive */
  people: number
  /** A veteran arrives as a fighter, ready for the Gate (no Rally cost) */
  veteran: boolean
  flavorText: string
  /** Food the stores pay when they are taken in (0 for the scripted first wanderer) */
  foodOnArrival: number
}

interface WandererDef {
  type: WandererType
  name: string
  weight: number
  people: number
  veteran: boolean
}

export const WANDERER_TABLE: WandererDef[] = [
  { type: 'lone_wanderer', name: 'Lone Wanderer', weight: 60, people: 1, veteran: false },
  { type: 'traveling_couple', name: 'Traveling Couple', weight: 25, people: 2, veteran: false },
  { type: 'small_family', name: 'Small Family', weight: 10, people: 3, veteran: false },
  { type: 'veteran', name: 'Veteran', weight: 5, people: 1, veteran: true },
]

export function getEncounterName(type: WandererType): string {
  return WANDERER_TABLE.find((w) => w.type === type)?.name ?? 'Wanderer'
}

// =============================================================================
// FLAVOR TEXT: where they were found depends on who is out there (the Gate or the valley)
// =============================================================================

type FlavorContext = 'fighting' | 'foraging' | 'generic'

const FLAVOR_TEXT: Record<WandererType, Record<FlavorContext, string[]>> = {
  lone_wanderer: {
    fighting: [
      'A lone traveler watched the dragon hold the Gate and begs for shelter in Draconia.',
      'Drawn by the roar at the Gate, a wanderer approaches, seeking refuge behind your wall.',
    ],
    foraging: [
      'Out in the valley, your gatherers found a lost wanderer hiding in the brush.',
      "A starving soul stumbled into your gatherers' camp, pleading for a home.",
    ],
    generic: ['A weary traveler has reached the gates of Draconia, seeking shelter.'],
  },
  traveling_couple: {
    fighting: ['A couple fleeing the horde saw your fighters hold the Gate and ask to join Draconia.'],
    foraging: [
      'Your gatherers found a couple sheltering in a hollow tree, barely surviving.',
      "A pair of travelers followed your gatherers' trail back up the valley.",
    ],
    generic: ['A traveling couple has arrived, hoping Draconia will keep them safe.'],
  },
  small_family: {
    fighting: ['A small family saw the horde thrown back from the Gate and begs for sanctuary.'],
    foraging: ['Deep in the valley, your gatherers found a starving family hiding in a cave.'],
    generic: ['A small family arrives at your gates, their belongings on their backs.'],
  },
  veteran: {
    fighting: [
      'A battle-scarred veteran watched you fight at the Gate and offers their sword.',
      '"I have never seen a dragon fight like that." A veteran kneels and asks to stand at the Gate.',
    ],
    foraging: ['Your gatherers met a veteran of a fallen city in the valley. They will fight for Draconia.'],
    generic: ['A veteran arrives with sword and shield, asking only for a place at the Gate.'],
  },
}

function flavorContext(s: Pick<GameState, 'fighters' | 'foragers'>): FlavorContext {
  const gatherers = getTotalForagers(s.foragers)
  if (gatherers > 0 && gatherers >= s.fighters) return 'foraging'
  if (s.fighters > 0) return 'fighting'
  return 'generic'
}

function pickFlavor(type: WandererType, s: Pick<GameState, 'fighters' | 'foragers'>, rand: () => number): string {
  const pool = FLAVOR_TEXT[type][flavorContext(s)]
  return pool[Math.min(pool.length - 1, Math.floor(rand() * pool.length))]
}

// =============================================================================
// ARRIVALS
// =============================================================================

function encounterFrom(def: WandererDef, s: Pick<GameState, 'fighters' | 'foragers'>, rand: () => number): WandererEncounter {
  return {
    encounterType: def.type,
    people: def.people,
    veteran: def.veteran,
    flavorText: pickFlavor(def.type, s, rand),
    foodOnArrival: def.people * NEWCOMER_FOOD_EACH,
  }
}

/** Who arrives, from the weighted table */
export function rollWandererEncounter(s: Pick<GameState, 'fighters' | 'foragers'>, rand: () => number): WandererEncounter {
  const total = WANDERER_TABLE.reduce((sum, w) => sum + w.weight, 0)
  let roll = rand() * total
  const def = WANDERER_TABLE.find((w) => (roll -= w.weight) < 0) ?? WANDERER_TABLE[0]
  return encounterFrom(def, s, rand)
}

/** The scripted first arrival after strangers_at_gate: one wanderer, fed from Mirael's own rations */
export function makeLoneWanderer(s: Pick<GameState, 'fighters' | 'foragers'>, rand: () => number = Math.random): WandererEncounter {
  return { ...encounterFrom(WANDERER_TABLE[0], s, rand), foodOnArrival: 0 }
}

/** Play seconds until the next wanderer: 4-7 minutes, halved while the city is short-handed */
export function wandererGap(s: Pick<GameState, 'villagers'>, rand: () => number): number {
  const gap = WANDERER_GAP_MIN_SEC + rand() * (WANDERER_GAP_MAX_SEC - WANDERER_GAP_MIN_SEC)
  return Math.round(s.villagers < SHORT_HANDED_VILLAGERS ? gap / 2 : gap)
}

/**
 * One second of play (once the Wanderers system is on): schedule the next wanderer, and bring it
 * when its time comes. Never while one is still waiting for an answer; the next is scheduled
 * after the answer. Play time only, so nobody arrives while the app is closed.
 */
export function stepWanderers(s: GameState, rand: () => number): GameState {
  if (!isSystemOn(s, 'wanderers') || s.pendingWanderer) return s
  if (s.nextWandererAt <= 0) return { ...s, nextWandererAt: s.playSeconds + wandererGap(s, rand) }
  if (s.playSeconds < s.nextWandererAt) return s
  return { ...s, pendingWanderer: rollWandererEncounter(s, rand), nextWandererAt: 0 }
}

// =============================================================================
// THE ANSWER
// =============================================================================

/** Whether the stores can feed the waiting newcomers */
export function canWelcome(s: Pick<GameState, 'pendingWanderer' | 'food'>): boolean {
  return s.pendingWanderer !== null && s.food >= s.pendingWanderer.foodOnArrival
}

/** Take them in: the stores feed them, and they join as villagers (or a veteran as a fighter) */
export function welcomeWanderer(s: GameState): GameState {
  const e = s.pendingWanderer
  if (!e || !canWelcome(s)) return s
  return {
    ...s,
    pendingWanderer: null,
    food: s.food - e.foodOnArrival,
    villagers: e.veteran ? s.villagers : s.villagers + e.people,
    fighters: e.veteran ? s.fighters + e.people : s.fighters,
    wanderersWelcomed: s.wanderersWelcomed + e.people,
  }
}

/** Turn them away: they move on down the road */
export function turnAwayWanderer(s: GameState): GameState {
  return s.pendingWanderer ? { ...s, pendingWanderer: null } : s
}
