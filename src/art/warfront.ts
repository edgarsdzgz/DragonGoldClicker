import { MAP_GATE, SPRITES } from './manifest'
import type { SpriteId } from './manifest'
import type { ClawTier } from '../types/claws'

// =============================================================================
// THE WARFRONT'S ART: the map's scale, the gate by the wall's HP, each monster's sprites
// =============================================================================

/** The Warfront map's native width, in art pixels */
export const MAP_W = 130
/** Monsters stand at double the map's scale, so the one you strike reads clearly */
export const MOB_SCALE = 2

/**
 * Points per map pixel: the map spans the screen's width at the nearest whole number of screen
 * pixels per art pixel (the A16: 1080 px / 130 = 8.3, so 8, leaving a thin margin each side;
 * rounding up crops the map's dark edges instead).
 */
export function mapUnit(widthPts: number, pixelRatio: number): number {
  return Math.max(1, Math.round((widthPts * pixelRatio) / MAP_W)) / pixelRatio
}

export type GateState = (typeof MAP_GATE.gate.states)[number]

/** The gate's look by the wall's HP: sound above two thirds, cracking above a third, then failing, then breached */
export function gateState(hp: number, max: number): GateState {
  if (hp <= 0) return 'breached'
  if (hp * 3 > max * 2) return 'sound'
  if (hp * 3 > max) return 'cracking'
  return 'failing'
}

/** The sprite id of a gate state */
export function gateSprite(state: GateState): SpriteId {
  return `map_gate_${state}` as SpriteId
}

/**
 * Points per art pixel for a monster: MOB_SCALE times the map's, but never taller or wider than
 * its box (a short window shrinks the box), always at whole screen pixels.
 */
export function mobScale(unit: number, boxPts: number, artPx: number, pixelRatio: number): number {
  const fit = Math.max(1, Math.floor((boxPts / artPx) * pixelRatio)) / pixelRatio
  return Math.min(unit * MOB_SCALE, fit)
}

/** A monster's sprites: walking (its idle), struck, and wounded */
export interface MobSprites {
  idle: SpriteId
  hit: SpriteId
  hurt: SpriteId
}

/** Monster ids whose art is named differently */
const MOB_NAMES: Record<string, string> = { shadow_crawler: 'crawler' }

/** A monster's pixel sprites, or null while it has none (it keeps its old look) */
export function mobSprites(monsterId: string): MobSprites | null {
  const name = MOB_NAMES[monsterId] ?? monsterId
  const ids = { idle: `mob_${name}_walk_anim`, hit: `mob_${name}_hit`, hurt: `mob_${name}_hurt` }
  const all = Object.values(ids).every((id) => Object.prototype.hasOwnProperty.call(SPRITES, id))
  return all ? (ids as MobSprites) : null
}

/**
 * A monster's death: it buckles, falls, lands and is unmade (4 frames), or null while it has none.
 * The strip is wider than the walk by the same margin on each side, so its feet stay put.
 */
export function mobDeathSprite(monsterId: string): SpriteId | null {
  const id = `mob_${MOB_NAMES[monsterId] ?? monsterId}_death_anim`
  return Object.prototype.hasOwnProperty.call(SPRITES, id) ? (id as SpriteId) : null
}

// A kill, in order: the death plays (stripMs of the death), its last frame holds, then it blinks out.
// The next monster starts walking up the road during the last frame and arrives as the blink ends.
/** The death's last frame holds this long before the blink */
export const DEATH_HOLD_MS = 100
/** The blink: the body is off, on, off, on, off, each step this long */
export const BLINK_STEP_MS = 70
export const BLINK_STEPS = 5
/** The next monster starts walking up this long after the kill */
export const WALK_IN_DELAY_MS = 400
/** and takes this long to reach its place */
export const WALK_IN_MS = 350
/** from this far back up the road, as a share of its box */
export const WALK_IN_FROM = 0.3

/** The tap strike for the claws' tier: plain steel, then gold, then ember */
export function slashSprite(tier: ClawTier): SpriteId {
  return `fx_slash-${tier}_anim` as SpriteId
}

/** How long a strip takes to play once, in ms */
export function stripMs(id: SpriteId): number {
  const def = SPRITES[id]
  return def.fps > 0 ? Math.round((def.frames * 1000) / def.fps) : 0
}
