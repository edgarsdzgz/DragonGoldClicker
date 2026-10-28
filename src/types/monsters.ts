import type { GameState } from './state'
import { roundInsp } from './utils'
import { MONSTERS } from './monsterRoster'
import type { MonsterDef } from './monsterRoster'
import { pickNextMonster } from './spawnPool'
import { hordeStrength } from './horde'
import { tapDamageNow } from './claws'
import { VARN_BREATH_TAPS } from './allies'

export { MONSTERS } from './monsterRoster'
export type { MonsterDef } from './monsterRoster'

// =============================================================================
// THE MONSTER (layer 2e): always one at the gate; taps and fighters both wear it down
// =============================================================================

/** Damage per tap at the start */
export const STARTING_TAP_DAMAGE = 1
export const FIRST_MONSTER_HP = MONSTERS[0].hp

/**
 * A monster as the horde sends it at its current strength (the balance pass, 2026-10-26): HP
 * grows with the horde level (whole HP), the bounty follows the HP so every HP still pays the
 * same, and the wall strike grows by the same factor. Level 1 is the roster as written.
 */
export function hordeMonster(def: MonsterDef, hordeKills: number): MonsterDef {
  const k = hordeStrength(hordeKills)
  if (k === 1) return def
  const hp = Math.round(def.hp * k)
  return { ...def, hp, bounty: roundInsp((def.bounty * hp) / def.hp), wallStrike: roundHp(def.wallStrike * k) }
}

/** The monster at this roster index, at the horde's strength */
export function monsterAt(index: number, hordeKills: number): MonsterDef {
  return hordeMonster(MONSTERS[Math.max(0, Math.min(MONSTERS.length - 1, index))], hordeKills)
}

/** The monster at the gate, at the horde's strength */
export function currentMonster(s: Pick<GameState, 'monsterIndex' | 'hordeKills'>): MonsterDef {
  return monsterAt(s.monsterIndex, s.hordeKills)
}

/** HP is fractional (fighters chip a quarter at a time); round away float drift */
export function roundHp(hp: number): number {
  return Math.round(hp * 100) / 100
}

/** HP as a whole number for text: rounded up, so a monster still standing never reads 0 */
export function shownHp(hp: number): number {
  return Math.ceil(roundHp(hp))
}

/** The monster's resting pose: wounded once its HP is at or below a third of max, else walking */
export function restingPose(hp: number, max: number): 'idle' | 'hurt' {
  return hp * 3 <= max ? 'hurt' : 'idle'
}

export interface StrikeResult {
  state: GameState
  /** The monster that was struck (before any kill moved on to the next) */
  monster: MonsterDef
  dealt: number
  killed: boolean
  bounty: number
}

/**
 * Damage the monster on the field. A kill pays the bounty (renown comes only from kills),
 * counts the kill (in total, per monster and toward the horde's advance) and brings in the next monster from the spawn pool
 * at once, so a hit that lands during the visual spawn pause hits the new one. `rand` picks the
 * next monster (types/spawnPool.ts).
 */
export function applyDamage(s: GameState, damage: number, rand: number = Math.random()): StrikeResult {
  const monster = currentMonster(s)
  const hp = s.monsterHp > 0 ? s.monsterHp : monster.hp
  const dealt = Math.min(damage, hp)
  const left = roundHp(hp - damage)

  if (left > 0) {
    return { state: { ...s, monsterHp: left }, monster, dealt, killed: false, bounty: 0 }
  }

  const kills = Math.floor(s.monstersDefeated) + 1
  const hordeKills = Math.floor(s.hordeKills) + 1
  const killsByMonster = { ...s.killsByMonster, [monster.id]: (s.killsByMonster[monster.id] ?? 0) + 1 }
  const monsterIndex = pickNextMonster({ hordeKills, killsByMonster }, rand)
  return {
    state: {
      ...s,
      inspiration: roundInsp(s.inspiration + monster.bounty),
      totalInspirationEarned: roundInsp(s.totalInspirationEarned + monster.bounty),
      monstersDefeated: kills,
      killsByMonster,
      hordeKills,
      monsterIndex,
      // The next monster comes at the horde's new strength
      monsterHp: monsterAt(monsterIndex, hordeKills).hp,
      // The new monster's wall-strike clock starts from its arrival
      siegeTimer: 0,
      // A boss or mini-boss falling is a story trigger (chapter 13)
      lastBossFellAt: monster.rank === 'boss' || monster.rank === 'miniboss' ? s.playSeconds : s.lastBossFellAt,
    },
    monster,
    dealt,
    killed: true,
    bounty: monster.bounty,
  }
}

/** One tap: the player's strike, counted as a click */
export function strike(s: GameState, damage: number = tapDamageNow(s), rand?: number): StrikeResult {
  const r = applyDamage(s, damage, rand)
  return { ...r, state: { ...r.state, totalClicks: s.totalClicks + 1 } }
}

/** The fighters' swings that landed this tick; a kill by them is counted as theirs */
export function fighterStrike(s: GameState, damage: number, swings: number, rand?: number): StrikeResult {
  const r = applyDamage(s, damage, rand)
  return {
    ...r,
    state: {
      ...r.state,
      allyStrikes: s.allyStrikes + swings,
      allyKills: s.allyKills + (r.killed ? 1 : 0),
    },
  }
}

/** Varn's breath (chapter 9): VARN_BREATH_TAPS of the player's taps; a kill by him is counted as an ally's */
export function varnBreath(s: GameState, rand?: number): StrikeResult {
  const r = applyDamage(s, tapDamageNow(s) * VARN_BREATH_TAPS, rand)
  return {
    ...r,
    state: { ...r.state, varnBreaths: s.varnBreaths + 1, allyKills: s.allyKills + (r.killed ? 1 : 0) },
  }
}

/** The text a screen reader gets for the battlefield */
export function monsterLabel(s: Pick<GameState, 'monsterIndex' | 'monsterHp' | 'hordeKills'>): string {
  const m = currentMonster(s)
  const rank = m.rank === 'elite' ? 'Elite ' : m.rank === 'miniboss' ? 'Mini-boss ' : m.rank === 'boss' ? 'Boss ' : ''
  return `${rank}${m.name}, ${shownHp(s.monsterHp)} of ${m.hp} HP. Tap to strike`
}
