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

/** The tap strike for the claws' tier: plain steel, then gold, then ember */
export function slashSprite(tier: ClawTier): SpriteId {
  return `fx_slash-${tier}_anim` as SpriteId
}

/** How long a strip takes to play once, in ms */
export function stripMs(id: SpriteId): number {
  const def = SPRITES[id]
  return def.fps > 0 ? Math.round((def.frames * 1000) / def.fps) : 0
}
