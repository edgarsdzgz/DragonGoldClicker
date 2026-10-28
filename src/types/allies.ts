import type { GameState } from './state'
import type { BeatId } from './story'
import { roundInsp } from './utils'

// =============================================================================
// THE NEW CAST'S GIFTS (chapters 9 to 13, approved 2026-10-27; the numbers are provisional)
// =============================================================================
// Each newcomer brings one thing, from their chapter on (types/story.ts): Varn strikes on his own
// from the gatehouse tower, Sera's shield wall softens the monsters' blows on the wall, Thornwick's
// tower makes the army's volley burn hotter once it is built, Ashara's strength is behind every
// tap, and the Hollow Knight holds the gate while the player is away.

const seen = (s: Pick<GameState, 'beatsSeen'>, id: BeatId) => s.beatsSeen.includes(id)

/** Seconds between Varn's breaths of fire at the monster at the gate */
export const VARN_BREATH_SEC = 3

/** One of Varn's breaths deals this many of the player's taps */
export const VARN_BREATH_TAPS = 3

/** Varn perches on the gatehouse tower from chapter 9 */
export function varnOnWall(s: Pick<GameState, 'beatsSeen'>): boolean {
  return seen(s, 'small_wings')
}

/** Sera's shield wall: a monster's blow on the wall lands at this share */
export const SHIELD_WALL = 0.75

/** The share of a blow on the wall that lands: all of it, or less behind Sera's shields (chapter 10) */
export function wallBlowShare(s: Pick<GameState, 'beatsSeen'>): number {
  return seen(s, 'she_did_not_ask') ? SHIELD_WALL : 1
}

/** Renown to raise Thornwick's tower (chapter 11) */
export const WIZARD_TOWER_COST = 1200

/** Thornwick's fire: the army's volley deals this much more once his tower stands */
export const TOWER_FIRE_BONUS = 0.25

export function towerFireBonus(s: Pick<GameState, 'wizardTowerBuilt'>): number {
  return s.wizardTowerBuilt ? TOWER_FIRE_BONUS : 0
}

/** Raise the Wizard's Tower. Unchanged if it stands or renown is short. */
export function buildWizardTower(s: GameState): GameState {
  if (s.wizardTowerBuilt || s.inspiration < WIZARD_TOWER_COST) return s
  return {
    ...s,
    inspiration: roundInsp(s.inspiration - WIZARD_TOWER_COST),
    totalInspirationSpent: roundInsp(s.totalInspirationSpent + WIZARD_TOWER_COST),
    wizardTowerBuilt: true,
  }
}

/** Ashara's strength behind yours: a tap deals this much more from chapter 12 */
export const ASHARA_TAP_BONUS = 0.25

export function asharaTapBonus(s: Pick<GameState, 'beatsSeen'>): number {
  return seen(s, 'the_eldest') ? ASHARA_TAP_BONUS : 0
}

/** The Hollow Knight holds the gate: renown earned while away counts this much more from chapter 13 */
export const HOLLOW_KNIGHT_AWAY_BONUS = 0.5

export function hollowKnightAwayBonus(s: Pick<GameState, 'beatsSeen'>): number {
  return seen(s, 'hollow_knight') ? HOLLOW_KNIGHT_AWAY_BONUS : 0
}
