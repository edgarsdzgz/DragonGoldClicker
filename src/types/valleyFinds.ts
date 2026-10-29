import type { GameState } from './state'
import { granaryRoom } from './food'

// =============================================================================
// VALLEY FINDS: foraging stirs things up around the FORAGE orb. A find shows for a moment, and
// tapping it in time pays bonus food. Missing one costs nothing (owner ruling, 2026-10-29).
// =============================================================================

export type FindKind = 'rabbit' | 'berries' | 'fish' | 'honey'

export interface FindDef {
  kind: FindKind
  /** How a screen reader names it */
  label: string
  /** Taps to take it */
  taps: number
  /** Food per tap, before the forage yield */
  foodPerTap: number
  /** How long it shows, in ms */
  showMs: number
  /** Chance weight among the kinds */
  weight: number
}

export const FIND_KINDS: readonly FindDef[] = [
  { kind: 'rabbit', label: 'A rabbit in the grass', taps: 1, foodPerTap: 10, showMs: 2000, weight: 40 },
  { kind: 'berries', label: 'A bush heavy with berries', taps: 3, foodPerTap: 5, showMs: 2500, weight: 35 },
  { kind: 'fish', label: 'A fish leaping from the stream', taps: 1, foodPerTap: 15, showMs: 1200, weight: 15 },
  { kind: 'honey', label: 'A wild honeycomb', taps: 5, foodPerTap: 5, showMs: 3000, weight: 10 },
]

/** The lifetime forage tap on which the first find appears (always a rabbit) */
export const FIRST_FIND_TAP = 5
/** After that, a find comes every FIND_GAP_MIN to FIND_GAP_MAX forage taps */
export const FIND_GAP_MIN = 8
export const FIND_GAP_MAX = 12

/** Reduce Motion keeps a find on screen this many times longer, and a screen reader more still */
export const REDUCE_MOTION_TIME = 1.5
export const SCREEN_READER_TIME = 3

/** The line over the orb on the first find */
export const FIRST_FIND_HINT = 'Something moves in the grass. Tap it!'

export function findDef(kind: FindKind): FindDef {
  return FIND_KINDS.find((f) => f.kind === kind) ?? FIND_KINDS[0]
}

/** Taps until the next find, for `rand` in [0, 1) */
export function findGap(rand: number): number {
  return Math.min(FIND_GAP_MAX, FIND_GAP_MIN + Math.floor(rand * (FIND_GAP_MAX - FIND_GAP_MIN + 1)))
}

/** The kind a roll in [0, 1) picks, by weight */
export function pickFind(rand: number): FindDef {
  const total = FIND_KINDS.reduce((sum, f) => sum + f.weight, 0)
  const target = rand * total
  let edge = 0
  for (const def of FIND_KINDS) {
    edge += def.weight
    if (target < edge) return def
  }
  return FIND_KINDS[FIND_KINDS.length - 1]
}

/** Whether the tap that took the lifetime count from `before` to `after` is the one that brings the first find */
export function isFirstFind(before: number, after: number): boolean {
  return before < FIRST_FIND_TAP && after >= FIRST_FIND_TAP
}

/** Taps left on the countdown after `taps` more (never below 0) */
export function advanceGap(remaining: number, taps: number): number {
  return Math.max(0, remaining - taps)
}

/** Food one tap on a find pays, scaled by the forage yield */
export function findPay(def: FindDef, forageYield: number): number {
  return Math.max(1, Math.round(def.foodPerTap * forageYield))
}

/** How long a find shows, in ms: longer for Reduce Motion, longest for a screen reader */
export function findShowMs(def: FindDef, reduceMotion: boolean, screenReader: boolean): number {
  const scale = screenReader ? SCREEN_READER_TIME : reduceMotion ? REDUCE_MOTION_TIME : 1
  return Math.round(def.showMs * scale)
}

/** The accessibility label for a find with `tapsLeft` taps to go, each paying `pay` food */
export function findLabel(def: FindDef, tapsLeft: number, pay: number): string {
  if (tapsLeft <= 1) return `${def.label}. Tap to catch, ${pay} food`
  return `${def.label}. Tap ${tapsLeft} times to gather, ${pay} food each`
}

/** The food from a find tap goes to the stores like a forage tap, but is not a forage trip itself */
export function applyFind(s: GameState, food: number): GameState {
  const added = granaryRoom(s.food, food)
  if (added <= 0) return s
  return {
    ...s,
    food: s.food + added,
    totalFoodForaged: s.totalFoodForaged + added,
    foodGatheredByHand: s.foodGatheredByHand + added,
  }
}

// -----------------------------------------------------------------------------
// Where a find sits: a spot around the orb, never on it and never on the flavor line
// -----------------------------------------------------------------------------

export interface FindSpot {
  x: number
  y: number
}

/** A find's touch box, in dp (at least the 48 dp target) */
export const FIND_SIZE = 56
const SPOT_EDGE = 8
/** Clear space kept between a find and the orb, so a miss-tap does not land on the other */
const SPOT_GAP = 12
/** The rabbit drifts this far sideways while it shows, always away from the orb */
export const FIND_DRIFT = 18

function overlaps(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
}

/**
 * The spots a find may take in an area (the stack of flavor line and orb, centered). A grid of
 * nine, minus those that touch the orb or the flavor line.
 */
export function findSpots(width: number, height: number, orbDiameter: number, flavorHeight: number): FindSpot[] {
  const stackTop = (height - (flavorHeight + orbDiameter)) / 2
  const orb = { x: (width - orbDiameter) / 2 - SPOT_GAP, y: stackTop + flavorHeight - SPOT_GAP, w: orbDiameter + SPOT_GAP * 2, h: orbDiameter + SPOT_GAP * 2 }
  const flavor = { x: 0, y: stackTop, w: width, h: flavorHeight }
  // The side columns leave room for the rabbit's drift toward the edge
  const xs = [SPOT_EDGE + FIND_DRIFT, (width - FIND_SIZE) / 2, width - FIND_SIZE - SPOT_EDGE - FIND_DRIFT]
  const ys = [SPOT_EDGE, orb.y + orb.h / 2 - FIND_SIZE / 2, height - FIND_SIZE - SPOT_EDGE]
  const spots: FindSpot[] = []
  for (const y of ys) {
    for (const x of xs) {
      const box = { x, y, w: FIND_SIZE, h: FIND_SIZE }
      if (x < 0 || y < 0 || x + FIND_SIZE > width || y + FIND_SIZE > height) continue
      if (overlaps(box, orb) || overlaps(box, flavor)) continue
      spots.push({ x, y })
    }
  }
  return spots
}

/** One spot for a roll in [0, 1), or null when the area has no room */
export function pickSpot(spots: readonly FindSpot[], rand: number): FindSpot | null {
  if (spots.length === 0) return null
  return spots[Math.min(spots.length - 1, Math.floor(rand * spots.length))]
}

/** Which way a drifting find moves from its spot: away from the middle, so never onto the orb */
export function driftDirection(spot: FindSpot, width: number): -1 | 1 {
  return spot.x + FIND_SIZE / 2 < width / 2 ? -1 : 1
}
