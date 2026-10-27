import { MAP_GATE } from './manifest'
import type { SpriteId } from './manifest'

// =============================================================================
// THE WALL'S LIFE: fighters on the wall walk, monsters striking it, repairs and the breach
// =============================================================================

const GATE = MAP_GATE.gate

/** A fighter's sprite height, in art pixels: its feet stand on the wall walk */
const FIGHTER_H = 20
/** The wall walk, in the map's pixels: the row the fighters stand on, behind the battlements */
const WALL_WALK_Y = GATE.y + 12

/** Where fighters stand (left edges in map pixels), filled inner left, inner right, then the outer two */
const WALL_SLOTS = [24, 96, 4, 113]

/** At most this many fighters stand on the wall; the rest of the army is the number in the chips */
export const MAX_WALL_FIGHTERS = WALL_SLOTS.length

/** The fighters shown on the wall for an army of this size, as top-left map pixels */
export function wallFighters(army: number): { x: number; y: number }[] {
  // The slots themselves cap the count
  return WALL_SLOTS.slice(0, Math.max(0, Math.floor(army))).map((x) => ({ x, y: WALL_WALK_Y - FIGHTER_H }))
}

/** The fighter's sprite: standing, or jabbing while a volley lands */
export function fighterSprite(jabbing: boolean): SpriteId {
  return jabbing ? 'ppl_fighter_attack_anim' : 'ppl_fighter_idle'
}

/** Where a monster's blow lands on the wall (a center in map pixels), across the gatehouse */
export function impactPoint(rand: number): { x: number; y: number } {
  return { x: Math.round(GATE.x + 45 + rand * 40), y: GATE.y + 22 }
}

/** The middle of the gate box, where the wall-falls strip (the gate box's size) is centered */
export const BREACH_CENTER = { x: GATE.x + GATE.width / 2, y: GATE.y + GATE.height / 2 }

/** Where the repair sparkles work on the wall face (top-left map pixels) */
export const REPAIR_SPOTS = [{ x: 26, y: GATE.y + 14 }, { x: 92, y: GATE.y + 16 }]

/** Repairers are at work: the siege is on, someone is directed, and the wall is not whole or fallen */
export function repairing(siegeOn: boolean, repairers: number, hp: number, max: number): boolean {
  return siegeOn && repairers > 0 && hp > 0 && hp < max
}

export interface WallReading {
  hp: number
  breaches: number
  /** The game's start time: a new game or a loaded save moves the HP without a blow */
  startedAt: number
}

/** What happened to the wall between two readings: it fell, it was struck, or nothing to show */
export function wallChange(prev: WallReading, next: WallReading): 'breach' | 'struck' | null {
  if (prev.startedAt !== next.startedAt) return null
  if (next.breaches > prev.breaches) return 'breach'
  if (next.hp < prev.hp) return 'struck'
  return null
}
