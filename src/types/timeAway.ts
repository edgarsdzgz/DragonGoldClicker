import type { GameState } from './state'
import { isSystemOn } from './systems'
import { MAX_CITY_HP, repairRateNow } from './siege'
import { WALL_STRIKE_SEC } from './wall'
import { armyKillSeconds, toughestInPool } from './army'
import { currentMonster } from './monsters'
import { wallBlowShare } from './allies'

// =============================================================================
// THE WALL WHILE YOU ARE AWAY (chapter 5 phase C, approved 2026-10-26)
// =============================================================================
// Time away follows the army readout. An army that kills the toughest monster before its first
// strike keeps the wall whole; one that does not lets strikes through, and the wall wears down
// while the player is away (repairers count). It never ends below AWAY_WALL_FLOOR, so the player
// never comes back to a Breach. Renown earned while away is unchanged (useStorage).

/** The wall never wears below this while the player is away (or below where it was left, if lower) */
export const AWAY_WALL_FLOOR = 50

export interface WallAway {
  hpBefore: number
  hpAfter: number
  /** Whether the army kills the toughest monster before it strikes */
  held: boolean
  /** Who wore at the wall: "the orcs" (the toughest the horde sends), or "the Minotaur" (one holding the gate) */
  foe: string
}

/** The wall after this many seconds away; null before the siege has begun */
export function wallWhileAway(s: GameState, seconds: number): WallAway | null {
  if (!isSystemOn(s, 'siege')) return null
  // A mini-boss or boss holding the gate stays until it falls, and nothing is killed while away
  const facing = currentMonster(s)
  const monster = facing.rank === 'boss' || facing.rank === 'miniboss' ? facing : toughestInPool(s)
  const killSec = armyKillSeconds(s, monster)
  const held = killSec < WALL_STRIKE_SEC
  // One monster after another: each strikes every WALL_STRIKE_SEC for as long as it lives
  const strikesPerSec = Number.isFinite(killSec) ? Math.floor(killSec / WALL_STRIKE_SEC) / killSec : 1 / WALL_STRIKE_SEC
  const change = (repairRateNow(s) - monster.wallStrike * wallBlowShare(s) * strikesPerSec) * seconds
  const floor = Math.min(s.cityHp, AWAY_WALL_FLOOR)
  const hpAfter = Math.min(MAX_CITY_HP, Math.max(floor, s.cityHp + change))
  const one = monster.rank === 'boss' || monster.rank === 'miniboss'
  return { hpBefore: s.cityHp, hpAfter, held, foe: `the ${one ? monster.name : monster.plural}` }
}

/** The line on the Welcome Back card */
export function wallAwayLine(w: WallAway): string {
  if (w.held) return 'Your army held the Gate.'
  const from = Math.round(w.hpBefore)
  const to = Math.round(w.hpAfter)
  const foe = w.foe.charAt(0).toUpperCase() + w.foe.slice(1)
  if (to < from) return `${foe} wore the wall down from ${from} to ${to} while you were away.`
  return `${foe} struck at the wall while you were away, but the repairers kept it standing.`
}
